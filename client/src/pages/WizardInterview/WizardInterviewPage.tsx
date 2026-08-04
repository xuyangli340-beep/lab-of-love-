import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  SkipForward,
  HelpCircle,
  Sparkles,
  Quote,
  AlertCircle,
  BarChart3,
  Layers,
  Shield,
  Scale,
} from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Textarea } from '@client/src/components/ui/textarea';
import { Badge } from '@client/src/components/ui/badge';
import { Progress } from '@client/src/components/ui/progress';
import { ScrollArea } from '@client/src/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/src/components/ui/tabs';
import { interviewApi, evidenceApi } from '@client/src/api/index';
import type { InterviewAnswer, EvidenceItem, EvidenceStats } from '@shared/api.interface';

/* ============================================================
 * 18 模块访谈题库（每模块 7-8 题，共约 139 题）
 * ============================================================ */
interface InterviewModule {
  id: number;
  name: string;
  questions: string[];
}

const INTERVIEW_MODULES: InterviewModule[] = [
  {
    id: 1,
    name: '开场与契约',
    questions: [
      '欢迎来到理性心动实验室。在我们开始之前，你希望这次访谈帮你理清什么？',
      '你对"深度匹配"的理解是什么？你认为它和普通相亲最大的不同在哪里？',
      '这次访谈大约会涉及 18 个模块、139 道题。你愿意全程诚实面对自己吗？',
      '如果访谈中某些问题让你感到不舒服，你可以选择跳过或标记待追问。你现在的心理状态如何？',
      '你希望我们从哪个角度切入来了解你——是先聊生活日常，还是先聊价值观？',
      '你对"理性心动"这个说法有什么感觉？它让你想到什么？',
      '在开始正式访谈前，还有什么想先告诉我的吗？',
    ],
  },
  {
    id: 2,
    name: '当前生活状态',
    questions: [
      '请描述一下你典型的一天是怎么度过的——从起床到入睡。',
      '你现在的生活节奏让你满意吗？如果满分 10 分，你打几分？',
      '工作/学习在你生活中占多大比重？你觉得这个比例合适吗？',
      '你平时独处的时间多吗？独处时你通常做什么？',
      '你最近一次感到"真正开心"是什么时候？因为什么事？',
      '你目前生活中最大的压力来源是什么？你是怎么应对的？',
      '如果给你一个完全自由的周末，你会怎么安排？',
      '你觉得自己现在的生活状态适合进入一段亲密关系吗？为什么？',
    ],
  },
  {
    id: 3,
    name: '第一眼心动',
    questions: [
      '回想一下，你最近一次对一个人心动是什么时候？对方身上什么东西吸引了你？',
      '你对"第一眼心动"相信多少？你觉得它可靠吗？',
      '在你看来，外表吸引力在一段关系中重要吗？占多大比重？',
      '有没有某种类型的人，你几乎每次都会被吸引？描述一下这种"类型"。',
      '你有没有过"一开始没感觉，后来慢慢喜欢上"的经历？是什么改变了你的感受？',
      '当你对一个人心动时，你通常会有什么生理或心理反应？',
      '你觉得"心动"和"喜欢"是一回事吗？它们的区别在哪里？',
    ],
  },
  {
    id: 4,
    name: '过往关系',
    questions: [
      '你经历过几段认真的感情？最长的一段持续了多久？',
      '上一段关系为什么结束？现在回头看，你觉得主要原因是什么？',
      '在过往的关系中，你最感激前任的是什么？',
      '过往关系中，你觉得自己做得不够好的地方是什么？',
      '有没有哪段感情对你影响特别大？它如何塑造了现在的你？',
      '你从过去的感情中学到的最重要的一课是什么？',
      '你有没有"未完成"的感情遗憾？如果有，是什么？',
      '现在再想起前任，你主要的情绪是什么？',
    ],
  },
  {
    id: 5,
    name: '沟通回应',
    questions: [
      '当你和伴侣发生分歧时，你通常的第一反应是什么？',
      '你觉得自己是一个"好的倾听者"吗？为什么？',
      '在沟通中，什么情况最容易让你情绪失控？',
      '你更喜欢当面沟通还是文字沟通？为什么？',
      '当对方心情不好时，你通常会怎么做？你觉得这是对方需要的吗？',
      '你有没有"冷暴力"的倾向？在什么情况下会出现？',
      '你认为情侣之间每天需要保持多长时间的联系？',
    ],
  },
  {
    id: 6,
    name: '冲突修复',
    questions: [
      '吵架后，你通常需要多久才能冷静下来？',
      '你是那种会先低头认错的人吗？还是一定要等对方先开口？',
      '你觉得情侣之间吵架的底线是什么？什么话绝对不能说？',
      '描述一次你和伴侣成功化解冲突的经历。你们是怎么做到的？',
      '你有没有"翻旧账"的习惯？为什么会这样？',
      '冲突之后，你需要什么样的方式来"和好"？',
      '在你看来，什么样的冲突是"无法修复"的？',
    ],
  },
  {
    id: 7,
    name: '诚信边界',
    questions: [
      '你认为情侣之间应该"完全透明"吗？还是每个人都需要自己的空间？',
      '你能接受对方看你的手机吗？为什么？',
      '在一段关系中，你绝对不能容忍的行为是什么？',
      '你怎么定义"出轨"？精神出轨算出轨吗？',
      '你有没有过对伴侣撒谎的经历？是什么样的谎言？',
      '你觉得异性朋友的边界在哪里？什么程度的交往是你不能接受的？',
      '如果对方做了让你不舒服的事，你会直接说出来还是默默忍受？',
    ],
  },
  {
    id: 8,
    name: '亲密独立',
    questions: [
      '你理想中的亲密关系是什么样的——是"两个人合成一个圆"还是"两个独立的圆相交"？',
      '你需要多少独处时间？如果独处时间不够会怎么样？',
      '你怎么看待"依赖"？你觉得依赖对方是软弱的表现吗？',
      '在一段关系中，你最怕失去什么——自我、自由、还是其他？',
      '你会把自己的朋友介绍给伴侣吗？介绍到什么程度？',
      '如果伴侣有一项你完全不感兴趣的爱好，你会怎么做？',
      '你觉得"粘人"是褒义词还是贬义词？为什么？',
    ],
  },
  {
    id: 9,
    name: '职业生活',
    questions: [
      '你对自己目前的职业发展满意吗？未来 3-5 年有什么规划？',
      '工作对你来说意味着什么——是谋生手段、自我实现、还是其他？',
      '你能接受伴侣的收入比你高/低吗？差距多大是你能接受的范围？',
      '如果事业和家庭发生冲突，你会怎么取舍？',
      '你怎么看待"全职太太"或"全职先生"？',
      '你希望伴侣在事业上对你有什么帮助或支持？',
      '你对"工作狂"怎么看？你自己是这样的人吗？',
    ],
  },
  {
    id: 10,
    name: '城市定居',
    questions: [
      '你目前在哪个城市生活？你喜欢这座城市吗？',
      '你未来打算定居在哪个城市？为什么选择那里？',
      '你能接受为了伴侣换城市生活吗？在什么条件下可以？',
      '你对"回老家发展"怎么看？这是你的选项之一吗？',
      '你理想中的居住环境是什么样的——市中心公寓、郊区大 house、还是其他？',
      '你觉得买房是结婚的必要条件吗？为什么？',
      '你对"双城生活"怎么看？你能接受吗？',
    ],
  },
  {
    id: 11,
    name: '婚姻子女',
    questions: [
      '你对婚姻的看法是什么？你为什么想结婚（或者不想结婚）？',
      '你理想中的结婚年龄是多少岁？现在距离这个目标还有多远？',
      '你想要孩子吗？想要几个？为什么？',
      '你觉得婚姻和恋爱最大的区别是什么？',
      '如果不能生育，你会怎么选择？',
      '你对"丁克"怎么看？你自己能接受吗？',
      '你希望在婚姻中扮演什么样的角色？',
      '你觉得"搭伙过日子"式的婚姻可悲吗？为什么？',
    ],
  },
  {
    id: 12,
    name: '金钱消费',
    questions: [
      '你目前的收入和储蓄情况如何？你对自己的财务状况满意吗？',
      '你的消费观念是什么样的——是及时行乐还是未雨绸缪？',
      '你觉得情侣之间应该 AA 制吗？还是男生多承担一些？',
      '你能接受的伴侣收入范围是多少？为什么是这个范围？',
      '你对"彩礼/嫁妆"怎么看？你觉得有必要吗？',
      '如果伴侣有大额负债，你会怎么处理？',
      '你觉得家庭财务管理应该谁来管？为什么？',
      '你最大的一笔消费是什么？事后后悔吗？',
    ],
  },
  {
    id: 13,
    name: '教育认知',
    questions: [
      '你对自己的教育背景满意吗？它对你的人生有什么影响？',
      '你对伴侣的学历有什么要求？为什么？',
      '你觉得"学历差距"会成为感情的障碍吗？',
      '你平时读书/学习的时间多吗？最近在读什么？',
      '你对"认知层次"这个说法怎么看？你觉得它重要吗？',
      '如果有了孩子，你对孩子的教育有什么规划或期待？',
      '你觉得一个人最重要的能力是什么？',
    ],
  },
  {
    id: 14,
    name: '社交方式',
    questions: [
      '你是偏内向还是偏外向的人？你觉得这个特质给你带来了什么？',
      '你朋友多吗？最核心的朋友圈有几个人？',
      '你喜欢什么样的社交场合？什么样的场合让你不舒服？',
      '你和朋友多久聚一次？通常做什么？',
      '你能接受伴侣有很多异性朋友吗？为什么？',
      '你怎么看待"社交圈不同"的两个人在一起？',
      '你是那种会把朋友和伴侣分开的人吗？还是会让他们融入彼此？',
    ],
  },
  {
    id: 15,
    name: '硬约束',
    questions: [
      '在选择伴侣时，你有哪些"绝对不能妥协"的条件？请列出 3-5 条。',
      '这些硬约束中，哪一条是最核心的？为什么它这么重要？',
      '你有没有过因为某条硬约束不满足而果断放弃的经历？',
      '你觉得自己的硬约束会不会太严格？有没有松动的可能？',
      '你怎么看待"为了爱改变自己的底线"这件事？',
      '如果对方其他方面都很好，但有一条硬约束不满足，你会怎么选？',
      '你的硬约束是从什么时候开始形成的？什么经历塑造了它们？',
      '你觉得硬约束越多越好，还是越少越好？为什么？',
    ],
  },
  {
    id: 16,
    name: '高价值取舍',
    questions: [
      '如果让你在"有趣的灵魂"和"好看的皮囊"之间选，你选哪个？为什么？',
      '你更看重伴侣的"潜力"还是"现状"？为什么？',
      '性格和智商，你觉得哪个更重要？',
      '你愿意为了更高的物质生活牺牲一部分感情浓度吗？',
      '在你看来，"安全感"和"心动感"哪个更重要？',
      '你怎么定义"高价值伴侣"？请列出你心中 Top 3 的特质。',
      '如果必须放弃一个你看重的特质，你会放弃哪个？为什么？',
      '你觉得自己最核心的"价值"是什么？你希望对方因此选择你。',
    ],
  },
  {
    id: 17,
    name: '双向选择',
    questions: [
      '你觉得自己最大的优点是什么？最大的缺点是什么？',
      '什么样的人会喜欢你这样的人？',
      '你觉得自己在婚恋市场上的竞争力如何？打几分？',
      '你有没有想过，你想要的那种人，为什么会选择你？',
      '你能接受伴侣比你优秀很多吗？为什么？',
      '"门当户对"在你心中是什么意思？你觉得它重要吗？',
      '如果遇到一个你很喜欢但对方似乎没那么喜欢你的人，你会怎么做？',
    ],
  },
  {
    id: 18,
    name: '结束确认',
    questions: [
      '做完这 139 道题，你有什么感受？',
      '有没有哪个问题让你印象特别深？为什么？',
      '经过这次访谈，你对自己有没有新的发现？',
      '你对接下来的"偏好模型构建"有什么期待？',
      '你觉得这次访谈中，有没有什么重要的东西我们没聊到？',
      '如果让你给这次访谈打分（1-10分），你打几分？为什么？',
      '在我们结束之前，还有什么想补充的吗？',
    ],
  },
];

