import { useState, useEffect, useCallback } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Heart, Sparkles, UserCheck } from 'lucide-react';
import { teamApi } from '@client/src/api/index';
import type { TeamSelection } from '@shared/api.interface';
import StaffCard from './StaffCard';
import TeamSummaryBar from './TeamSummaryBar';
import PosterSection from './PosterSection';
import { ALL_STAFF, ROLE_TABS } from './staff-data';
import type { StaffMember, RoleKey } from './staff-data';

const WizardTeamPage = () => {
  const [activeTab, setActiveTab] = useState<RoleKey>('interviewer');
  const [selections, setSelections] = useState<Record<RoleKey, StaffMember | null>>({
    interviewer: null,
    model_advisor: null,
    director: null,
  });
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<RoleKey | null>(null);

  // 加载已保存的选择
  useEffect(() => {
    const loadSelections = async () => {
      try {
        const response = await teamApi.getSelections();
        const items: TeamSelection[] = response.items;
        const newSelections: Record<RoleKey, StaffMember | null> = {
          interviewer: null,
          model_advisor: null,
          director: null,
        };
        for (const item of items) {
          const role = item.role as RoleKey;
          if (role in ALL_STAFF) {
            const found = ALL_STAFF[role].find(
              (s: StaffMember) => s.name === item.staffName,
            );
            if (found) {
              newSelections[role] = found;
            }
          }
        }
        setSelections(newSelections);
      } catch (error) {
        logger.error('加载团队选择失败', String(error));
      } finally {
        setLoading(false);
      }
    };
    loadSelections();
  }, []);

  // 切换选择
  const handleToggle = useCallback(
    async (staff: StaffMember) => {
      const role = staff.role as RoleKey;
      const current = selections[role];
      const isSelected = current?.id === staff.id;

      setSavingRole(role);

      try {
        if (isSelected) {
          // 取消选择
          const response = await teamApi.getSelections();
          const items: TeamSelection[] = response.items;
          const existing = items.find(
            (item: TeamSelection) =>
              item.role === role && item.staffName === staff.name,
          );
          if (existing) {
            await teamApi.remove(existing.id);
          }
          setSelections((prev) => ({ ...prev, [role]: null }));
        } else {
          // 选择新的：先删旧的，再保存新的
          const response = await teamApi.getSelections();
          const items: TeamSelection[] = response.items;
          const oldSelection = items.find(
            (item: TeamSelection) => item.role === role,
          );
          if (oldSelection) {
            await teamApi.remove(oldSelection.id);
          }
          await teamApi.save(
            role,
            staff.name,
            JSON.stringify({
              education: staff.education,
              experience: staff.experience,
              specialties: staff.specialties,
              trackRecord: staff.trackRecord,
              avatarColor: staff.avatarColor,
            }),
          );
          setSelections((prev) => ({ ...prev, [role]: staff }));
        }
      } catch (error) {
        logger.error('保存团队选择失败', String(error));
      } finally {
        setSavingRole(null);
      }
    },
    [selections],
  );

  // 从汇总栏触发生成（滚动到海报区并触发）
  const handleGenerateFromBar = useCallback(() => {
    const posterSection = document.getElementById('poster-section');
    if (posterSection) {
      posterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // 找到生成按钮并触发点击
    setTimeout(() => {
      const generateBtn = document.querySelector(
        '[data-poster-generate]',
      ) as HTMLButtonElement | null;
      if (generateBtn) {
        generateBtn.click();
      }
    }, 600);
  }, []);

  const currentStaff = ALL_STAFF[activeTab];
  const activeTabInfo = ROLE_TABS.find((t) => t.key === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* 页面标题 */}
      <div className="text-center mb-10">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(220,90,163,0.12), rgba(146,90,213,0.12))',
            color: '#925ad5',
          }}
        >
          Step 6 · 服务团队
        </span>
        <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-3">
          选择您的专属服务团队
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          三位专业顾问组成专属服务小组，从深度访谈到模型匹配，全程为您的理性心动保驾护航
        </p>
      </div>

      {/* 角色 Tab 切换 */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-1 p-1 bg-accent/50 rounded-full">
          {ROLE_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon =
              tab.key === 'interviewer'
                ? Heart
                : tab.key === 'model_advisor'
                  ? Sparkles
                  : UserCheck;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-primary-gradient bg-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.label.substring(0, 4)}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: 'var(--primary-gradient)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前角色说明 */}
      <div className="bg-white rounded-[28px] p-6 shadow-sm mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(220,90,163,0.15), rgba(146,90,213,0.15))',
            }}
          >
            {activeTab === 'interviewer' && (
              <Heart className="w-6 h-6 text-primary" />
            )}
            {activeTab === 'model_advisor' && (
              <Sparkles className="w-6 h-6 text-primary" />
            )}
            {activeTab === 'director' && (
              <UserCheck className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-foreground mb-1">
              {activeTabInfo?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'interviewer' &&
                '负责深度访谈与需求挖掘，通过专业心理学方法帮您梳理真实的择偶偏好与核心需求，建立信任关系。'}
              {activeTab === 'model_advisor' &&
                '负责匹配模型的个性化调优，根据您的偏好权重和反馈动态调整算法参数，确保推荐精准度。'}
              {activeTab === 'director' &&
                '全程统筹服务质量，协调团队资源，把控服务进度，确保您的匹配之旅高效、顺畅、满意。'}
            </p>
          </div>
        </div>
      </div>

      {/* 员工卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
        {currentStaff.map((staff: StaffMember) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            isSelected={selections[activeTab]?.id === staff.id}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* 海报生成区 */}
      <div id="poster-section" data-poster-section>
        <PosterSection selections={selections} />
      </div>

      {/* 底部 sticky 团队汇总栏 */}
      <TeamSummaryBar
        selections={selections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onGenerate={handleGenerateFromBar}
      />

      {/* 保存中状态指示 */}
      {savingRole && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-foreground/90 text-white text-sm rounded-full shadow-lg backdrop-blur-sm">
          保存中...
        </div>
      )}
    </div>
  );
};

export default WizardTeamPage;
