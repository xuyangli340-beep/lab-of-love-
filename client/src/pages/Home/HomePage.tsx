import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Scale,
  FileSearch,
  AlertTriangle,
  UserCircle,
  MessageSquare,
  Brain,
  UserSearch,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { logger } from '@lark-apaas/client-toolkit/logger';

const sellingPoints = [
  {
    icon: Scale,
    title: '公式与权重公开',
    description:
      '每一项偏好的权重、每一条证据的强度都透明可查，你知道匹配是怎么算出来的。',
  },
  {
    icon: FileSearch,
    title: '证据优先于标签',
    description:
      '不凭星座、MBTI 做判断，所有结论都来自深度访谈中的真实表达与行为证据。',
  },
  {
    icon: AlertTriangle,
    title: '不确定性明确展示',
    description:
      '知道就是知道，不知道就是不知道。每条结论都标注置信度，不拿猜测当事实。',
  },
];

const wizardSteps = [
  {
    step: 1,
    icon: UserCircle,
    title: '最小档案',
    description: '填写基础信息，5 分钟完成入门档案。',
  },
  {
    step: 2,
    icon: MessageSquare,
    title: '深度访谈',
    description: '139 道结构化访谈，挖掘你真实的心动模式。',
  },
  {
    step: 3,
    icon: Brain,
    title: '偏好模型',
    description: '从访谈证据中提取偏好因子，权重可调可解释。',
  },
  {
    step: 4,
    icon: Sparkles,
    title: '理想画像',
    description: '生成你的理想伴侣画像，含心动分、稳定分、可达分。',
  },
  {
    step: 5,
    icon: UserSearch,
    title: '候选检索',
    description: '在高知白领池中匹配，按综合得分排序并展示证据。',
  },
  {
    step: 6,
    icon: Users,
    title: '服务团队',
    description: '专属红娘 + 心理咨询师 + 数据分析师，三人小组全程陪跑。',
  },
];

const HomePage = () => {
  const handleHeroCta = (action: string) => {
    logger.info(`HomePage hero CTA clicked: ${action}`);
  };

  return (
    <div className="flex flex-col gap-20 pb-12">
      {/* Hero 区 */}
      <section className="relative">
        {/* 粉紫渐变光晕背景 */}
        <div
          aria-hidden
          className="absolute inset-0 -top-8 -mx-6 rounded-[40px] overflow-hidden pointer-events-none"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-primary-gradient opacity-10 blur-[80px] rounded-full" />
          <div className="absolute top-20 left-[20%] w-[300px] h-[300px] bg-primary-gradient opacity-10 blur-[60px] rounded-full" />
          <div className="absolute top-32 right-[15%] w-[250px] h-[250px] bg-primary-gradient opacity-10 blur-[60px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center pt-16 pb-12 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8">
            <Heart className="w-4 h-4" />
            <span>婚联网 · 理性心动实验室</span>
          </div>

          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground max-w-4xl mb-6">
            聊清楚你如何心动，
            <br />
            也聊清楚你为什么会
            <span className="text-primary-gradient">长期选择一个人</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            婚联网·理性心动实验室 — 证据优先于标签
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/auth/login" onClick={() => handleHeroCta('login')}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base min-w-[140px]"
              >
                登录
              </Button>
            </Link>
            <Link to="/auth/register" onClick={() => handleHeroCta('register')}>
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base min-w-[140px] bg-primary-gradient text-primary-foreground border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                立即注册
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 核心卖点区 */}
      <section className="flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-3">
            为什么选择理性心动实验室
          </h2>
          <p className="text-muted-foreground max-w-xl">
            我们不做快餐式匹配，而是用科学方法帮你找到真正能长期走下去的人
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" data-ai-section-type="card-list">
          {sellingPoints.map((point) => {
            const Icon = point.icon;
            return (
              <Card
                key={point.title}
                className="rounded-[28px] border-0 shadow-md hover:shadow-lg transition-shadow bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-md mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-serif font-semibold text-foreground">
                    {point.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {point.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 六步向导预览区 */}
      <section className="flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-3">
            六步，找到你的理性心动
          </h2>
          <p className="text-muted-foreground max-w-xl">
            从最小档案到专属服务团队，每一步都有方法、有证据、有温度
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full" data-ai-section-type="card-list">
          {wizardSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.step}
                className="rounded-[28px] border-0 shadow-sm hover:shadow-md transition-shadow bg-card group"
              >
                <CardHeader className="pb-3 flex flex-row items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif font-bold text-lg group-hover:bg-primary-gradient group-hover:text-primary-foreground transition-colors">
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <CardTitle className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      {step.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12">
          <Link to="/auth/register">
            <Button
              size="lg"
              className="rounded-full px-10 h-12 text-base bg-primary-gradient text-primary-foreground border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              开始你的理性心动之旅
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
