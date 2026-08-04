import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, Check, Award } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { Candidate } from '@shared/api.interface';
import { candidateApi } from '@client/src/api/index';

/* ============ 随机数据池 ============ */

const SURNAMES = [
  '陈', '林', '黄', '张', '李', '王', '吴', '周', '郑', '孙',
  '赵', '钱', '冯', '褚', '卫', '蒋', '沈', '韩', '杨', '朱',
];

const GIVEN_NAMES = [
  '雨桐', '思远', '梓涵', '浩然', '诗涵', '宇轩', '欣怡', '子墨',
  '嘉怡', '俊熙', '若曦', '明远', '婉清', '承宇', '书瑶', '景行',
  '知予', '慕白', '亦辰', '语桐', '泽宇', '安然', '清扬', '怀瑾',
  '舒然', '砚秋', '星河', '清和', '望舒', '瑾瑜',
];

const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '苏州'];

const OCCUPATIONS = [
  '产品经理', '算法工程师', '投资经理', '建筑师', '律师', '医生',
  '大学教师', '设计师', '数据科学家', '咨询顾问', '金融分析师',
  '市场总监', '运营总监', '研究员', '项目经理', 'UX 设计师',
];

const SCHOOLS_985 = [
  '清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学',
  '南京大学', '中国人民大学', '中国科学技术大学', '同济大学',
  '北京航空航天大学', '武汉大学', '中山大学', '厦门大学',
  '天津大学', '南开大学', '西安交通大学', '华中科技大学',
];

const SCHOOLS_211 = [
  '上海财经大学', '中央财经大学', '对外经济贸易大学', '北京邮电大学',
  '中国政法大学', '华东师范大学', '北京外国语大学', '上海外国语大学',
  '西南财经大学', '中南财经政法大学', '暨南大学', '苏州大学',
];

const EDUCATION_LEVELS = ['本科', '硕士', '博士'];

const INCOME_RANGES = [
  '20-30万', '30-50万', '50-80万', '80-120万', '120-200万', '200万以上',
];

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const MATCH_REASONS = [
  '价值观高度契合，对长期关系有相似的期待与规划',
  '教育背景与职业路径匹配度高，认知节奏同频',
  '性格互补且核心需求一致，沟通成本低',
  '生活方式与消费观接近，相处舒适自然',
  '家庭观念与婚姻规划高度一致，未来可期',
  'MBTI 适配度高，思维方式形成良性互补',
  '兴趣爱好重叠度高，共同话题丰富',
  '情绪稳定度与成熟度匹配，关系韧性强',
];

const ADVANTAGES = [
  '情绪稳定', '高情商', '有上进心', '家庭和睦', '经济独立',
  '外形出众', '性格温柔', '有责任感', '生活规律', '热爱运动',
  '厨艺精湛', '旅行达人', '阅读广泛', '音乐素养高', '动手能力强',
  '善于沟通', '包容心强', '有艺术气质', '逻辑清晰', '执行力强',
];

const TRADEOFFS = [
  '工作较忙', '性格偏内向', '异地可能性', '年龄略大', '身高略低',
  '收入略低于预期', '学历背景稍弱', '家庭条件一般', '有过婚史',
  '兴趣差异较大', '生活习惯需磨合', '职业发展不确定',
];

/* ============ 工具函数 ============ */

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pickRandomN = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const formatNumber = (n: number): string => n.toLocaleString('zh-CN');

/* ============ 候选生成 ============ */

const generateCandidates = (count: number): Candidate[] => {
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const surname = pickRandom(SURNAMES);
    const givenName = pickRandom(GIVEN_NAMES);
    const name = surname + givenName;

    // 前三名匹配分更高
    let matchScore: number;
    if (rank === 1) {
      matchScore = randomInt(92, 97);
    } else if (rank === 2) {
      matchScore = randomInt(89, 94);
    } else if (rank === 3) {
      matchScore = randomInt(86, 91);
    } else {
      matchScore = randomInt(70, 88);
    }

    const evidenceConfidence = randomInt(72, 95);
    const is985 = Math.random() > 0.35;
    const undergradSchool = is985 ? pickRandom(SCHOOLS_985) : pickRandom(SCHOOLS_211);
    const undergradTier = is985 ? '985' : '211';

    const hasMaster = Math.random() > 0.4;
    const hasPhd = hasMaster && Math.random() > 0.75;
    const highestEducation = hasPhd ? '博士' : hasMaster ? '硕士' : '本科';

    const masterSchool = hasMaster ? pickRandom(SCHOOLS_985) : '';
    const masterTier = hasMaster ? '985' : '';

    const age = randomInt(26, 35);
    const height = randomInt(165, 188);

    candidates.push({
      id: `candidate_${Date.now()}_${i}`,
      rank,
      name,
      age,
      height,
      city: pickRandom(CITIES),
      occupation: pickRandom(OCCUPATIONS),
      undergradSchool,
      undergradTier,
      masterSchool,
      masterTier,
      hasOverseasExperience: Math.random() > 0.7,
      income: pickRandom(INCOME_RANGES),
      incomeRange: pickRandom(INCOME_RANGES),
      style: highestEducation,
      mbti: pickRandom(MBTI_TYPES),
      matchScore,
      evidenceConfidence,
      matchReason: pickRandom(MATCH_REASONS),
      keyAdvantages: pickRandomN(ADVANTAGES, randomInt(2, 3)),
      majorTradeoffs: pickRandomN(TRADEOFFS, randomInt(1, 2)),
    });
  }

  return candidates;
};

