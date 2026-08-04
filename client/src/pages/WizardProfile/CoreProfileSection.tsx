import { useMemo } from 'react';

import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@client/src/components/ui/radio-group';

import type { UserProfile } from '@shared/api.interface';

type ProfileForm = Omit<UserProfile, 'id'>;

const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

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

interface CoreProfileSectionProps {
  form: ProfileForm;
  updateField: <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => void;
}

const CoreProfileSection = ({ form, updateField }: CoreProfileSectionProps) => {
  const inputClass = useMemo(
    () =>
      'h-11 focus-visible:ring-primary/30 focus-visible:border-primary/30',
    [],
  );

  return (
    <section className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)] mb-6">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
        核心档案
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrapper label="昵称">
          <Input
            value={form.nickname}
            onChange={(e) => updateField('nickname', e.target.value)}
            placeholder="请输入昵称"
            className={inputClass}
          />
        </FieldWrapper>

        <FieldWrapper label="性别">
          <RadioGroup
            value={form.gender}
            onValueChange={(val) => updateField('gender', val)}
            className="flex flex-wrap gap-3"
          >
            {GENDER_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/40 transition-colors"
              >
                <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
                <Label
                  htmlFor={`gender-${opt.value}`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </FieldWrapper>

        <FieldWrapper label="年龄">
          <Input
            type="number"
            value={form.age || ''}
            onChange={(e) => updateField('age', Number(e.target.value) || 0)}
            placeholder="请输入年龄"
            className={inputClass}
          />
        </FieldWrapper>

        <FieldWrapper label="职业">
          <Input
            value={form.occupation}
            onChange={(e) => updateField('occupation', e.target.value)}
            placeholder="请输入职业"
            className={inputClass}
          />
        </FieldWrapper>

        <FieldWrapper label="工作城市">
          <Input
            value={form.workCity}
            onChange={(e) => updateField('workCity', e.target.value)}
            placeholder="请输入工作城市"
            className={inputClass}
          />
        </FieldWrapper>

        <FieldWrapper label="定居城市">
          <Input
            value={form.settleCity}
            onChange={(e) => updateField('settleCity', e.target.value)}
            placeholder="请输入定居城市"
            className={inputClass}
          />
        </FieldWrapper>
      </div>
    </section>
  );
};

export { CoreProfileSection, FieldWrapper };