const TOTAL_QUESTIONS = INTERVIEW_MODULES.reduce(
  (sum: number, m: InterviewModule) => sum + m.questions.length,
  0,
);

/* ============================================================
 * 证据提取算法
 * ============================================================ */
interface ExtractedEvidence {
  factorName: string;
  evidenceMeaning: string;
  evidenceStrength: number;
  isHardConstraint: boolean;
  isHighPriority: boolean;
  isTradeoffEvidence: boolean;
  originalQuotes: string[];
  tags: string[];
  followupQuestions: string[];
}

const HARD_CONSTRAINT_PATTERNS = [
  { pattern: /必须|一定得|绝对要|非...不可|没有...不行/gi, weight: 30 },
  { pattern: /绝对不能|绝对不可以|绝不接受|完全不能忍|根本不可能/gi, weight: 40 },
  { pattern: /底线|原则问题|没得商量|没有商量余地/gi, weight: 35 },
  { pattern: /只要...就|如果...就一定/gi, weight: 20 },
];

const HIGH_PRIORITY_PATTERNS = [
  { pattern: /我更看重|我特别在意|我很重视|我很看重|最关键的是|最重要的是/gi, weight: 25 },
  { pattern: /比.*重要|比.*更关键|远胜于|胜过/gi, weight: 30 },
  { pattern: /核心|本质|根本上|说到底/gi, weight: 20 },
  { pattern: /一定要有|必须具备|不可或缺|少不了/gi, weight: 28 },
];

