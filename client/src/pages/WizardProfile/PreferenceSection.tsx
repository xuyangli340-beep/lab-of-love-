import { useMemo } from 'react';

import { Label } from '@client/src/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@client/src/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Slider } from '@client/src/components/ui/slider';

import { FieldWrapper } from './BackgroundSection';

import type { UserProfile } from '@shared/api.interface';

type ProfileForm = Omit<UserProfile, 'id'>;

const TARGET_GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'any', label: '不限' },
];

const MIN_EDUCATION_OPTIONS = ['高中', '大专', '本科', '硕士', '博士'];
const SCHOOL_TIER_OPTIONS = ['985', '211', '双一流', '普通本科', '其他'];
const OVERSEAS_PREF_OPTIONS = ['无所谓', '有加分', '必须有'];

const REGION_MODE_OPTIONS = [
  { value: 'same-city', label: '仅同城' },
  { value: 'same-city-and-around', label: '同城及周边' },
  { value: 'long-distance-ok', label: '接受阶段性异地' },
  { value: 'nationwide', label: '全国均可' },
];

const INCOME_REQUIREMENT_OPTIONS = [
  '无要求',
  '10万以上',
  '20万以上',
  '30万以上',
  '50万以上',
  '100万以上',
];

const MARRIAGE_PLAN_OPTIONS = ['1年内', '1-2年', '2-3年', '3年以上', '暂不考虑'];

const STYLE_PREFERENCE_OPTIONS = [
  '温柔知性',
  '活泼开朗',
  '成熟稳重',
  '文艺清新',
  '干练飒爽',
  '其他',
];

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  unit?: string;
}

const RangeSlider = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
}: RangeSliderProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium tabular-nums text-primary">
        {value[0]}
        {unit}
      </span>
      <span className="text-xs text-muted-foreground">—</span>
      <span className="text-sm font-medium tabular-nums text-primary">
        {value[1]}
        {unit}
      </span>
    </div>
    <Slider
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={(vals: number[]) =>
        onChange([vals[0] ?? min, vals[1] ?? max] as [number, number])
      }
      className="[&_[data-slot=slider-range]]:bg-primary-gradient"
    />
  </div>
);

interface PreferenceSectionProps {
  form: ProfileForm;
  updateField: <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => void;
}

const PreferenceSection = ({ form, updateField }: PreferenceSectionProps) => {
  const selectClass = useMemo(
    () => 'w-full h-11 focus:ring-primary/30 focus:border-primary/30',
    [],
  );

  return (
    <section className="bg-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)]">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
        基础可行域
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        设定你的择偶基础条件，帮助我们更精准地为你筛选
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrapper label="目标性别" className="md:col-span-2">
          <RadioGroup
            value={form.targetGender}
            onValueChange={(val) => updateField('targetGender', val)}
            className="flex flex-wrap gap-3"
          >
            {TARGET_GENDER_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/40 transition-colors"
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`target-gender-${opt.value}`}
                />
                <Label
                  htmlFor={`target-gender-${opt.value}`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </FieldWrapper>

        <FieldWrapper label="理想年龄范围" className="md:col-span-2">
          <RangeSlider
            min={18}
            max={60}
            value={[form.targetAgeMin, form.targetAgeMax]}
            onChange={(val) => {
              updateField('targetAgeMin', val[0]);
              updateField('targetAgeMax', val[1]);
            }}
          />
        </FieldWrapper>

        <FieldWrapper label="理想身高范围 (cm)" className="md:col-span-2">
          <RangeSlider
            min={140}
            max={200}
            value={[form.targetHeightMin, form.targetHeightMax]}
            onChange={(val) => {
              updateField('targetHeightMin', val[0]);
              updateField('targetHeightMax', val[1]);
            }}
            unit="cm"
          />
        </FieldWrapper>

        <FieldWrapper label="最低学历">
          <Select
            value={form.minEducation}
            onValueChange={(val) => updateField('minEducation', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择最低学历" />
            </SelectTrigger>
            <SelectContent>
              {MIN_EDUCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="本科院校层级偏好">
          <Select
            value={form.undergradSchoolPref}
            onValueChange={(val) => updateField('undergradSchoolPref', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择偏好" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="无要求">无要求</SelectItem>
              {SCHOOL_TIER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}及以上
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="硕士院校层级偏好">
          <Select
            value={form.masterSchoolPref}
            onValueChange={(val) => updateField('masterSchoolPref', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择偏好" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="无要求">无要求</SelectItem>
              {SCHOOL_TIER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}及以上
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="海外留学经历偏好">
          <Select
            value={form.overseasPref}
            onValueChange={(val) => updateField('overseasPref', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择偏好" />
            </SelectTrigger>
            <SelectContent>
              {OVERSEAS_PREF_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="地域模式" className="md:col-span-2">
          <RadioGroup
            value={form.regionMode}
            onValueChange={(val) => updateField('regionMode', val)}
            className="flex flex-wrap gap-3"
          >
            {REGION_MODE_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/40 transition-colors"
              >
                <RadioGroupItem value={opt.value} id={`region-${opt.value}`} />
                <Label
                  htmlFor={`region-${opt.value}`}
                  className="cursor-pointer text-sm text-foreground"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </FieldWrapper>

        <FieldWrapper label="收入要求">
          <Select
            value={form.incomeRequirement}
            onValueChange={(val) => updateField('incomeRequirement', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择收入要求" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_REQUIREMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="婚姻计划">
          <Select
            value={form.marriagePlan}
            onValueChange={(val) => updateField('marriagePlan', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择婚姻计划" />
            </SelectTrigger>
            <SelectContent>
              {MARRIAGE_PLAN_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper label="风格偏好" className="md:col-span-2">
          <Select
            value={form.stylePreference}
            onValueChange={(val) => updateField('stylePreference', val)}
          >
            <SelectTrigger className={selectClass}>
              <SelectValue placeholder="请选择风格偏好" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_PREFERENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>
    </section>
  );
};

export { PreferenceSection };
