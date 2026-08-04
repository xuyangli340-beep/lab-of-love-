// ========== 类型定义 ==========
export interface StaffMember {
  id: string;
  name: string;
  education: string;
  experience: string;
  specialties: string[];
  trackRecord: string;
  role: string;
  avatarColor: string;
}

export type RoleKey = 'interviewer' | 'model_advisor' | 'director';

export interface RoleTab {
  key: RoleKey;
  label: string;
}

// ========== 角色 Tab 配置 ==========
export const ROLE_TABS: RoleTab[] = [
  { key: 'interviewer', label: '访谈与客户联络负责人' },
  { key: 'model_advisor', label: '专属模型顾问' },
  { key: 'director', label: '服务总负责人' },
];

// ========== 渐变色板 ==========
export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

// ========== 预置员工数据生成 ==========
const generateStaff = (role: RoleKey, index: number): StaffMember => {
  const interviewerNames = [
    '林婉清', '陈思远', '苏雨桐', '王雅琴', '周明辉',
    '张静怡', '李博文', '赵晓岚', '刘宇航', '黄诗韵',
  ];
  const modelAdvisorNames = [
    '顾泽宇', '何雨辰', '罗梓涵', '谢明哲', '韩思琪',
    '冯昊天', '于若曦', '董子轩', '蒋雨欣', '蔡浩然',
  ];
  const directorNames = [
    '沈梦华', '曾伟强', '彭雅芝', '吕建华', '邓丽娟',
    '许志刚', '傅美玲', '姜文博', '范晓东', '方雪梅',
  ];

  const interviewerEducations = [
    '北京大学心理学博士',
    '清华大学社会学硕士',
    '北京师范大学临床心理学硕士',
    '华东师范大学心理学博士',
    '复旦大学社会学硕士',
    '南京大学心理学硕士',
    '中国人民大学社会学博士',
    '浙江大学应用心理学硕士',
    '武汉大学发展与教育心理学硕士',
    '中山大学心理学博士',
  ];

  const modelAdvisorEducations = [
    '清华大学统计学博士',
    '北京大学计算机科学博士',
    '中国科学院数学博士',
    '上海交通大学人工智能博士',
    '复旦大学数据科学博士',
    '浙江大学统计学博士',
    '中国科学技术大学计算机博士',
    '南京大学机器学习博士',
    '北京航空航天大学数据科学博士',
    '同济大学统计学硕士',
  ];

  const directorEducations = [
    '清华大学MBA',
    '北京大学光华管理学院MBA',
    '中欧国际工商学院EMBA',
    '复旦大学管理学硕士',
    '上海交通大学MBA',
    '浙江大学工商管理硕士',
    '中国人民大学企业管理硕士',
    '南京大学MBA',
    '武汉大学管理学博士',
    '中山大学工商管理硕士',
  ];

  const interviewerSpecialties = [
    ['深度倾听', '情感疏导', '信任建立'],
    ['结构化访谈', '心理测评', '需求挖掘'],
    ['婚恋咨询', '情绪管理', '沟通技巧'],
    ['人格分析', '价值观匹配', '深度访谈'],
    ['家庭治疗', '亲密关系', '冲突调解'],
    ['认知行为', '压力管理', '自我探索'],
    ['精神分析', '依恋理论', '关系修复'],
    ['积极心理学', '优势发掘', '成长教练'],
    ['团体咨询', '社交技能', '破冰引导'],
    ['青少年心理', '生涯规划', '自我认同'],
  ];

  const modelAdvisorSpecialties = [
    ['推荐算法', '特征工程', '模型调优'],
    ['机器学习', '数据挖掘', 'A/B测试'],
    ['深度学习', 'NLP', '语义匹配'],
    ['统计建模', '贝叶斯分析', '因果推断'],
    ['图神经网络', '社交网络', '社群发现'],
    ['强化学习', '多目标优化', '决策系统'],
    ['计算机视觉', '多模态', '特征融合'],
    ['时间序列', '预测模型', '趋势分析'],
    ['可解释AI', '模型评估', '偏差检测'],
    ['大数据架构', '分布式计算', '实时推荐'],
  ];

  const directorSpecialties = [
    ['团队管理', '战略规划', '客户关系'],
    ['项目管理', '质量控制', '流程优化'],
    ['资源整合', '危机处理', '高端服务'],
    ['品牌建设', '市场拓展', '客户体验'],
    ['人才培养', '绩效管理', '组织发展'],
    ['财务管理', '风险控制', '运营效率'],
    ['产品设计', '用户增长', '商业模式'],
    ['跨部门协作', '变革管理', '创新驱动'],
    ['客户成功', '续约管理', '口碑营销'],
    ['数据分析', '商业智能', '决策支持'],
  ];

  let name = '';
  let education = '';
  let specialties: string[] = [];
  let experience = '';
  let trackRecord = '';

  if (role === 'interviewer') {
    name = interviewerNames[index];
    education = interviewerEducations[index];
    specialties = interviewerSpecialties[index];
    const years = 5 + index;
    experience = `${years}年婚恋咨询经验`;
    const matches = 60 + index * 12;
    trackRecord = `成功匹配 ${matches} 对`;
  } else if (role === 'model_advisor') {
    name = modelAdvisorNames[index];
    education = modelAdvisorEducations[index];
    specialties = modelAdvisorSpecialties[index];
    const years = 3 + index;
    experience = `${years}年算法建模经验`;
    const accuracy = 82 + index;
    trackRecord = `模型准确率 ${accuracy}%`;
  } else {
    name = directorNames[index];
    education = directorEducations[index];
    specialties = directorSpecialties[index];
    const years = 10 + index;
    experience = `${years}年高端婚恋服务管理经验`;
    const cases = 200 + index * 30;
    trackRecord = `服务高端客户 ${cases}+`;
  }

  return {
    id: `${role}-${index}`,
    name,
    education,
    experience,
    specialties,
    trackRecord,
    role,
    avatarColor: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
  };
};

export const ALL_STAFF: Record<RoleKey, StaffMember[]> = {
  interviewer: Array.from({ length: 10 }, (_, i) => generateStaff('interviewer', i)),
  model_advisor: Array.from({ length: 10 }, (_, i) => generateStaff('model_advisor', i)),
  director: Array.from({ length: 10 }, (_, i) => generateStaff('director', i)),
};