const TRADEOFF_PATTERNS = [
  { pattern: /如果.*宁愿|与其.*不如/gi, weight: 25 },
  { pattern: /取舍|权衡|妥协|让步/gi, weight: 20 },
  { pattern: /可以接受.*但|虽然.*但是/gi, weight: 15 },
  { pattern: /二选一|选哪个|哪个更重要/gi, weight: 22 },
];

const EMOTION_PATTERNS = [
  { pattern: /很受伤|心碎|难过|失望|绝望|崩溃/gi, weight: 20, emotion: '负面情绪' },
  { pattern: /开心|幸福|温暖|踏实|安心|心动/gi, weight: 18, emotion: '正面情绪' },
  { pattern: /焦虑|不安|担心|害怕|恐惧/gi, weight: 22, emotion: '焦虑恐惧' },
  { pattern: /愤怒|生气|恼火|气炸/gi, weight: 20, emotion: '愤怒情绪' },
];

const RELATIONSHIP_HISTORY_PATTERNS = [
  { pattern: /前任|前男友|前女友|上一段|上次恋爱/gi, weight: 20 },
  { pattern: /分手|离婚|分开了|结束了/gi, weight: 22 },
  { pattern: /以前|曾经|过去|那时候/gi, weight: 10 },
];

function splitSentences(text: string): string[] {
  return text
    .split(/[。！？!?\n]/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 4);
}

