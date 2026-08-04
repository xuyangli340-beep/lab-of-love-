import { Inject, Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { teamSelection } from '../../database/schema';
import type { TeamSelection } from '@shared/api.interface';
import { UserProfileService } from '../user-profile/user-profile.service';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getSelections(userId: string): Promise<{ items: TeamSelection[] }> {
    this.logger.log(`获取团队选择: userId=${userId}`);
    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) {
      return { items: [] };
    }
    const records = await this.db
      .select()
      .from(teamSelection)
      .where(eq(teamSelection.userProfileId, profile.id));
    return {
      items: records.map((row: typeof teamSelection.$inferSelect) => this.mapToDto(row)),
    };
  }

  async save(
    userId: string,
    role: string,
    staffName: string,
    staffInfo: string,
  ): Promise<{ id: string; success: true }> {
    this.logger.log(`保存团队选择: userId=${userId}, role=${role}`);
    const profile = await this.userProfileService.getOrCreate(userId);
    const existing = await this.db
      .select()
      .from(teamSelection)
      .where(and(
        eq(teamSelection.userProfileId, profile.id),
        eq(teamSelection.role, role),
      ));

    if (existing.length > 0) {
      const updated = await this.db
        .update(teamSelection)
        .set({ staffName, staffInfo })
        .where(eq(teamSelection.id, existing[0].id))
        .returning({ id: teamSelection.id });
      this.logger.log(`团队选择已更新: id=${updated[0].id}`);
      return { id: updated[0].id, success: true };
    }

    const inserted = await this.db
      .insert(teamSelection)
      .values({
        userProfileId: profile.id,
        role,
        staffName,
        staffInfo,
      })
      .returning({ id: teamSelection.id });
    this.logger.log(`团队选择已创建: id=${inserted[0].id}`);
    return { id: inserted[0].id, success: true };
  }

  async remove(
    userId: string,
    selectionId: string,
  ): Promise<{ success: true }> {
    this.logger.log(`删除团队选择: userId=${userId}, selectionId=${selectionId}`);
    const profile = await this.userProfileService.getByUserId(userId);
    if (!profile) {
      throw new NotFoundException('用户档案不存在');
    }
    const records = await this.db
      .select()
      .from(teamSelection)
      .where(eq(teamSelection.id, selectionId));
    if (records.length === 0) {
      throw new NotFoundException('团队选择不存在');
    }
    if (records[0].userProfileId !== profile.id) {
      throw new ForbiddenException('无权删除该团队选择');
    }
    const deleted = await this.db
      .delete(teamSelection)
      .where(eq(teamSelection.id, selectionId))
      .returning({ id: teamSelection.id });
    if (deleted.length === 0) {
      throw new NotFoundException('团队选择不存在');
    }
    return { success: true };
  }

  private mapToDto(row: typeof teamSelection.$inferSelect): TeamSelection {
    return {
      id: row.id,
      userProfileId: row.userProfileId,
      role: row.role,
      staffName: row.staffName ?? '',
      staffInfo: row.staffInfo ?? '',
    };
  }
}
