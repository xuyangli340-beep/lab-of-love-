import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';

import {
  portraitApi,
  userProfileApi,
  preferenceApi,
} from '@client/src/api/index';
import type {
  IdealPortrait,
  UserProfile,
  PreferenceFactor,
} from '@shared/api.interface';

/* ------------------------------------------------------------------ */
/*  画像生成逻辑（前端基于档案 + 偏好因子合成自然语言描述）             */
/* ------------------------------------------------------------------ */

const EDUCATION_LABEL: Record<string, string> = {
  high_school: '高中',
  associate: '大专',
  bachelor: '本科',
  master: '硕士',
  phd: '博士',
};

const SCHOOL_TIER_LABEL: Record<string, string> = {
  c9: 'C9 顶尖院校',
  '985': '985 院校',
  '211': '211 院校',
  double_first_class: '双一流院校',
  overseas_top: '海外名校',
  ordinary: '普通院校',
};

const REGION_LABEL: Record<string, string> = {
  same_city: '同城优先',
  nearby: '周边城市可接受',
  first_tier: '一线城市',
  new_first_tier: '新一线城市',
  no_limit: '地域不限',
};

const INCOME_LABEL: Record<string, string> = {
  '10w_below': '10 万以下',
  '10w_20w': '10-20 万',
  '20w_40w': '20-40 万',
  '40w_70w': '40-70 万',
  '70w_100w': '70-100 万',
  '100w_above': '百万以上',
};

const PERSONALITY_POOL: Record<string, string[]> = {
  emotional_stability: ['情绪稳定', '从容淡定', '不内耗'],
  kindness: ['温柔善良', '同理心强', '体贴入微'],
  intelligence: ['聪明睿智', '逻辑清晰', '思维敏捷'],
  ambition: ['有上进心', '事业心强', '目标清晰'],
  family_oriented: ['顾家', '重视家庭', '有责任感'],
  humor: ['幽默风趣', '乐观开朗', '有趣的灵魂'],
  honesty: ['真诚坦率', '正直可靠', '言行一致'],
  independence: ['独立成熟', '有主见', '不依附'],
  empathy: ['共情能力强', '善解人意', '懂得倾听'],
  taste: ['有品味', '审美在线', '生活有情趣'],
};

const randInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function buildPortraitFromData(
  profile: UserProfile,
  factors: PreferenceFactor[],
): IdealPortrait {
  const isMale = profile.targetGender === 'male';
  const genderWord = isMale ? '他' : '她';
  const genderNoun = isMale ? '男士' : '女士';

  // 年龄段描述
  const ageDesc = `${profile.targetAgeMin}-${profile.targetAgeMax} 岁`;

  // 教育背景描述
  const eduParts: string[] = [];
  if (profile.minEducation) {
    eduParts.push(EDUCATION_LABEL[profile.minEducation] ?? profile.minEducation);
  }
  const schoolPref = profile.masterSchoolPref || profile.undergradSchoolPref;
  if (schoolPref && SCHOOL_TIER_LABEL[schoolPref]) {
    eduParts.push(SCHOOL_TIER_LABEL[schoolPref]);
  }
  if (profile.overseasPref === 'prefer' || profile.overseasPref === 'must') {
    eduParts.push('有海外经历');
  }
  const eduDesc = eduParts.length > 0 ? eduParts.join('、') : '良好教育背景';

  // 地域描述
  const regionDesc = REGION_LABEL[profile.regionMode] ?? '地域不限';

  // 收入描述
  const incomeDesc = INCOME_LABEL[profile.incomeRequirement] ?? '经济独立';

  // 高权重性格因子（取权重前 4 位）
  const topFactors = [...factors]
    .sort((a: PreferenceFactor, b: PreferenceFactor) => b.weight - a.weight)
    .slice(0, 4);

  const personalityTraits: string[] = [];
  for (const f of topFactors) {
    const pool = PERSONALITY_POOL[f.factorName];
    if (pool) {
      personalityTraits.push(pool[randInRange(0, pool.length - 1)]);
    }
  }
  // 保底补 2 个
  if (personalityTraits.length < 2) {
    personalityTraits.push('情绪稳定', '温柔知性');
  }

  // 三段自然语言
  const paragraph1 =
    `理想中的${genderNoun}，年龄大约在${ageDesc}之间，` +
    `拥有${eduDesc}的教育背景。${genderWord}应当是一个${personalityTraits[0]}、` +
    `${personalityTraits[1] ?? '真诚善良'}的人，` +
    `在相处中能给人带来稳定而安心的感觉。`;

  const paragraph2 =
    `地域上，${regionDesc}；经济上，${incomeDesc}的水平较为匹配。` +
    `${genderWord}应当有独立的事业与清晰的人生规划，` +
    `同时懂得在工作与生活之间取得平衡，` +
    `不会把全部精力都投入在单一维度上。`;

  const paragraph3 =
    `性格层面，${personalityTraits.slice(0, 3).join('、')}是最核心的三个特质。` +
    `${genderWord}善于沟通、懂得换位思考，遇到矛盾时愿意理性面对而非情绪化对抗。` +
    `在亲密关系中，${genderWord}既能保持独立的自我，` +
    `也愿意为共同的未来投入真诚与耐心。`;

  const paragraph4 =
    `总而言之，这是一位内外兼修、理性与温度并存的理想伴侣画像。` +
    `${genderWord}不是完美无缺的模板，而是在你最看重的维度上高度契合、` +
    `值得深入了解的那个人。`;

  const summary = [paragraph1, paragraph2, paragraph3, paragraph4].join('\n\n');

  // 标签 6-8 个
  const tags: string[] = [];
  tags.push(personalityTraits[0]);
  tags.push(personalityTraits[1] ?? '情绪稳定');
  if (schoolPref && SCHOOL_TIER_LABEL[schoolPref]) {
    tags.push(SCHOOL_TIER_LABEL[schoolPref]);
  } else if (profile.minEducation && EDUCATION_LABEL[profile.minEducation]) {
    tags.push(EDUCATION_LABEL[profile.minEducation]);
  }
  if (profile.regionMode && profile.regionMode !== 'no_limit') {
    tags.push(regionDesc);
  }
  tags.push(incomeDesc);
  if (personalityTraits[2]) tags.push(personalityTraits[2]);
  if (personalityTraits[3]) tags.push(personalityTraits[3]);
  tags.push('理性成熟');
  // 去重 + 限制 8 个
  const uniqueTags = Array.from(new Set(tags)).slice(0, 8);

  // 三项评分区间
  const heartScoreMin = randInRange(75, 80);
  const heartScoreMax = heartScoreMin + randInRange(3, 6);
  const stabilityScoreMin = randInRange(80, 85);
  const stabilityScoreMax = stabilityScoreMin + randInRange(3, 6);
  const reachabilityScoreMin = randInRange(65, 70);
  const reachabilityScoreMax = reachabilityScoreMin + randInRange(3, 6);

  return {
    id: '',
    userProfileId: profile.id,
    title: '理性心动 · 理想型画像',
    summary,
    tags: uniqueTags,
    heartScoreMin,
    heartScoreMax,
    stabilityScoreMin,
    stabilityScoreMax,
    reachabilityScoreMin,
    reachabilityScoreMax,
    userRating: 0,
    userFeedback: '',
  };
}

/* ------------------------------------------------------------------ */
/*  半圆评分仪表盘（CSS conic-gradient 实现）                          */
/* ------------------------------------------------------------------ */

interface SemiCircleGaugeProps {
  min: number;
  max: number;
  label: string;
  delay?: number;
}

