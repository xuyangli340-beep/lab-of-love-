import { useMemo } from 'react';

import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

import { ExpandableSection, FieldWrapper } from './BackgroundSection';

import type { UserProfile } from '@shared/api.interface';

type ProfileForm = Omit<UserProfile, 'id'>;

const EDUCATION_OPTIONS = ['本科', '硕士', '博士'];
const SCHOOL_TIER_OPTIONS = ['985', '211', '双一流', '普通本科', '其他'];

interface EducationSectionProps {
  form: ProfileForm;
  updateField: <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => void;
}

const EducationSection = ({ form, updateField }: EducationSectionProps) => {
  const inputClass = useMemo(
    () =>
      'h-11 focus-visible:ring-primary/30 focus-visible:border-primary/30',
    [],
  );
  const selectClass = useMemo(
    () => 'w-full h-11 focus:ring-primary/30 focus:border-primary/30',
    [],
  );

  const educationLevel = useMemo(() => {
    if (form.highestEducation === '博士') return 3;
    if (form.highestEducation === '硕士') return 2;
    if (form.highestEducation === '本科') return 1;
    return 0;
  }, [form.highestEducation]);

  return (
    <section className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)] mb-6">
      <ExpandableSection title="教育背景">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldWrapper label="最高学历">
            <Select
              value={form.highestEducation}
              onValueChange={(val) => updateField('highestEducation', val)}
            >
              <SelectTrigger className={selectClass}>
                <SelectValue placeholder="请选择最高学历" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>

        {educationLevel >= 1 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              本科
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldWrapper label="本科学校">
                <Input
                  value={form.undergradSchool}
                  onChange={(e) =>
                    updateField('undergradSchool', e.target.value)
                  }
                  placeholder="学校名称"
                  className={inputClass}
                />
              </FieldWrapper>
              <FieldWrapper label="院校层级">
                <Select
                  value={form.undergradSchoolTier}
                  onValueChange={(val) =>
                    updateField('undergradSchoolTier', val)
                  }
                >
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TIER_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="本科专业">
                <Input
                  value={form.undergradMajor}
                  onChange={(e) =>
                    updateField('undergradMajor', e.target.value)
                  }
                  placeholder="专业名称"
                  className={inputClass}
                />
              </FieldWrapper>
            </div>
          </div>
        )}

        {educationLevel >= 2 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              硕士
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldWrapper label="硕士学校">
                <Input
                  value={form.masterSchool}
                  onChange={(e) =>
                    updateField('masterSchool', e.target.value)
                  }
                  placeholder="学校名称"
                  className={inputClass}
                />
              </FieldWrapper>
              <FieldWrapper label="院校层级">
                <Select
                  value={form.masterSchoolTier}
                  onValueChange={(val) =>
                    updateField('masterSchoolTier', val)
                  }
                >
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TIER_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="硕士专业">
                <Input
                  value={form.masterMajor}
                  onChange={(e) =>
                    updateField('masterMajor', e.target.value)
                  }
                  placeholder="专业名称"
                  className={inputClass}
                />
              </FieldWrapper>
            </div>
          </div>
        )}

        {educationLevel >= 3 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              博士
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldWrapper label="博士学校">
                <Input
                  value={form.phdSchool}
                  onChange={(e) => updateField('phdSchool', e.target.value)}
                  placeholder="学校名称"
                  className={inputClass}
                />
              </FieldWrapper>
              <FieldWrapper label="院校层级">
                <Select
                  value={form.phdSchoolTier}
                  onValueChange={(val) =>
                    updateField('phdSchoolTier', val)
                  }
                >
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TIER_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="研究方向">
                <Input
                  value={form.phdResearch}
                  onChange={(e) =>
                    updateField('phdResearch', e.target.value)
                  }
                  placeholder="研究方向"
                  className={inputClass}
                />
              </FieldWrapper>
            </div>
          </div>
        )}
      </ExpandableSection>
    </section>
  );
};

export { EducationSection };
