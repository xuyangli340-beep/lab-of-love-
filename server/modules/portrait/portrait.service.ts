import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { idealPortrait, preferenceFactor } from '../../database/schema';
import type { IdealPortrait, PreferenceFactor, UserProfile } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';

interface PortraitGenerationData {
  title: string;
  summary: string;
  tags: string[];
  heartScoreMin: number;
  heartScoreMax: number;
  stabilityScoreMin: number;
  stabilityScoreMax: number;
  reachabilityScoreMin: number;
  reachabilityScoreMax: number;
}

@Injectable()
export class PortraitService {
  private readonly logger = new Logger(PortraitService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
  ) {}

  async get(userId: string): Promise<IdealPortrait | null> {
    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) return null;

    const rows = await this.db
      .select()
      .from(idealPortrait)
      .where(eq(idealPortrait.userProfileId, profile.id));

    if (rows.length === 0) return null;
    return this.mapToDto(rows[0]);
  }

  async generate(userId: string): Promise<{ id: string; portrait: IdealPortrait }> {
    const profile = await this.userProfileService.getOrCreate(userId);
    const userProfileId = profile.id;

    const factors = await this.db
      .select()
      .from(preferenceFactor)
      .where(eq(preferenceFactor.userProfileId, userProfileId));

    const factorDtos: PreferenceFactor[] = factors.map((f) => ({
      id: f.id,
      userProfileId: f.userProfileId,
      factorName: f.factorName || '',
      weight: f.weight ?? 0,
      isHardConstraint: f.isHardConstraint ?? false,
      isCustom: f.isCustom ?? false,
    }));

    const generated = this.generatePortraitContent(profile, factorDtos);

    const existing = await this.db
      .select()
      .from(idealPortrait)
      .where(eq(idealPortrait.userProfileId, userProfileId));

    let resultRow: typeof idealPortrait.$inferSelect;

    if (existing.length > 0) {
      const updated = await this.db
        .update(idealPortrait)
        .set({
          title: generated.title,
          summary: generated.summary,
          tags: generated.tags,
          heartScoreMin: generated.heartScoreMin,
          heartScoreMax: generated.heartScoreMax,
          stabilityScoreMin: generated.stabilityScoreMin,
          stabilityScoreMax: generated.stabilityScoreMax,
          reachabilityScoreMin: generated.reachabilityScoreMin,
          reachabilityScoreMax: generated.reachabilityScoreMax,
        })
        .where(eq(idealPortrait.id, existing[0].id))
        .returning();
      resultRow = updated[0];
      this.logger.log(`更新理想画像: userId=${userId}, portraitId=${resultRow.id}`);
    } else {
      const inserted = await this.db
        .insert(idealPortrait)
        .values({
          userProfileId,
          title: generated.title,
          summary: generated.summary,
          tags: generated.tags,
          heartScoreMin: generated.heartScoreMin,
          heartScoreMax: generated.heartScoreMax,
          stabilityScoreMin: generated.stabilityScoreMin,
          stabilityScoreMax: generated.stabilityScoreMax,
          reachabilityScoreMin: generated.reachabilityScoreMin,
          reachabilityScoreMax: generated.reachabilityScoreMax,
        })
        .returning();
      resultRow = inserted[0];
      this.logger.log(`生成理想画像: userId=${userId}, portraitId=${resultRow.id}`);
    }

    return { id: resultRow.id, portrait: this.mapToDto(resultRow) };
  }

  async submitRating(userId: string, rating: number): Promise<{ success: boolean }> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('评分必须在 1-5 之间');
    }

    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) {
      throw new NotFoundException('用户档案不存在');
    }

    const existing = await this.db
      .select()
      .from(idealPortrait)
      .where(eq(idealPortrait.userProfileId, profile.id));

    if (existing.length === 0) {
      throw new NotFoundException('理想画像不存在，请先生成');
    }

    const updated = await this.db
      .update(idealPortrait)
      .set({ userRating: rating })
      .where(eq(idealPortrait.id, existing[0].id))
      .returning({ id: idealPortrait.id });

    if (updated.length === 0) {
      throw new NotFoundException('理想画像不存在');
    }

    return { success: true };
  }

  async submitFeedback(userId: string, feedback: string): Promise<{ success: boolean }> {
    if (!feedback || !feedback.trim()) {
      throw new BadRequestException('反馈内容不能为空');
    }

    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) {
      throw new NotFoundException('用户档案不存在');
    }

    const existing = await this.db
      .select()
      .from(idealPortrait)
      .where(eq(idealPortrait.userProfileId, profile.id));

    if (existing.length === 0) {
      throw new NotFoundException('理想画像不存在，请先生成');
    }

    const updated = await this.db
      .update(idealPortrait)
      .set({ userFeedback: feedback })
      .where(eq(idealPortrait.id, existing[0].id))
      .returning({ id: idealPortrait.id });

    if (updated.length === 0) {
      throw new NotFoundException('理想画像不存在');
    }

    return { success: true };
  }

  private generatePortraitContent(
    profile: UserProfile,
    factors: PreferenceFactor[],
  ): PortraitGenerationData {
    const highWeightFactors = factors
      .filter((f: PreferenceFactor) => f.weight >= 80)
      .sort((a: PreferenceFactor, b: PreferenceFactor) => b.weight - a.weight);

    const hardConstraintFactors = factors.filter((f: PreferenceFactor) => f.isHardConstraint);

    const targetGender = profile.targetGender === 'male' ? '男性' : profile.targetGender === 'female' ? '女性' : '';
    const ageRange = profile.targetAgeMin && profile.targetAgeMax
      ? `${profile.targetAgeMin}-${profile.targetAgeMax}岁`
      : '';
    const heightRange = profile.targetHeightMin && profile.targetHeightMax
      ? `${profile.targetHeightMin}-${profile.targetHeightMax}cm`
      : '';

    const basicDescParts: string[] = [];
    if (targetGender) basicDescParts.push(targetGender);
    if (ageRange) basicDescParts.push(`年龄在${ageRange}之间`);
    if (heightRange) basicDescParts.push(`身高${heightRange}`);
    if (profile.minEducation) basicDescParts.push(`最低学历${profile.minEducation}`);
    if (profile.incomeRequirement) basicDescParts.push(`收入水平${profile.incomeRequirement}`);

    const regionDesc = this.buildRegionDesc(profile);
    if (regionDesc) basicDescParts.push(regionDesc);

    const basicDesc = basicDescParts.length > 0 ? basicDescParts.join('，') + '。' : '';

    const topFactorNames = highWeightFactors.slice(0, 5).map((f: PreferenceFactor) => f.factorName);
    const hardConstraintNames = hardConstraintFactors.map((f: PreferenceFactor) => f.factorName);

    const coreDesc = topFactorNames.length > 0
      ? `核心吸引力在于${topFactorNames.join('、')}等方面的高度契合。`
      : '追求全方位的平衡与默契。';

    const hardDesc = hardConstraintNames.length > 0
      ? `其中${hardConstraintNames.join('、')}是不可妥协的底线条件。`
      : '';

    const styleDesc = this.buildStyleDesc(profile);
    const marriageDesc = profile.marriagePlan ? `对婚姻有明确规划，期待${profile.marriagePlan}步入稳定关系。` : '';

    const summaryCandidates = [
      `这是一位${basicDesc ? basicDesc.replace('。', '') : '理想中的伴侣'}。`,
      coreDesc,
      hardDesc,
      styleDesc,
      marriageDesc,
      `两个人在一起，不仅是生活的叠加，更是精神世界的共鸣与成长。`,
    ].filter(Boolean);

    let summary = summaryCandidates.join('');

    if (summary.length < 200) {
      summary = summary + '这份画像基于你的偏好权重与硬约束条件综合生成，反映了你内心深处对理想伴侣的真实期待。理性的框架之下，藏着对心动与稳定的双重渴望。';
    }
    if (summary.length > 300) {
      summary = summary.slice(0, 297) + '...';
    }

    const title = this.buildTitle(profile, highWeightFactors);

    const tags = this.buildTags(profile, highWeightFactors, hardConstraintFactors);

    const avgWeight = factors.length > 0
      ? factors.reduce((sum: number, f: PreferenceFactor) => sum + f.weight, 0) / factors.length
      : 60;

    const hardCount = hardConstraintFactors.length;
    const customCount = factors.filter((f: PreferenceFactor) => f.isCustom).length;

    const heartScoreMin = Math.max(40, Math.min(85, Math.round(avgWeight - 10 + customCount * 2)));
    const heartScoreMax = Math.min(98, heartScoreMin + 15 + Math.floor(highWeightFactors.length * 2));

    const stabilityScoreMin = Math.max(45, Math.min(80, 50 + hardCount * 5));
    const stabilityScoreMax = Math.min(95, stabilityScoreMin + 15 + Math.floor(hardCount * 2));

    const reachabilityBase = 100 - (hardCount * 3 + highWeightFactors.length * 2);
    const reachabilityScoreMin = Math.max(30, Math.min(75, reachabilityBase - 10));
    const reachabilityScoreMax = Math.min(90, reachabilityBase + 10);

    return {
      title,
      summary,
      tags,
      heartScoreMin,
      heartScoreMax,
      stabilityScoreMin,
      stabilityScoreMax,
      reachabilityScoreMin,
      reachabilityScoreMax,
    };
  }

  private buildTitle(profile: UserProfile, highWeightFactors: PreferenceFactor[]): string {
    const topFactor = highWeightFactors[0];
    const secondFactor = highWeightFactors[1];

    const genderWord = profile.targetGender === 'male' ? '先生' : profile.targetGender === 'female' ? '女士' : '伴侣';

    if (topFactor && secondFactor) {
      return `${topFactor.factorName}与${secondFactor.factorName}兼具的理想${genderWord}`;
    }
    if (topFactor) {
      return `以${topFactor.factorName}为核心的理想${genderWord}`;
    }
    return `你的理想${genderWord}画像`;
  }

  private buildTags(
    profile: UserProfile,
    highWeightFactors: PreferenceFactor[],
    hardConstraintFactors: PreferenceFactor[],
  ): string[] {
    const tags: string[] = [];

    if (profile.targetAgeMin && profile.targetAgeMax) {
      tags.push(`${profile.targetAgeMin}-${profile.targetAgeMax}岁`);
    }
    if (profile.minEducation) {
      tags.push(profile.minEducation + '以上');
    }
    if (profile.targetHeightMin && profile.targetHeightMax) {
      tags.push(`${profile.targetHeightMin}cm+`);
    }

    for (const f of highWeightFactors) {
      if (tags.length >= 8) break;
      if (!tags.includes(f.factorName)) {
        tags.push(f.factorName);
      }
    }

    for (const f of hardConstraintFactors) {
      if (tags.length >= 8) break;
      const tag = f.factorName + '(硬约束)';
      if (!tags.includes(tag) && !tags.includes(f.factorName)) {
        tags.push(tag);
      }
    }

    if (tags.length < 6) {
      const fallbackTags = ['三观契合', '情绪稳定', '真诚靠谱', '有上进心', '温柔体贴', '独立自主'];
      for (const tag of fallbackTags) {
        if (tags.length >= 8) break;
        if (!tags.includes(tag)) tags.push(tag);
      }
    }

    return tags.slice(0, 8);
  }

  private buildRegionDesc(profile: UserProfile): string {
    if (!profile.regionMode) return '';
    switch (profile.regionMode) {
      case 'same_city':
        return profile.workCity ? `希望对方在${profile.workCity}工作生活` : '同城优先';
      case 'same_province':
        return '同省份优先考虑';
      case 'willing_to_relocate':
        return '接受异地，愿意为彼此调整城市';
      case 'no_limit':
        return '地域不限';
      default:
        return '';
    }
  }

  private buildStyleDesc(profile: UserProfile): string {
    if (!profile.stylePreference) return '';
    switch (profile.stylePreference) {
      case 'intellectual':
        return '偏好知性沉稳的气质，享受深度对话与思想碰撞。';
      case 'gentle':
        return '偏爱温柔体贴的类型，渴望被理解与被照顾。';
      case 'energetic':
        return '欣赏阳光开朗的个性，期待一起探索生活的乐趣。';
      case 'mature':
        return '倾向成熟稳重的伴侣，追求稳定可靠的关系。';
      default:
        return '';
    }
  }

  private mapToDto(row: typeof idealPortrait.$inferSelect): IdealPortrait {
    return {
      id: row.id,
      userProfileId: row.userProfileId,
      title: row.title || '',
      summary: row.summary || '',
      tags: row.tags || [],
      heartScoreMin: row.heartScoreMin ?? 0,
      heartScoreMax: row.heartScoreMax ?? 100,
      stabilityScoreMin: row.stabilityScoreMin ?? 0,
      stabilityScoreMax: row.stabilityScoreMax ?? 100,
      reachabilityScoreMin: row.reachabilityScoreMin ?? 0,
      reachabilityScoreMax: row.reachabilityScoreMax ?? 100,
      userRating: row.userRating ?? 0,
      userFeedback: row.userFeedback || '',
    };
  }
}
