import { Body, Controller, Delete, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { TeamService } from './team.service';
import type { TeamSelection } from '@shared/api.interface';

interface SaveTeamBody {
  role: string;
  staffName: string;
  staffInfo: string;
}

@Controller('api/team-selections')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(private readonly teamService: TeamService) {}

  @Get()
  @NeedLogin()
  async getSelections(
    @Req() req: Request,
  ): Promise<{ items: TeamSelection[] }> {
    const { userId } = req.userContext;
    return this.teamService.getSelections(userId);
  }

  @Post()
  @NeedLogin()
  async save(
    @Req() req: Request,
    @Body() body: SaveTeamBody,
  ): Promise<{ id: string; success: true }> {
    const { userId } = req.userContext;
    const { role, staffName, staffInfo } = body;
    return this.teamService.save(userId, role, staffName, staffInfo);
  }

  @Delete(':id')
  @NeedLogin()
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    const { userId } = req.userContext;
    return this.teamService.remove(userId, id);
  }
}
