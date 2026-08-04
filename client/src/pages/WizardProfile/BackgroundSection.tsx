import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

import type { UserProfile } from '@shared/api.interface';

type ProfileForm = Omit<UserProfile, 'id'>;

const INCOME_OPTIONS = [
  '10万以下',
  '10-20万',
  '20-30万',
  '30-50万',
  '50-100万',
  '100万以上',
];

const WORK_NATURE_OPTIONS = ['全职', '兼职', '自由职业', '创业', '待业'];

const MARITAL_STATUS_OPTIONS = ['未婚', '离异', '丧偶'];

const LOVE_EXPERIENCE_OPTIONS = ['从未恋爱', '1-2次', '3-5次', '5次以上'];

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座',
];

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ExpandableSection = ({
  title,
  children,
  defaultOpen = false,
}: ExpandableSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left select-none group"
      >
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {title}
        </h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ChevronDown className="size-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-2 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FieldWrapperProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const FieldWrapper = ({ label, children, className }: FieldWrapperProps) => (
  <div className={className}>
    <Label className="mb-2 block text-sm font-medium text-foreground">
      {label}
    </Label>
    {children}
  </div>
);

interface BackgroundSectionProps {
  form: ProfileForm;
  updateField: <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => void;
  updateArrayField: (key: 'selfTags' | 'hobbies', text: string) => void;
  selfTagsText: string;
  hobbiesText: string;
}

const BackgroundSection = ({
  form,
  updateField,
  updateArrayField,
  selfTagsText,
  hobbiesText,
}: BackgroundSectionProps) => {
  const inputClass = useMemo(
    () =>
      'h-11 focus-visible:ring-primary/30 focus-visible:border-primary/30',
    [],
  );
  const selectClass = useMemo(
    () => 'w-full h-11 focus:ring-primary/30 focus:border-primary/30',
    [],
  );

  return (
    <section className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)] mb-6">
      <ExpandableSection title="现实背景">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldWrapper label="成长地">
            <Input
              value={form.hometown}
              onChange={(e) => updateField('hometown', e.target.value)}
              placeholder="请输入成长地"
              className={inputClass}
            />
          </FieldWrapper>

          <FieldWrapper label="家庭所在地">
            <Input
              value={form.familyCity}
              onChange={(e) => updateField('familyCity', e.target.value)}
              placeholder="请输入家庭所在地"
              className={inputClass}
            />
          </FieldWrapper>

          <FieldWrapper label="身高 (cm)">
            <Input
              type="number"
              value={form.height || ''}
              onChange={(e) =>
                updateField('height', Number(e.target.value) || 0)
              }
              placeholder="请输入身高"
              className={inputClass}
            />
          </FieldWrapper>

          <FieldWrapper label="体重 (kg)">
            <Input
              type="number"
              value={form.weight || ''}
              onChange={(e) =>
                updateField('weight', Number(e.target.value) || 0)
              }
              placeholder="请输入体重"
              className={inputClass}
            />
          </FieldWrapper>

          <FieldWrapper label="年收入区间">
            <Select
              value={form.annualIncome}
              onValueChange={(val) => updateField('annualIncome', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择年收入区间" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="工作性质">
            <Select
              value={form.workNature}
              onValueChange={(val) => updateField('workNature', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择工作性质" />
              </SelectTrigger>
              <SelectContent>
                {WORK_NATURE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="婚姻状态">
            <Select
              value={form.maritalStatus}
              onValueChange={(val) => updateField('maritalStatus', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择婚姻状态" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="恋爱经历">
            <Select
              value={form.loveExperience}
              onValueChange={(val) => updateField('loveExperience', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择恋爱经历" />
              </SelectTrigger>
              <SelectContent>
                {LOVE_EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="MBTI">
            <Select
              value={form.mbti}
              onValueChange={(val) => updateField('mbti', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择 MBTI 类型" />
              </SelectTrigger>
              <SelectContent>
                {MBTI_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="星座">
            <Select
              value={form.zodiac}
              onValueChange={(val) => updateField('zodiac', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择星座" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="自我标签" className="md:col-span-2">
            <Input
              value={selfTagsText}
              onChange={(e) => updateArrayField('selfTags', e.target.value)}
              placeholder="多个标签用逗号分隔，如：理性、温柔、爱读书"
              className={inputClass}
            />
          </FieldWrapper>

          <FieldWrapper label="兴趣爱好" className="md:col-span-2">
            <Input
              value={hobbiesText}
              onChange={(e) => updateArrayField('hobbies', e.target.value)}
              placeholder="多个爱好用逗号分隔，如：摄影、徒步、咖啡"
              className={inputClass}
            />
          </FieldWrapper>
        </div>
      </ExpandableSection>
    </section>
  );
};

export { BackgroundSection, ExpandableSection, FieldWrapper };