function extractEvidenceFromAnswer(
  questionText: string,
  answerText: string,
): ExtractedEvidence[] {
  if (!answerText || answerText.trim().length < 10) return [];

  const results: ExtractedEvidence[] = [];
  const sentences = splitSentences(answerText);

  // 硬约束检测
  let hardConstraintScore = 0;
  const hardQuotes: string[] = [];
  for (const { pattern, weight } of HARD_CONSTRAINT_PATTERNS) {
    for (const sent of sentences) {
      if (pattern.test(sent)) {
        hardConstraintScore += weight;
        if (!hardQuotes.includes(sent)) hardQuotes.push(sent);
      }
      pattern.lastIndex = 0;
    }
  }
  if (hardConstraintScore > 0 && hardQuotes.length > 0) {
    results.push({
      factorName: `硬约束：${questionText.slice(0, 15)}${questionText.length > 15 ? '...' : ''}`,
      evidenceMeaning: '回答中出现强烈的肯定/否定语气词，表明这是不可妥协的底线条件。',
      evidenceStrength: Math.min(100, hardConstraintScore + 20),
      isHardConstraint: true,
      isHighPriority: false,
      isTradeoffEvidence: false,
      originalQuotes: hardQuotes.slice(0, 3),
      tags: ['硬约束'],
      followupQuestions: ['这条底线是从什么时候开始形成的？', '有没有过例外的情况？'],
    });
  }

  // 高优先级检测
  let highPriorityScore = 0;
  const highPriorityQuotes: string[] = [];
  for (const { pattern, weight } of HIGH_PRIORITY_PATTERNS) {
    for (const sent of sentences) {
      if (pattern.test(sent)) {
        highPriorityScore += weight;
        if (!highPriorityQuotes.includes(sent)) highPriorityQuotes.push(sent);
      }
      pattern.lastIndex = 0;
    }
  }
  if (highPriorityScore > 0 && highPriorityQuotes.length > 0) {
    results.push({
      factorName: `高优先级：${questionText.slice(0, 15)}${questionText.length > 15 ? '...' : ''}`,
      evidenceMeaning: '回答中明确表达了价值排序和优先选择倾向。',
      evidenceStrength: Math.min(100, highPriorityScore + 15),
      isHardConstraint: false,
      isHighPriority: true,
      isTradeoffEvidence: false,
      originalQuotes: highPriorityQuotes.slice(0, 3),
      tags: ['高优先级'],
      followupQuestions: ['这个优先级是怎么形成的？', '如果两者都能满足，你会怎么选？'],
    });
  }

  // 取舍证据检测
  let tradeoffScore = 0;
  const tradeoffQuotes: string[] = [];
  for (const { pattern, weight } of TRADEOFF_PATTERNS) {
    for (const sent of sentences) {
      if (pattern.test(sent)) {
        tradeoffScore += weight;
        if (!tradeoffQuotes.includes(sent)) tradeoffQuotes.push(sent);
      }
      pattern.lastIndex = 0;
    }
  }
  if (tradeoffScore > 0 && tradeoffQuotes.length > 0) {
    results.push({
      factorName: `取舍证据：${questionText.slice(0, 15)}${questionText.length > 15 ? '...' : ''}`,
      evidenceMeaning: '回答中体现了明确的权衡取舍思维，反映了价值判断的优先级。',
      evidenceStrength: Math.min(100, tradeoffScore + 10),
      isHardConstraint: false,
      isHighPriority: false,
      isTradeoffEvidence: true,
      originalQuotes: tradeoffQuotes.slice(0, 3),
      tags: ['取舍证据'],
      followupQuestions: ['这个取舍背后更深层的原因是什么？', '如果条件变化，你的选择会变吗？'],
    });
  }

  // 情绪反应检测
  for (const { pattern, weight, emotion } of EMOTION_PATTERNS) {
    const emotionQuotes: string[] = [];
    let emotionScore = 0;
    for (const sent of sentences) {
      if (pattern.test(sent)) {
        emotionScore += weight;
        if (!emotionQuotes.includes(sent)) emotionQuotes.push(sent);
      }
      pattern.lastIndex = 0;
    }
    if (emotionScore > 0 && emotionQuotes.length > 0) {
      results.push({
        factorName: `情绪反应：${emotion}`,
        evidenceMeaning: `回答中检测到${emotion}相关表达，反映了该话题的情感投入程度。`,
        evidenceStrength: Math.min(100, emotionScore + 10),
        isHardConstraint: false,
        isHighPriority: false,
        isTradeoffEvidence: false,
        originalQuotes: emotionQuotes.slice(0, 3),
        tags: ['情绪反应', emotion as string],
        followupQuestions: ['这种情绪背后更深层的原因是什么？', '你通常怎么处理这种情绪？'],
      });
    }
  }

  // 关系历史检测
  let historyScore = 0;
  const historyQuotes: string[] = [];
  for (const { pattern, weight } of RELATIONSHIP_HISTORY_PATTERNS) {
    for (const sent of sentences) {
      if (pattern.test(sent)) {
        historyScore += weight;
        if (!historyQuotes.includes(sent)) historyQuotes.push(sent);
      }
      pattern.lastIndex = 0;
    }
  }
  if (historyScore > 0 && historyQuotes.length > 0) {
    results.push({
      factorName: `关系历史：${questionText.slice(0, 12)}${questionText.length > 12 ? '...' : ''}`,
      evidenceMeaning: '回答中提到了过往关系经历，这是理解偏好形成的重要线索。',
      evidenceStrength: Math.min(100, historyScore + 15),
      isHardConstraint: false,
      isHighPriority: false,
      isTradeoffEvidence: false,
      originalQuotes: historyQuotes.slice(0, 3),
      tags: ['关系历史'],
      followupQuestions: ['这段经历对你现在的择偶观有什么影响？', '如果重来一次，你会怎么做？'],
    });
  }

  return results;
}