/* ============ 排名徽章 ============ */

interface RankBadgeProps {
  rank: number;
}

const RankBadge = ({ rank }: RankBadgeProps) => {
  let gradientClass = '';
  if (rank === 1) {
    gradientClass = 'bg-gradient-to-br from-yellow-400 to-amber-600';
  } else if (rank === 2) {
    gradientClass = 'bg-gradient-to-br from-gray-300 to-gray-500';
  } else if (rank === 3) {
    gradientClass = 'bg-gradient-to-br from-orange-400 to-amber-700';
  } else {
    gradientClass = 'bg-primary-gradient';
  }

  const sizeClass = rank <= 3 ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const positionClass = rank <= 3 ? '-top-2 -left-2' : '-top-1 -left-1';

  return (
    <div
      className={`absolute ${positionClass} ${sizeClass} ${gradientClass} rounded-full flex items-center justify-center text-white font-bold shadow-md z-10`}
    >
      {rank <= 3 ? <Award className="w-4 h-4" /> : rank}
    </div>
  );
};

/* ============ 头像 ============ */

interface AvatarProps {
  name: string;
}

const AVATAR_GRADIENTS = [
  'from-pink-400 to-purple-500',
  'from-rose-400 to-fuchsia-500',
  'from-purple-400 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-400 to-purple-500',
  'from-violet-400 to-purple-600',
];

