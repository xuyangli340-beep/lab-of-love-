import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { candidateResult, userProfileRecord } from '../../database/schema';
import type { CandidateResult } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
  ) {}

  async get(userId: string): Promise<CandidateResult | null> {
    this.logger.log(`获取候选结果: userId=${userId}`);
    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) {
      this.logger.warn(`用户档案不存在: userId=${userId}`);
      return null;
    }
    const records = await this.db
      .select()
      .from(candidateResult)
      .where(eq(candidateResult.userProfileId, profile.id));
    if (records.length === 0) return null;
    return this.mapToDto(records[0]);
  }

  async save(
    userId: string,
    poolSize: number,
    resultsJson: string,
  ): Promise<{ id: string; success: true }> {
    this.logger.log(`保存候选结果: userId=${userId}, poolSize=${poolSize}`);
    const profile = await this.userProfileService.getOrCreate(userId);
    const existing = await this.db
      .select()
      .from(candidateResult)
      .where(eq(candidateResult.userProfileId, profile.id));

    if (existing.length > 0) {
      const updated = await this.db
        .update(candidateResult)
        .set({ poolSize, resultsJson })
        .where(eq(candidateResult.id, existing[0].id))
        .returning({ id: candidateResult.id });
      this.logger.log(`候选结果已更新: id=${updated[0].id}`);
      return { id: updated[0].id, success: true };
    }

    const inserted = await this.db
      .insert(candidateResult)
      .values({
        userProfileId: profile.id,
        poolSize,
        resultsJson,
      })
      .returning({ id: candidateResult.id });
    this.logger.log(`候选结果已创建: id=${inserted[0].id}`);
    return { id: inserted[0].id, success: true };
  }

  async select(
    userId: string,
    candidateId: string,
  ): Promise<{ success: true }> {
    this.logger.log(`选定候选: userId=${userId}, candidateId=${candidateId}`);
    const profile = await this.userProfileService.getOrCreate(userId);
    const existing = await this.db
      .select()
      .from(candidateResult)
      .where(eq(candidateResult.userProfileId, profile.id));

    if (existing.length > 0) {
      await this.db
        .update(candidateResult)
        .set({ selectedCandidateId: candidateId })
        .where(eq(candidateResult.id, existing[0].id));
    } else {
      await this.db.insert(candidateResult).values({
        userProfileId: profile.id,
        poolSize: 0,
        resultsJson: '',
        selectedCandidateId: candidateId,
      });
    }
    return { success: true };
  }

  private mapToDto(row: typeof candidateResult.$inferSelect): CandidateResult {
    return {
      id: row.id,
      userProfileId: row.userProfileId,
      poolSize: row.poolSize ?? 0,
      resultsJson: row.resultsJson ?? '',
      selectedCandidateId: row.selectedCandidateId ?? '',
    };
  }
}
