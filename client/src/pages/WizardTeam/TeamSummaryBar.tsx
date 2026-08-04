import { UserCheck } from 'lucide-react';
import type { StaffMember, RoleKey } from './staff-data';
import { ROLE_TABS } from './staff-data';

interface SummaryItemProps {
  label: string;
  staff: StaffMember | null;
  active?: boolean;
  onClick: () => void;
}

const SummaryItem = ({ label, staff, active, onClick }: SummaryItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-2xl transition-all text-left ${
        active ? 'bg-accent/70' : 'hover:bg-accent/50'
      }`}
    >
      <div className="flex-shrink-0">
        {staff ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ background: staff.avatarColor }}
          >
            {staff.name.charAt(0)}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p
          className={`text-sm font-medium truncate ${
            staff ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {staff ? staff.name : '待选择'}
        </p>
      </div>
    </button>
  );
};

interface TeamSummaryBarProps {
  selections: Record<RoleKey, StaffMember | null>;
  activeTab: RoleKey;
  onTabChange: (tab: RoleKey) => void;
  onGenerate: () => void;
}

const TeamSummaryBar = ({
  selections,
  activeTab,
  onTabChange,
  onGenerate,
}: TeamSummaryBarProps) => {
  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <p className="text-xs text-muted-foreground">已选团队</p>
            <p className="text-sm font-bold text-foreground">{selectedCount}/3 位</p>
          </div>

          <div className="flex-1 flex items-center gap-1 md:gap-2">
            {ROLE_TABS.map((tab) => (
              <SummaryItem
                key={tab.key}
                label={tab.label}
                staff={selections[tab.key]}
                active={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <button
              onClick={onGenerate}
              disabled={selectedCount === 0}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground bg-primary-gradient shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              生成方案
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSummaryBar;