/* ============================================================
 * 主组件
 * ============================================================ */
const WizardInterviewPage = () => {
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Map<string, InterviewAnswer>>(new Map());
  const [currentAnswerText, setCurrentAnswerText] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<InterviewAnswer['status']>('unanswered');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [evidenceStats, setEvidenceStats] = useState<EvidenceStats>({
    factorCount: 0,
    evidenceCount: 0,
    hardConstraintCount: 0,
    tradeoffCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<string>('question');
  const [interviewId, setInterviewId] = useState<string>('');
  const [saveIndicator, setSaveIndicator] = useState<string>('');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentModule = INTERVIEW_MODULES[currentModuleIdx];
  const currentQuestion = currentModule?.questions[currentQuestionIdx] ?? '';
  const answerKey = `${currentModuleIdx}-${currentQuestionIdx}`;

  /* ---- 初始化：加载访谈记录和已有答案 ---- */
  useEffect(() => {
    const initInterview = async () => {
      try {
        setLoading(true);
        const current = await interviewApi.getCurrent();
        if (current?.id) {
          setInterviewId(current.id);
          const [answersRes, evidenceRes, statsRes] = await Promise.all([
            interviewApi.getAnswers(),
            evidenceApi.getList(),
            evidenceApi.getStats(),
          ]);
          const answerMap = new Map<string, InterviewAnswer>();
          for (const a of answersRes.items) {
            answerMap.set(`${a.moduleIndex}-${a.questionIndex}`, a);
          }
          setAnswers(answerMap);
          setEvidenceList(evidenceRes.items);
          setEvidenceStats(statsRes);
          // 定位到第一道未答的题
          for (let mi = 0; mi < INTERVIEW_MODULES.length; mi++) {
            const m = INTERVIEW_MODULES[mi];
            for (let qi = 0; qi < m.questions.length; qi++) {
              const key = `${mi}-${qi}`;
              const a = answerMap.get(key);
              if (!a || a.status === 'unanswered') {
                setCurrentModuleIdx(mi);
                setCurrentQuestionIdx(qi);
                return;
              }
            }
          }
        } else {
          const created = await interviewApi.create();
          setInterviewId(created.id);
        }
      } catch (error) {
        logger.error('Failed to init interview', String(error));
        // 即使失败也创建一个本地访谈
        setInterviewId('local-' + Date.now());
      } finally {
        setLoading(false);
      }
    };
    initInterview();
  }, []);

  /* ---- 切换题目时加载已有答案 ---- */
  useEffect(() => {
    const existing = answers.get(answerKey);
    if (existing) {
      setCurrentAnswerText(existing.answerText || '');
      setCurrentStatus(existing.status);
    } else {
      setCurrentAnswerText('');
      setCurrentStatus('unanswered');
    }
  }, [currentModuleIdx, currentQuestionIdx, answers, answerKey]);

  /* ---- 防抖保存 ---- */
  const debouncedSave = useCallback(
    (text: string, status: InterviewAnswer['status']) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setSaveIndicator('正在保存...');
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const existing = answers.get(answerKey);
          if (existing?.id) {
            await interviewApi.updateAnswer(existing.id, {
              answerText: text,
              status,
            });
            setAnswers((prev) => {
              const next = new Map(prev);
              const cur = next.get(answerKey);
              if (cur) {
                next.set(answerKey, { ...cur, answerText: text, status });
              }
              return next;
            });
          }
          setSaveIndicator('已保存');
          setTimeout(() => setSaveIndicator(''), 1500);
        } catch (error) {
          logger.error('Failed to save answer', String(error));
          setSaveIndicator('保存失败');
        }
      }, 1000);
    },
    [answers, answerKey],
  );

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentAnswerText(text);
    const newStatus: InterviewAnswer['status'] =
      text.trim().length > 0 ? 'answered' : 'unanswered';
    if (currentStatus === 'unanswered' || currentStatus === 'answered') {
      setCurrentStatus(newStatus);
    }
    debouncedSave(text, currentStatus === 'unanswered' ? newStatus : currentStatus);
  };

  /* ---- 状态按钮 ---- */
  const setQuestionStatus = (status: InterviewAnswer['status']) => {
    setCurrentStatus(status);
    debouncedSave(currentAnswerText, status);
  };

  /* ---- 导航 ---- */
  const goToPrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else if (currentModuleIdx > 0) {
      const prevModule = INTERVIEW_MODULES[currentModuleIdx - 1];
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentQuestionIdx(prevModule.questions.length - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIdx < currentModule.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else if (currentModuleIdx < INTERVIEW_MODULES.length - 1) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentQuestionIdx(0);
    }
  };

  const goToModule = (idx: number) => {
    setCurrentModuleIdx(idx);
    setCurrentQuestionIdx(0);
  };

  /* ---- 提取证据 ---- */
  const handleExtractEvidence = async () => {
    if (!currentAnswerText || currentAnswerText.trim().length < 10) return;
    try {
      setExtracting(true);
      const extracted = extractEvidenceFromAnswer(currentQuestion, currentAnswerText);
      if (extracted.length === 0) {
        setExtracting(false);
        return;
      }
      // 保存到后端
      const items = extracted.map((e) => ({
        factorName: e.factorName,
        evidenceMeaning: e.evidenceMeaning,
        evidenceStrength: e.evidenceStrength,
        isHardConstraint: e.isHardConstraint,
        isHighPriority: e.isHighPriority,
        isTradeoffEvidence: e.isTradeoffEvidence,
        originalQuotes: e.originalQuotes,
        tags: e.tags,
        followupQuestions: e.followupQuestions,
      }));
      await evidenceApi.batchCreate(items);
      // 刷新列表和统计
      const [listRes, statsRes] = await Promise.all([
        evidenceApi.getList(),
        evidenceApi.getStats(),
      ]);
      setEvidenceList(listRes.items);
      setEvidenceStats(statsRes);
    } catch (error) {
      logger.error('Failed to extract evidence', String(error));
    } finally {
      setExtracting(false);
    }
  };

  /* ---- 计算每个模块的完成进度 ---- */
  const moduleProgress = useMemo(() => {
    return INTERVIEW_MODULES.map((m, mi) => {
      let answered = 0;
      for (let qi = 0; qi < m.questions.length; qi++) {
        const a = answers.get(`${mi}-${qi}`);
        if (a && a.status !== 'unanswered' && a.status !== 'skipped') {
          answered++;
        }
      }
      return { answered, total: m.questions.length };
    });
  }, [answers]);

  const overallAnswered = useMemo(() => {
    return moduleProgress.reduce((sum, p) => sum + p.answered, 0);
  }, [moduleProgress]);

  /* ---- 标签颜色映射 ---- */
  const getTagStyle = (tag: string): string => {
    if (tag === '硬约束') return 'bg-pink-100 text-pink-700 border-pink-200';
    if (tag === '高优先级') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (tag === '取舍证据') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (tag === '情绪反应' || tag.includes('情绪'))
      return 'bg-rose-100 text-rose-700 border-rose-200';
    if (tag === '关系历史') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEvidenceLeftBar = (item: EvidenceItem): string => {
    if (item.isHardConstraint) return 'bg-pink-500';
    if (item.isHighPriority) return 'bg-purple-500';
    if (item.isTradeoffEvidence) return 'bg-amber-500';
    if (item.tags.some((t) => t.includes('情绪'))) return 'bg-rose-500';
    return 'bg-blue-500';
  };

  const isFirstQuestion = currentModuleIdx === 0 && currentQuestionIdx === 0;
  const isLastQuestion =
    currentModuleIdx === INTERVIEW_MODULES.length - 1 &&
    currentQuestionIdx === currentModule.questions.length - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">加载访谈数据中...</div>
      </div>
    );
  }

  /* ============================================================
   * 左侧导航
   * ============================================================ */
  const LeftNav = () => (
    <div className="bg-white/50 rounded-[28px] p-4 h-full border border-border/50">
      <div className="mb-4 px-2">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
          18 模块导航
        </h3>
        <p className="text-xs text-muted-foreground">
          已完成 {overallAnswered} / {TOTAL_QUESTIONS} 题
        </p>
        <Progress
          value={(overallAnswered / TOTAL_QUESTIONS) * 100}
          className="mt-2 h-1.5"
        />
      </div>
      <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
        <div className="space-y-1.5 pr-1">
          {INTERVIEW_MODULES.map((m, idx) => {
            const prog = moduleProgress[idx];
            const pct = (prog.answered / prog.total) * 100;
            const isActive = idx === currentModuleIdx;
            return (
              <button
                key={m.id}
                onClick={() => goToModule(idx)}
                className={`w-full text-left rounded-2xl p-3 transition-all ${
                  isActive
                    ? 'bg-primary-gradient text-white shadow-md'
                    : 'hover:bg-accent/60 text-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold tabular-nums flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-sm font-medium truncate ${
                        isActive ? 'text-on-dark-gradient' : ''
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 h-1 rounded-full overflow-hidden ${
                      isActive ? 'bg-white/20' : 'bg-border'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        isActive ? 'bg-white' : 'bg-primary-gradient'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs tabular-nums flex-shrink-0 ${
                      isActive ? 'text-white/80' : 'text-muted-foreground'
                    }`}
                  >
                    {prog.answered}/{prog.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  /* ============================================================
   * 中间答题区
   * ============================================================ */
  const QuestionPanel = () => (
    <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-md border border-border/50 h-full flex flex-col">
      {/* 顶部题号 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium"
          >
            模块 {currentModuleIdx + 1} · {currentModule.name}
          </Badge>
          <span className="text-sm text-muted-foreground tabular-nums">
            第 {currentQuestionIdx + 1} / {currentModule.questions.length} 题
          </span>
        </div>
        {saveIndicator && (
          <span className="text-xs text-muted-foreground">{saveIndicator}</span>
        )}
      </div>

      {/* 进度条 */}
      <Progress
        value={((currentQuestionIdx + 1) / currentModule.questions.length) * 100}
        className="h-1 mb-8"
      />

      {/* 主问题 */}
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground leading-relaxed mb-3">
        {currentQuestion}
      </h2>

      {/* 追问提示 */}
      <p className="text-sm italic text-muted-foreground mb-6">
        💡 提示：试着说出你真实的想法，哪怕它听起来不那么"正确"。越诚实，证据提取越精准。
      </p>

      {/* 回答输入区 */}
      <div className="flex-1 mb-6">
        <Textarea
          ref={textareaRef}
          value={currentAnswerText}
          onChange={handleAnswerChange}
          placeholder="在这里写下你的回答..."
          className="min-h-[200px] md:min-h-[280px] text-base leading-relaxed resize-none rounded-2xl p-4 border-border focus:border-primary/40"
        />
      </div>

      {/* 底部操作栏 */}
      <div className="border-t border-border pt-5 space-y-4">
        {/* 状态按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentStatus === 'answered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuestionStatus('answered')}
            className={`rounded-full ${
              currentStatus === 'answered'
                ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500'
                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            已回答
          </Button>
          <Button
            variant={currentStatus === 'skipped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuestionStatus('skipped')}
            className={`rounded-full ${
              currentStatus === 'skipped'
                ? 'bg-gray-500 hover:bg-gray-600 border-gray-500'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <SkipForward className="w-4 h-4" />
            跳过
          </Button>
          <Button
            variant={currentStatus === 'pending_followup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuestionStatus('pending_followup')}
            className={`rounded-full ${
              currentStatus === 'pending_followup'
                ? 'bg-amber-500 hover:bg-amber-600 border-amber-500'
                : 'text-amber-600 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            待追问
          </Button>
        </div>

        {/* 导航 + 提取按钮 */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={goToPrev}
            disabled={isFirstQuestion}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
            上一题
          </Button>

          <Button
            onClick={handleExtractEvidence}
            disabled={extracting || currentAnswerText.trim().length < 10}
            className="rounded-full bg-primary-gradient hover:opacity-90 text-white border-0 shadow-md px-6"
          >
            <Sparkles className="w-4 h-4" />
            {extracting ? '提取中...' : '提取访谈证据'}
          </Button>

          <Button
            variant="outline"
            onClick={goToNext}
            disabled={isLastQuestion}
            className="rounded-full"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  /* ============================================================
   * 右侧证据面板
   * ============================================================ */
  const EvidencePanel = () => (
    <div className="bg-gradient-to-b from-pink-50 to-purple-50 rounded-[28px] p-6 border border-border/50 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
          证据地图
        </h3>
        <p className="text-xs text-muted-foreground">
          从你的回答中自动识别的偏好因子
        </p>
      </div>

      {/* 4 个数字卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground">因子数</span>
          </div>
          <div className="text-2xl font-bold text-foreground font-serif tabular-nums">
            {evidenceStats.factorCount}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-pink-600" />
            </div>
            <span className="text-xs text-muted-foreground">证据片段</span>
          </div>
          <div className="text-2xl font-bold text-foreground font-serif tabular-nums">
            {evidenceStats.evidenceCount}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xs text-muted-foreground">硬约束</span>
          </div>
          <div className="text-2xl font-bold text-foreground font-serif tabular-nums">
            {evidenceStats.hardConstraintCount}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-xs text-muted-foreground">取舍证据</span>
          </div>
          <div className="text-2xl font-bold text-foreground font-serif tabular-nums">
            {evidenceStats.tradeoffCount}
          </div>
        </div>
      </div>

      {/* 证据卡片列表 */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-1">
            {evidenceList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">还没有提取到证据</p>
                <p className="text-xs mt-1">回答问题后点击「提取访谈证据」</p>
              </div>
            ) : (
              evidenceList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-border relative overflow-hidden"
                >
                  {/* 左侧彩色竖条 */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${getEvidenceLeftBar(
                      item,
                    )}`}
                  />

                  {/* 因子名称 */}
                  <h4 className="font-semibold text-foreground text-sm mb-2 pl-2">
                    {item.factorName}
                  </h4>

                  {/* 证据强度 */}
                  <div className="mb-3 pl-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">证据强度</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {item.evidenceStrength}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-gradient rounded-full transition-all"
                        style={{ width: `${item.evidenceStrength}%` }}
                      />
                    </div>
                  </div>

                  {/* 标签组 */}
                  <div className="flex flex-wrap gap-1.5 mb-3 pl-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-full border ${getTagStyle(
                          tag,
                        )}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 含义说明 */}
                  <p className="text-xs text-muted-foreground mb-3 pl-2 leading-relaxed">
                    {item.evidenceMeaning}
                  </p>

                  {/* 原话引用 */}
                  {item.originalQuotes.length > 0 && (
                    <div className="border-l-2 border-purple-200 pl-3 py-1 mb-3 bg-purple-50/50 rounded-r-lg">
                      <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                        <Quote className="w-3 h-3" />
                        <span className="font-medium">原话引用</span>
                      </div>
                      {item.originalQuotes.map((q, i) => (
                        <p
                          key={i}
                          className="text-xs text-foreground/80 italic leading-relaxed"
                        >
                          "{q}"
                        </p>
                      ))}
                    </div>
                  )}

                  {/* 待追问建议 */}
                  {item.followupQuestions.length > 0 && (
                    <div className="pl-2">
                      <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">待追问建议</span>
                      </div>
                      {item.followupQuestions.map((q, i) => (
                        <p key={i} className="text-xs text-amber-700/80 leading-relaxed">
                          · {q}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  /* ============================================================
   * 渲染：桌面三栏 / 移动端 Tab
   * ============================================================ */
  return (
    <div className="w-full">
      {/* 页面标题 */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          <span className="text-primary-gradient">深度访谈</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Step 2 · 18 模块 · {TOTAL_QUESTIONS} 道题 · 用证据构建你的偏好模型
        </p>
      </div>

      {/* 桌面端三栏布局 */}
      <div className="hidden lg:flex gap-5 items-start">
        <div className="w-[240px] flex-shrink-0 sticky top-4">
          <LeftNav />
        </div>
        <div className="flex-1 min-w-0">
          <QuestionPanel />
        </div>
        <div className="w-[320px] flex-shrink-0 sticky top-4">
          <EvidencePanel />
        </div>
      </div>

      {/* 移动端 Tab 切换 */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1 rounded-2xl bg-white border border-border">
            <TabsTrigger
              value="nav"
              className="rounded-xl py-2 text-xs data-[state=active]:bg-primary-gradient data-[state=active]:text-white"
            >
              模块导航
            </TabsTrigger>
            <TabsTrigger
              value="question"
              className="rounded-xl py-2 text-xs data-[state=active]:bg-primary-gradient data-[state=active]:text-white"
            >
              答题
            </TabsTrigger>
            <TabsTrigger
              value="evidence"
              className="rounded-xl py-2 text-xs data-[state=active]:bg-primary-gradient data-[state=active]:text-white"
            >
              证据
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nav" className="mt-3">
            <LeftNav />
          </TabsContent>
          <TabsContent value="question" className="mt-3">
            <QuestionPanel />
          </TabsContent>
          <TabsContent value="evidence" className="mt-3">
            <EvidencePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WizardInterviewPage;
