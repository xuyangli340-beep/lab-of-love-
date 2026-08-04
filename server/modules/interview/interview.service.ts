import { Inject, Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { interviewRecord, interviewAnswer, userProfileRecord } from '../../database/schema';
import type { InterviewRecord, InterviewAnswer } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getCurrent(userId: string): Promise<InterviewRecord | null> {
    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) return null;

    const records = await this.db
      .select()
      .from(interviewRecord)
      .where(eq(interviewRecord.userProfileId, profile.id))
      .limit(1);

    if (records.length === 0) return null;
    return this.mapRecordToDto(records[0]);
  }

  async create(userId: string): Promise<{ id: string; status: string }> {
    const profile = await this.userProfileService.getOrCreate(userId);

    const inserted = await this.db
      .insert(interviewRecord)
      .values({
        userProfileId: profile.id,
        status: 'in_progress',
      })
      .returning({ id: interviewRecord.id, status: interviewRecord.status });

    this.logger.log(`Created interview record for user: ${userId}`);
    return { id: inserted[0].id, status: inserted[0].status || 'in_progress' };
  }

  async getAnswers(userId: string): Promise<{ items: InterviewAnswer[] }> {
    const profile = await this.userProfileService.getOrCreate(userId);

    const records = await this.db
      .select()
      .from(interviewRecord)
      .where(eq(interviewRecord.userProfileId, profile.id))
      .limit(1);

    if (records.length === 0) {
      return { items: [] };
    }

    const answers = await this.db
      .select()
      .from(interviewAnswer)
      .where(eq(interviewAnswer.interviewRecordId, records[0].id));

    return { items: answers.map((a: typeof interviewAnswer.$inferSelect) => this.mapAnswerToDto(a)) };
  }

  async updateAnswer(
    userId: string,
    answerId: string,
    data: Partial<InterviewAnswer>,
  ): Promise<{ success: boolean; answer: InterviewAnswer }> {
    const profile = await this.userProfileService.getOrCreate(userId);

    // Verify answer belongs to user
    const answerRecords = await this.db
      .select()
      .from(interviewAnswer)
      .innerJoin(interviewRecord, eq(interviewAnswer.interviewRecordId, interviewRecord.id))
      .where(
        and(
          eq(interviewAnswer.id, answerId),
          eq(interviewRecord.userProfileId, profile.id),
        ),
      );

    if (answerRecords.length === 0) {
      throw new ForbiddenException('答题记录不存在或无权限访问');
    }

    const updateData: Record<string, unknown> = {};
    if (data.answerText !== undefined) updateData.answerText = data.answerText;
    if (data.status !== undefined) updateData.status = data.status;

    if (Object.keys(updateData).length === 0) {
      return { success: true, answer: this.mapAnswerToDto(answerRecords[0].interview_answer) };
    }

    const updated = await this.db
      .update(interviewAnswer)
      .set(updateData)
      .where(eq(interviewAnswer.id, answerId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('答题记录不存在');
    }

    return { success: true, answer: this.mapAnswerToDto(updated[0]) };
  }

  async getOrCreateAnswer(
    userId: string,
    interviewRecordId: string,
    moduleIndex: number,
    questionIndex: number,
    questionText: string,
  ): Promise<InterviewAnswer> {
    const profile = await this.userProfileService.getOrCreate(userId);

    // Verify interview record belongs to user
    const records = await this.db
      .select()
      .from(interviewRecord)
      .where(
        and(
          eq(interviewRecord.id, interviewRecordId),
          eq(interviewRecord.userProfileId, profile.id),
        ),
      );

    if (records.length === 0) {
      throw new ForbiddenException('访谈记录不存在或无权限访问');
    }

    const existing = await this.db
      .select()
      .from(interviewAnswer)
      .where(
        and(
          eq(interviewAnswer.interviewRecordId, interviewRecordId),
          eq(interviewAnswer.moduleIndex, moduleIndex),
          eq(interviewAnswer.questionIndex, questionIndex),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return this.mapAnswerToDto(existing[0]);
    }

    const inserted = await this.db
      .insert(interviewAnswer)
      .values({
        interviewRecordId,
        moduleIndex,
        questionIndex,
        questionText,
        status: 'unanswered',
      })
      .returning();

    return this.mapAnswerToDto(inserted[0]);
  }

  private mapRecordToDto(row: typeof interviewRecord.$inferSelect): InterviewRecord {
    return {
      id: row.id,
      userProfileId: row.userProfileId,
      fullTranscript: row.fullTranscript || '',
      audioUrl: row.audioUrl || '',
      status: row.status || 'in_progress',
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
    };
  }

  private mapAnswerToDto(row: typeof interviewAnswer.$inferSelect): InterviewAnswer {
    return {
      id: row.id,
      interviewRecordId: row.interviewRecordId,
      moduleIndex: row.moduleIndex,
      questionIndex: row.questionIndex,
      questionText: row.questionText || '',
      answerText: row.answerText || '',
      status: (row.status as InterviewAnswer['status']) || 'unanswered',
    };
  }
}
