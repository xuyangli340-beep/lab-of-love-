import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { evidenceItem, interviewRecord } from '../../database/schema';
import type { EvidenceItem, EvidenceStats } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';
import { InterviewService } from '../interview/interview.service';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
    private readonly interviewService: InterviewService,
  ) {}

  async getList(userId: string): Promise<{ items: EvidenceItem[] }> {
    const profile = await this.userProfileService.getOrCreate(userId);

    const records = await this.db
      .select()
      .from(interviewRecord)
      .where(eq(interviewRecord.userProfileId, profile.id))
      .limit(1);

    if (records.length === 0) {
      return { items: [] };
    }

    const items = await this.db
      .select()
      .from(evidenceItem)
      .where(eq(evidenceItem.interviewRecordId, records[0].id));

    return { items: items.map((e: typeof evidenceItem.$inferSelect) => this.mapToDto(e)) };
  }

  async create(
    userId: string,
    data: Omit<EvidenceItem, 'id' | 'interviewRecordId'>,
  ): Promise<{ id: string; success: boolean }> {
    const interviewRecordId = await this.ensureInterviewRecord(userId);

    const inserted = await this.db
      .insert(evidenceItem)
      .values({
        interviewRecordId,
        factorName: data.factorName,
        evidenceMeaning: data.evidenceMeaning,
        evidenceStrength: data.evidenceStrength,
        isHardConstraint: data.isHardConstraint,
        isHighPriority: data.isHighPriority,
        isTradeoffEvidence: data.isTradeoffEvidence,
        originalQuotes: data.originalQuotes,
        tags: data.tags,
        followupQuestions: data.followupQuestions,
      })
      .returning({ id: evidenceItem.id });

    this.logger.log(`Created evidence item for user: ${userId}`);
    return { id: inserted[0].id, success: true };
  }

  async batchCreate(
    userId: string,
    items: Array<Omit<EvidenceItem, 'id' | 'interviewRecordId'>>,
  ): Promise<{ success: boolean; count: number }> {
    if (items.length === 0) {
      return { success: true, count: 0 };
    }

    const interviewRecordId = await this.ensureInterviewRecord(userId);

    const values = items.map((item: Omit<EvidenceItem, 'id' | 'interviewRecordId'>) => ({
      interviewRecordId,
      factorName: item.factorName,
      evidenceMeaning: item.evidenceMeaning,
      evidenceStrength: item.evidenceStrength,
      isHardConstraint: item.isHardConstraint,
      isHighPriority: item.isHighPriority,
      isTradeoffEvidence: item.isTradeoffEvidence,
      originalQuotes: item.originalQuotes,
      tags: item.tags,
      followupQuestions: item.followupQuestions,
    }));

    const inserted = await this.db.insert(evidenceItem).values(values).returning({ id: evidenceItem.id });

    this.logger.log(`Batch created ${inserted.length} evidence items for user: ${userId}`);
    return { success: true, count: inserted.length };
  }

  async getStats(userId: string): Promise<EvidenceStats> {
    const profile = await this.userProfileService.getOrCreate(userId);

    const records = await this.db
      .select()
      .from(interviewRecord)
      .where(eq(interviewRecord.userProfileId, profile.id))
      .limit(1);

    if (records.length === 0) {
      return {
        factorCount: 0,
        evidenceCount: 0,
        hardConstraintCount: 0,
        tradeoffCount: 0,
      };
    }

    const recordId = records[0].id;

    // Total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(evidenceItem)
      .where(eq(evidenceItem.interviewRecordId, recordId));
    const evidenceCount = Number(totalResult[0]?.count ?? 0);

    // Hard constraint count
    const hardResult = await this.db
      .select({ count: count() })
      .from(evidenceItem)
      .where(
        and(
          eq(evidenceItem.interviewRecordId, recordId),
          eq(evidenceItem.isHardConstraint, true),
        ),
      );
    const hardConstraintCount = Number(hardResult[0]?.count ?? 0);

    // Tradeoff count
    const tradeoffResult = await this.db
      .select({ count: count() })
      .from(evidenceItem)
      .where(
        and(
          eq(evidenceItem.interviewRecordId, recordId),
          eq(evidenceItem.isTradeoffEvidence, true),
        ),
      );
    const tradeoffCount = Number(tradeoffResult[0]?.count ?? 0);

    // Distinct factor count
    const factorResult = await this.db
      .selectDistinct({ factorName: evidenceItem.factorName })
      .from(evidenceItem)
      .where(eq(evidenceItem.interviewRecordId, recordId));
    const factorCount = factorResult.length;

    return {
      factorCount,
      evidenceCount,
      hardConstraintCount,
      tradeoffCount,
    };
  }

  private async ensureInterviewRecord(userId: string): Promise<string> {
    const current = await this.interviewService.getCurrent(userId);
    if (current) return current.id;
    const created = await this.interviewService.create(userId);
    return created.id;
  }

  private mapToDto(row: typeof evidenceItem.$inferSelect): EvidenceItem {
    return {
      id: row.id,
      interviewRecordId: row.interviewRecordId,
      factorName: row.factorName || '',
      evidenceMeaning: row.evidenceMeaning || '',
      evidenceStrength: row.evidenceStrength ?? 0,
      isHardConstraint: row.isHardConstraint ?? false,
      isHighPriority: row.isHighPriority ?? false,
      isTradeoffEvidence: row.isTradeoffEvidence ?? false,
      originalQuotes: row.originalQuotes || [],
      tags: row.tags || [],
      followupQuestions: row.followupQuestions || [],
    };
  }
}
