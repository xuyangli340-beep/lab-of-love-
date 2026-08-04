import { Award } from 'lucide-react';
import type { StaffMember } from './staff-data';

interface StaffCardProps {
  staff: StaffMember;
  isSelected: boolean;
  onToggle: (staff: StaffMember) => void;
}

const StaffCard = ({ staff, isSelected, onToggle }: StaffCardProps) => {
  const initial = staff.name.charAt(0);

  return (
    <div
      className={`bg-white rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${
        isSelected ? 'ring-2 ring-primary/30 shadow-lg' : ''
      }`}
    >
      {/* 头像 */}
      <div className="flex justify-center mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-serif font-bold shadow-md"
          style={{ background: staff.avatarColor }}
        >
          {initial}
        </div>
      </div>

      {/* 姓名 */}
      <h3 className="text-center font-serif font-bold text-lg text-foreground mb-1">
        {staff.name}
      </h3>

      {/* 学历 */}
      <p className="text-center text-xs text-muted-foreground mb-2 line-clamp-1">
        {staff.education}
      </p>

      {/* 资历 */}
      <p className="text-center text-sm text-foreground/80 font-medium mb-3">
        {staff.experience}
      </p>

      {/* 擅长领域标签 */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-3 min-h-[48px]">
        {staff.specialties.map((specialty: string) => (
          <span
            key={specialty}
            className="px-2.5 py-1 text-[11px] rounded-full font-medium"
            style={{
              background:
                'linear-gradient(135deg, rgba(220,90,163,0.12), rgba(146,90,213,0.12))',
              color: '#925ad5',
            }}
          >
            {specialty}
          </span>
        ))}
      </div>

      {/* 业绩记录 */}
      <p className="text-center text-xs text-primary font-medium mb-4">
        <Award className="w-3 h-3 inline mr-1 -mt-0.5" />
        {staff.trackRecord}
      </p>

      {/* 选择按钮 */}
      <div className="mt-auto">
        <button
          onClick={() => onToggle(staff)}
          className={`w-full py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            isSelected
              ? 'bg-primary-gradient text-primary-foreground shadow-md hover:shadow-lg'
              : 'border border-border text-foreground hover:border-primary/40 hover:text-primary bg-white'
          }`}
        >
          {isSelected ? '✓ 已选择' : '选择'}
        </button>
      </div>
    </div>
  );
};

export default StaffCard;