const SemiCircleGauge = ({ min, max, label, delay = 0 }: SemiCircleGaugeProps) => {
  // 用 max 作为进度值（半圆 0-180° 对应 0-100 分）
  const progress = Math.min(100, Math.max(0, max));
  const angle = (progress / 100) * 180; // 0~180deg

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-24 h-12 overflow-hidden"
        style={{ borderRadius: '999px 999px 0 0' }}
      >
        {/* 背景轨道 */}
        <div
          className="absolute inset-0 bg-white/10"
          style={{ borderRadius: '999px 999px 0 0' }}
        />
        {/* 进度弧（conic-gradient，从底部左侧开始扫过顶部） */}
        <motion.div
          className="absolute inset-0"
          initial={{ backgroundPosition: '0% 100%', opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay }}
          style={{
            borderRadius: '999px 999px 0 0',
            background: `conic-gradient(from 180deg at 50% 100%, hsl(324 75% 61%) 0deg, hsl(266 68% 59%) ${angle}deg, transparent ${angle}deg)`,
          }}
        />
        {/* 内圈遮罩（形成环） */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[72px] h-[36px] bg-[#3a2a4d]"
          style={{ borderRadius: '999px 999px 0 0' }}
        />
        {/* 数字 */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-0.5">
          <span className="text-white font-serif text-lg leading-none tabular-nums text-on-dark-gradient">
            {min}-{max}
          </span>
        </div>
      </div>
      <span className="text-xs text-white/60 font-sans">{label}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  星星评分组件                                                       */
/* ------------------------------------------------------------------ */

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
}

const StarRating = ({ value, onChange }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n: number) => {
        const filled = n <= display;
        return (
          <motion.button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={filled ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="p-1 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            aria-label={`${n} 星`}
          >
            <Star
              size={28}
              className={
                filled
                  ? 'text-transparent'
                  : 'text-border stroke-border'
              }
              style={
                filled
                  ? {
                      fill: 'url(#starGradient)',
                      stroke: 'url(#starGradient)',
                    }
                  : undefined
              }
            />
          </motion.button>
        );
      })}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(324 75% 61%)" />
            <stop offset="100%" stopColor="hsl(266 68% 59%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  骨架屏                                                             */
/* ------------------------------------------------------------------ */

const PortraitSkeleton = () => (
  <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#302532] to-[#5a3a7a] p-8 md:p-10">
    <div className="relative z-10 space-y-5">
      <div className="h-3 w-28 bg-white/10 rounded-full animate-pulse" />
      <div className="h-8 w-2/3 bg-white/15 rounded-lg animate-pulse" />
      <div className="space-y-3 pt-2">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-11/12 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {[0, 1, 2, 3, 4].map((i: number) => (
          <div
            key={i}
            className="h-7 w-20 bg-white/10 rounded-full animate-pulse"
          />
        ))}
      </div>
      <div className="flex justify-end gap-6 pt-4">
        {[0, 1, 2].map((i: number) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-24 h-12 bg-white/10 rounded-t-full animate-pulse" />
            <div className="h-3 w-12 bg-white/10 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  主页面组件                                                         */
/* ------------------------------------------------------------------ */

const WizardPortraitPage = () => {
  const [loading, setLoading] = useState(true);
  const [portrait, setPortrait] = useState<IdealPortrait | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* -------- 加载画像：先取已有，没有则生成 -------- */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // 1. 尝试获取已有画像
        const existing = await portraitApi.get();
        if (mounted && existing && existing.id) {
          setPortrait(existing);
          setRating(existing.userRating || 0);
          setFeedback(existing.userFeedback || '');
          setLoading(false);
          return;
        }

        // 2. 没有画像 → 拉取档案 + 偏好因子，前端合成后调用 generate 保存
        const [profile, prefResp] = await Promise.all([
          userProfileApi.get(),
          preferenceApi.getList(),
        ]);
        if (!mounted) return;

        const factors: PreferenceFactor[] = prefResp.items ?? [];
        const generated = buildPortraitFromData(profile, factors);

        const result = await portraitApi.generate();
        if (!mounted) return;

        // 后端返回的画像优先；若后端 summary 为空则用前端生成的
        const finalPortrait: IdealPortrait =
          result.portrait && result.portrait.summary
            ? result.portrait
            : { ...generated, id: result.id };

        setPortrait(finalPortrait);
      } catch (err) {
        logger.error('加载理想画像失败', String(err));
        toast.error('画像生成失败，请刷新页面重试');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------- 评分变更 -------- */
  const handleRatingChange = useCallback(async (value: number) => {
    setRating(value);
    try {
      await portraitApi.submitRating(value);
      toast.success(`已提交 ${value}.0 分评价`);
    } catch (err) {
      logger.error('提交评分失败', String(err));
      toast.error('评分提交失败，请稍后重试');
    }
  }, []);

  /* -------- 提交反馈 -------- */
  const handleSubmitFeedback = useCallback(async () => {
    if (!feedback.trim()) {
      toast.warning('请先填写反馈内容');
      return;
    }
    setSubmitting(true);
    try {
      await portraitApi.submitFeedback(feedback.trim());
      toast.success('反馈已提交，我们会据此优化画像模型');
    } catch (err) {
      logger.error('提交反馈失败', String(err));
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [feedback]);

  /* -------- 段落切分 -------- */
  const paragraphs = useMemo(() => {
    if (!portrait?.summary) return [];
    return portrait.summary.split(/\n\n+/).filter(Boolean);
  }, [portrait]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-sans mb-4">
            <Sparkles size={14} />
            <span>Step 4 · 理想画像生成</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            你的理想型画像
          </h1>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            基于你的档案与偏好模型，我们为你生成了一份理性而有温度的理想伴侣画像
          </p>
        </motion.div>

        {/* 画像卡片 */}
        {loading ? (
          <PortraitSkeleton />
        ) : portrait ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#302532] to-[#5a3a7a] p-8 md:p-10 shadow-xl"
          >
            {/* 粉紫渐变光晕 */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-full blur-3xl z-0 opacity-30"
              style={{ background: 'var(--primary-gradient)' }}
            />

            <div className="relative z-10">
              {/* 顶部标签 */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-white/50 font-sans tracking-wider uppercase">
                  理想画像 · v1.0
                </span>
                <span className="text-xs text-white/40 font-sans">
                  基于偏好模型生成
                </span>
              </div>

              {/* 标题 */}
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-6 text-on-dark-gradient">
                {portrait.title}
              </h2>

              {/* 摘要正文 */}
              <div className="space-y-4 mb-7">
                {paragraphs.map((p: string, i: number) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="text-white/85 font-sans leading-relaxed text-base md:text-[15px] text-on-dark-gradient"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {/* 标签行 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {portrait.tags.map((tag: string, i: number) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                    className="px-3.5 py-1.5 rounded-full text-sm font-sans text-white/90 text-on-dark-gradient"
                    style={{
                      background:
                        'linear-gradient(135deg, hsl(324 75% 61% / 0.35), hsl(266 68% 59% / 0.35))',
                      border: '1px solid hsl(324 75% 80% / 0.25)',
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              {/* 三项评分仪表盘 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex justify-end gap-6 md:gap-8 pt-4 border-t border-white/10"
              >
                <SemiCircleGauge
                  min={portrait.heartScoreMin}
                  max={portrait.heartScoreMax}
                  label="心动指数"
                  delay={0.7}
                />
                <SemiCircleGauge
                  min={portrait.stabilityScoreMin}
                  max={portrait.stabilityScoreMax}
                  label="稳定指数"
                  delay={0.85}
                />
                <SemiCircleGauge
                  min={portrait.reachabilityScoreMin}
                  max={portrait.reachabilityScoreMax}
                  label="可达指数"
                  delay={1.0}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : null}

        {/* 满意度评分区 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 bg-card rounded-[28px] p-6 md:p-8 shadow-sm border border-border"
        >
          <h3 className="font-serif text-xl text-foreground mb-4">
            这份画像符合你的预期吗？
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <StarRating value={rating} onChange={handleRatingChange} />
            <span className="font-sans text-muted-foreground tabular-nums">
              {rating.toFixed(1)} / 5.0
            </span>
          </div>
        </motion.div>

        {/* 文字反馈区 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 bg-card rounded-[28px] p-6 md:p-8 shadow-sm border border-border"
        >
          <h3 className="font-serif text-xl text-foreground mb-4">
            还有什么想补充的？
          </h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="说说哪里符合、哪里不符合，我们会据此调整模型参数..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-accent/40 border border-border text-foreground font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder:text-muted-foreground/70 transition-shadow"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={submitting || !feedback.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-sans text-sm font-medium bg-primary-gradient shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  提交中...
                </>
              ) : (
                '应用反馈'
              )}
            </button>
          </div>
        </motion.div>

        {/* 免责提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 text-center text-xs text-muted-foreground font-sans leading-relaxed max-w-xl mx-auto"
        >
          星座MBTI仅作参考，不作人格结论。画像基于你提供的档案与偏好模型生成，
          实际匹配以真实相处为准。
        </motion.p>
      </div>
    </div>
  );
};

export default WizardPortraitPage;
