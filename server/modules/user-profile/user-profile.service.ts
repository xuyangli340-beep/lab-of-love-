import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { userProfileRecord } from '../../database/schema';
import type { UserProfile } from '@shared/api.interface';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getByUserId(userId: string): Promise<UserProfile | null> {
    const records = await this.db
      .select()
      .from(userProfileRecord)
      .where(eq(userProfileRecord.owner, userId));
    if (records.length === 0) return null;
    return this.mapToDto(records[0]);
  }

  async create(userId: string, data: Partial<UserProfile> = {}): Promise<UserProfile> {
    const inserted = await this.db
      .insert(userProfileRecord)
      .values({
        owner: userId,
        nickname: data.nickname || '',
        gender: data.gender || '',
        age: data.age || 0,
        occupation: data.occupation || '',
        workCity: data.workCity || '',
        settleCity: data.settleCity || '',
        hometown: data.hometown || '',
        familyCity: data.familyCity || '',
        height: data.height || 0,
        weight: data.weight || 0,
        annualIncome: data.annualIncome || '',
        workNature: data.workNature || '',
        maritalStatus: data.maritalStatus || '',
        loveExperience: data.loveExperience || '',
        mbti: data.mbti || '',
        zodiac: data.zodiac || '',
        selfTags: data.selfTags || [],
        hobbies: data.hobbies || [],
        targetGender: data.targetGender || '',
        targetAgeMin: data.targetAgeMin || 0,
        targetAgeMax: data.targetAgeMax || 0,
        targetHeightMin: data.targetHeightMin || 0,
        targetHeightMax: data.targetHeightMax || 0,
        minEducation: data.minEducation || '',
        undergradSchoolPref: data.undergradSchoolPref || '',
        masterSchoolPref: data.masterSchoolPref || '',
        overseasPref: data.overseasPref || '',
        regionMode: data.regionMode || '',
        incomeRequirement: data.incomeRequirement || '',
        marriagePlan: data.marriagePlan || '',
        stylePreference: data.stylePreference || '',
        highestEducation: data.highestEducation || '',
        undergradSchool: data.undergradSchool || '',
        undergradSchoolTier: data.undergradSchoolTier || '',
        undergradMajor: data.undergradMajor || '',
        masterSchool: data.masterSchool || '',
        masterSchoolTier: data.masterSchoolTier || '',
        masterMajor: data.masterMajor || '',
        phdSchool: data.phdSchool || '',
        phdSchoolTier: data.phdSchoolTier || '',
        phdResearch: data.phdResearch || '',
      })
      .returning();
    return this.mapToDto(inserted[0]);
  }

  async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.getByUserId(userId);
    if (!existing) {
      throw new NotFoundException('用户档案不存在');
    }
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      nickname: 'nickname',
      gender: 'gender',
      age: 'age',
      occupation: 'occupation',
      workCity: 'workCity',
      settleCity: 'settleCity',
      hometown: 'hometown',
      familyCity: 'familyCity',
      height: 'height',
      weight: 'weight',
      annualIncome: 'annualIncome',
      workNature: 'workNature',
      maritalStatus: 'maritalStatus',
      loveExperience: 'loveExperience',
      mbti: 'mbti',
      zodiac: 'zodiac',
      selfTags: 'selfTags',
      hobbies: 'hobbies',
      targetGender: 'targetGender',
      targetAgeMin: 'targetAgeMin',
      targetAgeMax: 'targetAgeMax',
      targetHeightMin: 'targetHeightMin',
      targetHeightMax: 'targetHeightMax',
      minEducation: 'minEducation',
      undergradSchoolPref: 'undergradSchoolPref',
      masterSchoolPref: 'masterSchoolPref',
      overseasPref: 'overseasPref',
      regionMode: 'regionMode',
      incomeRequirement: 'incomeRequirement',
      marriagePlan: 'marriagePlan',
      stylePreference: 'stylePreference',
      highestEducation: 'highestEducation',
      undergradSchool: 'undergradSchool',
      undergradSchoolTier: 'undergradSchoolTier',
      undergradMajor: 'undergradMajor',
      masterSchool: 'masterSchool',
      masterSchoolTier: 'masterSchoolTier',
      masterMajor: 'masterMajor',
      phdSchool: 'phdSchool',
      phdSchoolTier: 'phdSchoolTier',
      phdResearch: 'phdResearch',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in data) {
        updateData[col] = (data as Record<string, unknown>)[key];
      }
    }
    const updated = await this.db
      .update(userProfileRecord)
      .set(updateData)
      .where(eq(userProfileRecord.owner, userId))
      .returning();
    if (updated.length === 0) {
      throw new NotFoundException('用户档案不存在');
    }
    return this.mapToDto(updated[0]);
  }

  async getOrCreate(userId: string, nickname?: string): Promise<UserProfile> {
    const existing = await this.getByUserId(userId);
    if (existing) return existing;
    return this.create(userId, { nickname: nickname || '' });
  }

  private mapToDto(row: typeof userProfileRecord.$inferSelect): UserProfile {
    return {
      id: row.id,
      nickname: row.nickname || '',
      gender: row.gender || '',
      age: row.age || 0,
      occupation: row.occupation || '',
      workCity: row.workCity || '',
      settleCity: row.settleCity || '',
      hometown: row.hometown || '',
      familyCity: row.familyCity || '',
      height: row.height || 0,
      weight: row.weight || 0,
      annualIncome: row.annualIncome || '',
      workNature: row.workNature || '',
      maritalStatus: row.maritalStatus || '',
      loveExperience: row.loveExperience || '',
      mbti: row.mbti || '',
      zodiac: row.zodiac || '',
      selfTags: row.selfTags || [],
      hobbies: row.hobbies || [],
      targetGender: row.targetGender || '',
      targetAgeMin: row.targetAgeMin || 0,
      targetAgeMax: row.targetAgeMax || 0,
      targetHeightMin: row.targetHeightMin || 0,
      targetHeightMax: row.targetHeightMax || 0,
      minEducation: row.minEducation || '',
      undergradSchoolPref: row.undergradSchoolPref || '',
      masterSchoolPref: row.masterSchoolPref || '',
      overseasPref: row.overseasPref || '',
      regionMode: row.regionMode || '',
      incomeRequirement: row.incomeRequirement || '',
      marriagePlan: row.marriagePlan || '',
      stylePreference: row.stylePreference || '',
      highestEducation: row.highestEducation || '',
      undergradSchool: row.undergradSchool || '',
      undergradSchoolTier: row.undergradSchoolTier || '',
      undergradMajor: row.undergradMajor || '',
      masterSchool: row.masterSchool || '',
      masterSchoolTier: row.masterSchoolTier || '',
      masterMajor: row.masterMajor || '',
      phdSchool: row.phdSchool || '',
      phdSchoolTier: row.phdSchoolTier || '',
      phdResearch: row.phdResearch || '',
    };
  }
}
