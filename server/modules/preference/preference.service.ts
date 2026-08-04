import { Inject, Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { preferenceFactor } from '../../database/schema';
import type { PreferenceFactor } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';

interface DefaultFactorSeed {
  factorName: string;
  weight: number;
  isHardConstraint: boolean;
}

const DEFAULT_FACTORS: DefaultFactorSeed[] = [
  { factorName: '沟通能力', weight: 80, isHardConstraint: false },
  { factorName: '诚信可靠', weight: 90, isHardConstraint: true },
  { factorName: '情绪稳定性', weight: 85, isHardConstraint: false },
  { factorName: '外形吸引力', weight: 60, isHardConstraint: false },
  { factorName: '责任感', weight: 85, isHardConstraint: true },
  { factorName: '价值观契合', weight: 95, isHardConstraint: true },
  { factorName: '智力与学识', weight: 75, isHardConstraint: false },
  { factorName: '经济基础', weight: 70, isHardConstraint: false },
  { factorName: '家庭背景', weight: 50, isHardConstraint: false },
  { factorName: '生活习惯契合', weight: 75, isHardConstraint: false },
  { factorName: '兴趣爱好共鸣', weight: 55, isHardConstraint: false },
  { factorName: '性观念契合', weight: 70, isHardConstraint: false },
];

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger(PreferenceService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getList(userId: string): Promise<{ items: PreferenceFactor[] }> {
    const profile = await this.userProfileService.getOrCreate(userId);
    const userProfileId = profile.id;

    const rows = await this.db
      .select()
      .from(preferenceFactor)
      .where(eq(preferenceFactor.userProfileId, userProfileId));

    if (rows.length === 0) {
      this.logger.log(`初始化默认偏好因子: userId=${userId}`);
      const inserted = await this.db
        .insert(preferenceFactor)
        .values(
          DEFAULT_FACTORS.map((f: DefaultFactorSeed) => ({
            userProfileId,
            factorName: f.factorName,
            weight: f.weight,
            isHardConstraint: f.isHardConstraint,
            isCustom: false,
          })),
        )
        .returning();
      return { items: inserted.map((row) => this.mapToDto(row)) };
    }

    return { items: rows.map((row) => this.mapToDto(row)) };
  }

  async update(
    userId: string,
    factorId: string,
    data: Partial<Pick<PreferenceFactor, 'weight' | 'isHardConstraint'>>,
  ): Promise<{ success: boolean; factor: PreferenceFactor }> {
    const profile = await this.userProfileService.getOrCreate(userId);
    const userProfileId = profile.id;

    const existing = await this.db
      .select()
      .from(preferenceFactor)
      .where(and(eq(preferenceFactor.id, factorId), eq(preferenceFactor.userProfileId, userProfileId)));

    if (existing.length === 0) {
      throw new NotFoundException('偏好因子不存在或不属于当前用户');
    }

    const updateData: Record<string, unknown> = {};
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.isHardConstraint !== undefined) updateData.isHardConstraint = data.isHardConstraint;

    if (Object.keys(updateData).length === 0) {
      return { success: true, factor: this.mapToDto(existing[0]) };
    }

    const updated = await this.db
      .update(preferenceFactor)
      .set(updateData)
      .where(eq(preferenceFactor.id, factorId))
      .returning();

    return { success: true, factor: this.mapToDto(updated[0]) };
  }

  async create(
    userId: string,
    data: Omit<PreferenceFactor, 'id' | 'userProfileId'>,
  ): Promise<{ id: string; success: boolean }> {
    const profile = await this.userProfileService.getOrCreate(userId);
    const userProfileId = profile.id;

    if (!data.factorName || !data.factorName.trim()) {
      throw new BadRequestException('因子名称不能为空');
    }

    const inserted = await this.db
      .insert(preferenceFactor)
      .values({
        userProfileId,
        factorName: data.factorName,
        weight: data.weight ?? 50,
        isHardConstraint: data.isHardConstraint ?? false,
        isCustom: true,
      })
      .returning({ id: preferenceFactor.id });

    return { id: inserted[0].id, success: true };
  }

  async remove(userId: string, factorId: string): Promise<{ success: boolean }> {
    const profile = await this.userProfileService.getOrCreate(userId);
    const userProfileId = profile.id;

    const existing = await this.db
      .select()
      .from(preferenceFactor)
      .where(and(eq(preferenceFactor.id, factorId), eq(preferenceFactor.userProfileId, userProfileId)));

    if (existing.length === 0) {
      throw new NotFoundException('偏好因子不存在或不属于当前用户');
    }

    if (!existing[0].isCustom) {
      throw new ForbiddenException('只能删除自定义因子');
    }

    const deleted = await this.db
      .delete(preferenceFactor)
      .where(eq(preferenceFactor.id, factorId))
      .returning({ id: preferenceFactor.id });

    if (deleted.length === 0) {
      throw new NotFoundException('偏好因子不存在');
    }

    return { success: true };
  }

  private mapToDto(row: typeof preferenceFactor.$inferSelect): PreferenceFactor {
    return {
      id: row.id,
      userProfileId: row.userProfileId,
      factorName: row.factorName || '',
      weight: row.weight ?? 0,
      isHardConstraint: row.isHardConstraint ?? false,
      isCustom: row.isCustom ?? false,
    };
  }
}
