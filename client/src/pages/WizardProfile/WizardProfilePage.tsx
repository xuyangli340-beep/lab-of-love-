import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { CoreProfileSection } from './CoreProfileSection';
import { BackgroundSection } from './BackgroundSection';
import { EducationSection } from './EducationSection';
import { PreferenceSection } from './PreferenceSection';

import { userProfileApi } from '@client/src/api/index';
import type { UserProfile } from '@shared/api.interface';

type ProfileForm = Omit<UserProfile, 'id'>;

const DEFAULT_PROFILE: ProfileForm = {
  nickname: '',
  gender: '',
  age: 0,
  occupation: '',
  workCity: '',
  settleCity: '',
  hometown: '',
  familyCity: '',
  height: 0,
  weight: 0,
  annualIncome: '',
  workNature: '',
  maritalStatus: '',
  loveExperience: '',
  mbti: '',
  zodiac: '',
  selfTags: [],
  hobbies: [],
  targetGender: '',
  targetAgeMin: 22,
  targetAgeMax: 35,
  targetHeightMin: 160,
  targetHeightMax: 185,
  minEducation: '',
  undergradSchoolPref: '',
  masterSchoolPref: '',
  overseasPref: '',
  regionMode: '',
  incomeRequirement: '',
  marriagePlan: '',
  stylePreference: '',
  highestEducation: '',
  undergradSchool: '',
  undergradSchoolTier: '',
  undergradMajor: '',
  masterSchool: '',
  masterSchoolTier: '',
  masterMajor: '',
  phdSchool: '',
  phdSchoolTier: '',
  phdResearch: '',
};

const WizardProfilePage = () => {
  const [form, setForm] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<ProfileForm | null>(null);

  // 初始加载
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const profile: UserProfile = await userProfileApi.get();
        if (!mounted) return;
        const { id, ...rest } = profile;
        const next = { ...DEFAULT_PROFILE, ...rest };
        setForm(next);
        lastSavedRef.current = next;
      } catch (err) {
        logger.error('加载用户档案失败', String(err));
        toast.error('加载档案失败，请刷新页面重试');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // 保存函数
  const saveProfile = useCallback(async (data: ProfileForm) => {
    setSaving(true);
    setSaved(false);
    try {
      const last = lastSavedRef.current;
      const partial: Partial<ProfileForm> = {};
      if (last) {
        (Object.keys(data) as Array<keyof ProfileForm>).forEach((key) => {
          const val = data[key];
          const lastVal = last[key];
          if (JSON.stringify(val) !== JSON.stringify(lastVal)) {
            (partial as Record<string, unknown>)[key] = val;
          }
        });
      } else {
        Object.assign(partial, data);
      }

      if (Object.keys(partial).length === 0) {
        setSaving(false);
        setSaved(true);
        return;
      }

      const result = await userProfileApi.update(partial);
      if (result.success) {
        lastSavedRef.current = { ...data };
        setSaved(true);
        toast.success('档案已保存');
      }
    } catch (err) {
      logger.error('保存档案失败', String(err));
      toast.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }, []);

  // 防抖更新
  const debouncedSave = useCallback(
    (next: ProfileForm) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      setSaved(false);
      saveTimerRef.current = setTimeout(() => {
        saveProfile(next);
      }, 800);
    },
    [saveProfile],
  );

  // 字段更新
  const updateField = useCallback(
    <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  // 逗号分隔字符串 ↔ string[]
  const updateArrayField = useCallback(
    (key: 'selfTags' | 'hobbies', text: string) => {
      const arr = text
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      updateField(key, arr as ProfileForm[typeof key]);
    },
    [updateField],
  );

  const selfTagsText = useMemo(() => form.selfTags.join(', '), [form.selfTags]);
  const hobbiesText = useMemo(() => form.hobbies.join(', '), [form.hobbies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">加载档案中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {/* 页头 */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
              最小档案
            </h1>
            <p className="text-muted-foreground">
              Step 1 · 填写基础信息，构建你的理性心动起点
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm shrink-0">
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-muted-foreground">保存中...</span>
              </>
            ) : saved ? (
              <>
                <Check className="size-4 text-success" />
                <span className="text-success">已保存</span>
              </>
            ) : (
              <span className="text-muted-foreground">编辑中</span>
            )}
          </div>
        </div>

        <CoreProfileSection form={form} updateField={updateField} />

        <BackgroundSection
          form={form}
          updateField={updateField}
          updateArrayField={updateArrayField}
          selfTagsText={selfTagsText}
          hobbiesText={hobbiesText}
        />

        <EducationSection form={form} updateField={updateField} />

        <PreferenceSection form={form} updateField={updateField} />
      </div>
    </div>
  );
};

export default WizardProfilePage;