const Avatar = ({ name }: AvatarProps) => {
  const firstChar = name.charAt(0);
  // 用名字哈希选渐变
  const gradientIndex = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const gradient = AVATAR_GRADIENTS[gradientIndex];

  return (
    <div
      className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-serif text-2xl font-semibold shadow-md`}
    >
      {firstChar}
    </div>
  );
};

/* ============ 候选卡片 ============ */

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const CandidateCard = ({ candidate, isSelected, onSelect }: CandidateCardProps) => {
  const isTop3 = candidate.rank <= 3;

  const educationDisplay = useMemo(() => {
    const parts: string[] = [];
    if (candidate.masterSchool) {
      parts.push(`${candidate.masterSchool} 硕士`);
    } else if (candidate.undergradSchool) {
      parts.push(`${candidate.undergradSchool} 本科`);
    }
    return parts.join(' · ');
  }, [candidate.undergradSchool, candidate.masterSchool]);

  return (
    <div
      className={`relative bg-white rounded-[28px] p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
        isTop3
          ? 'border-2 border-transparent bg-clip-padding'
          : 'border border-border'
      }`}
      style={
        isTop3
          ? {
              boxShadow:
                '0 8px 32px -8px rgba(220,90,163,0.12), 0 0 0 1px rgba(220,90,163,0.08)',
            }
          : undefined
      }
    >
      <RankBadge rank={candidate.rank} />

      {/* 头像 + 基本信息 */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={candidate.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-serif font-semibold text-lg text-foreground truncate">
              {candidate.name}
            </h3>
          </div>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
            <span>{candidate.age}岁</span>
            <span>·</span>
            <span>{candidate.height}cm</span>
            <span>·</span>
            <span>{candidate.city}</span>
          </div>
        </div>
      </div>

      {/* 职业 + 教育 */}
      <div className="mb-3 space-y-1">
        <div className="text-sm text-foreground font-medium">
          {candidate.occupation}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {educationDisplay}
        </div>
      </div>

      {/* 收入 + MBTI */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">
          {candidate.incomeRange}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
          {candidate.mbti}
        </span>
      </div>

      {/* 匹配分 */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">综合匹配分</span>
          <span className="text-2xl font-bold text-primary-gradient font-serif tabular-nums">
            {candidate.matchScore}
            <span className="text-sm font-normal text-muted-foreground ml-0.5">
              /100
            </span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary-gradient rounded-full transition-all duration-700 ease-out"
            style={{ width: `${candidate.matchScore}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 text-right">
          证据置信度 {candidate.evidenceConfidence}%
        </div>
      </div>

      {/* 匹配理由 */}
      <div className="mb-4 p-3 bg-accent/50 rounded-2xl">
        <p className="text-sm text-foreground leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-primary" />
          {candidate.matchReason}
        </p>
      </div>

      {/* 关键优势 */}
      {candidate.keyAdvantages.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1.5">关键优势</div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.keyAdvantages.map((adv: string, idx: number) => (
              <span
                key={idx}
                className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {adv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 主要折损 */}
      {candidate.majorTradeoffs.length > 0 && (
        <div className="mb-5">
          <div className="text-xs text-muted-foreground mb-1.5">主要折损</div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.majorTradeoffs.map((t: string, idx: number) => (
              <span
                key={idx}
                className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 设为目标按钮 */}
      <button
        onClick={() => onSelect(candidate.id)}
        disabled={isSelected}
        className={`w-full py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
          isSelected
            ? 'bg-green-500 text-white cursor-default'
            : 'bg-primary-gradient text-white hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {isSelected ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            已设为目标
          </span>
        ) : (
          '设为本期目标候选'
        )}
      </button>
    </div>
  );
};

/* ============ 主页面 ============ */

const POOL_OPTIONS = [
  { value: 10000, label: '1 万' },
  { value: 100000, label: '10 万' },
  { value: 1000000, label: '100 万' },
];

const WizardCandidatesPage = () => {
  const [poolSize, setPoolSize] = useState<number>(10000);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 页面加载时获取历史结果
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await candidateApi.get();
        if (result && result.resultsJson) {
          const parsed: Candidate[] = JSON.parse(result.resultsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCandidates(parsed);
            setPoolSize(result.poolSize || 10000);
            if (result.selectedCandidateId) {
              setSelectedId(result.selectedCandidateId);
            }
          }
        }
      } catch (err) {
        logger.info('No candidate history found, starting fresh', String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartSearch = async () => {
    if (isSearching) return;

    setIsSearching(true);
    setProgress(0);
    setCandidates([]);
    setSelectedId('');

    const totalSteps = 50;
    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep += 1;
      // 非线性增长：前快后慢
      const ratio = currentStep / totalSteps;
      const eased = 1 - Math.pow(1 - ratio, 2);
      const newProgress = Math.floor(eased * 100);
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setProgress(100);

        // 生成候选
        const newCandidates = generateCandidates(12);
        setCandidates(newCandidates);
        setIsSearching(false);

        // 保存到后端
        candidateApi
          .save(poolSize, JSON.stringify(newCandidates))
          .catch((err: unknown) => {
            logger.error('Failed to save candidates', String(err));
          });
      }
    }, 40);
  };

  const handleSelect = async (candidateId: string) => {
    if (selectedId === candidateId) return;

    try {
      await candidateApi.select(candidateId);
      setSelectedId(candidateId);
    } catch (err) {
      logger.error('Failed to select candidate', String(err));
    }
  };

  const currentMatched = useMemo(() => {
    if (!isSearching) return poolSize;
    return Math.floor((progress / 100) * poolSize);
  }, [isSearching, progress, poolSize]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          候选检索
        </h1>
        <p className="text-muted-foreground">
          Step 5 · 从海量候选中精准匹配 12 位高适配人选
        </p>
      </div>

      {/* 检索控制区 */}
      <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              候选检索
            </h2>
            <p className="text-sm text-muted-foreground">
              选择候选池规模，开始智能匹配
            </p>
          </div>
        </div>

        {/* 候选池规模选择 */}
        <div className="mb-6">
          <div className="text-sm font-medium text-foreground mb-3">
            候选池规模
          </div>
          <div className="flex flex-wrap gap-3">
            {POOL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => !isSearching && setPoolSize(opt.value)}
                disabled={isSearching}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  poolSize === opt.value
                    ? 'bg-primary-gradient text-white shadow-md'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80'
                } ${isSearching ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 开始检索按钮 */}
        <button
          onClick={handleStartSearch}
          disabled={isSearching}
          className={`w-full md:w-auto md:px-12 py-3.5 rounded-full text-base font-semibold text-white bg-primary-gradient shadow-md transition-all duration-200 ${
            isSearching
              ? 'opacity-80 cursor-not-allowed'
              : 'hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {isSearching ? '检索中...' : '开始检索'}
        </button>

        {/* 进度条 */}
        {(isSearching || (candidates.length > 0 && progress === 100)) && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isSearching
                  ? `正在匹配第 ${formatNumber(currentMatched)} / ${formatNumber(poolSize)} 个候选...`
                  : `检索完成 · 共匹配 ${formatNumber(poolSize)} 个候选`}
              </span>
              <span className="text-sm font-semibold text-primary-gradient tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary-gradient rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 合成数据说明 */}
      {candidates.length > 0 && (
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 px-4 py-2 bg-white/60 rounded-full border border-border">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            合成数据仅用于流程测试，不代表真实候选人
          </p>
        </div>
      )}

      {/* 候选结果网格 */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate: Candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedId === candidate.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isSearching && candidates.length === 0 && (
        <div className="bg-white rounded-[28px] p-12 shadow-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            尚未开始检索
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            选择候选池规模，点击「开始检索」，系统将基于你的偏好模型从海量候选中筛选出最匹配的 12 位人选。
          </p>
        </div>
      )}
    </div>
  );
};

export default WizardCandidatesPage;
