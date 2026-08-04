# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1 为设计意图与决策上下文。Code agent 实现时以 Section 2 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

-   **目标用户**: 高知白领，理性决策者，寻求深度匹配而非快餐交友，心理预期是「专业、严谨但有温度」
-   **核心目的**: 建立信任 + 引导深度行动（完成139题访谈与模型构建）
-   **情绪基调**: 温暖的专业感 / 克制的浪漫；避免廉价相亲感、过度甜腻或冰冷机械感

### 1.2 设计方向

-   **Design Style**: Soft Blocks 柔色块 + Gradient Ribbons 渐变飘带 — 大圆角(28px)传递安全感与高级感，粉紫渐变光晕平衡理性数据与感性心动
-   **Application Type**: Complex Web App (SaaS/Wizard) — 六步向导式全栈应用，兼顾信息密度与阅读舒适度
-   **Aesthetic Direction**: 「Evidence-First Warmth」— 用柔和的视觉容器承载硬核的结构化数据，让证据提取和模型调整过程显得优雅而不枯燥

## 2. Color System (色彩系统)

> 严格沿用用户指定的品牌色体系，通过 HSL 衍生确保无障碍与层次感。

**色彩关系**: 粉紫双主色渐变(#dc5aa3→#925ad5) + 深墨文字(#302532) + 浅粉底色(#fff6fa)
**配色设计理由**: 粉色传递婚恋温度，紫色象征理性与智慧，深墨色替代纯黑降低压迫感，整体营造「温暖专业的高级感」
**主色推导**: Primary 采用粉紫渐变作为行动点与高光，Accent 取极浅粉作为交互反馈底色，避免大面积高饱和造成视觉疲劳
**使用比例**: 70% 浅粉/白底 · 20% 深墨文字与卡片 · 10% 粉紫渐变用于 CTA、进度条、标签与关键高亮

### 2.1 主题颜色

| Token                | HSL 值                  | 说明                                         |
| -------------------- | ----------------------- | -------------------------------------------- |
| `background`         | hsl(330 100% 98%)       | 页面底色 #fff6fa 浅粉，温暖不刺眼            |
| `card`               | hsl(0 0% 100%)          | 纯白卡片，与浅粉底形成微妙层级               |
| `foreground`         | hsl(310 15% 17%)        | 深墨色 #302532，主文字                       |
| `muted-foreground`   | hsl(310 8% 45%)         | 次要文字，低对比度但不灰暗                   |
| `primary`            | linear-gradient(135deg, hsl(324 75% 61%), hsl(266 68% 59%)) | 粉紫渐变，用于主按钮、进度条填充、激活态      |
| `primary-foreground` | hsl(0 0% 100%)          | 白色文字/图标，确保渐变上可读                |
| `accent`             | hsl(324 40% 95%)        | 极浅粉 #fceef6，hover/focus/skeleton 背景     |
| `accent-foreground`  | hsl(324 75% 45%)        | 深粉文字，accent 上的操作提示                |
| `border`             | hsl(324 30% 90%)        | 边框色 #efd9e5，柔和分隔                     |

> **注意**: `primary` 为渐变，CSS 中定义为 `--primary-gradient: linear-gradient(135deg, hsl(324 75% 61%), hsl(266 68% 59%))`；纯色 primary fallback 为 `hsl(324 75% 61%)` 用于 ring/border 等不支持渐变的场景。

### 2.2 导航区配色

-   **基调关系**: 复用主配色，导航栏背景 `bg-card/80 backdrop-blur-md`，与浅粉内容区自然融合
-   **关键状态**: 当前步骤使用粉紫渐变文字+底部指示条；已完成步骤用 `text-primary` 纯色；未到达步骤用 `text-muted-foreground`
-   **边界与背景**: 非透明背景 `bg-card` + `border-b border-border`，确保 sticky 时内容不穿透

### 2.3 语义颜色

| 用途        | HSL 值              | 衍生说明                              |
| ----------- | ------------------- | ------------------------------------- |
| Success     | hsl(145 60% 42%)    | 证据提取成功、保存成功，绿色系        |
| Warning     | hsl(38 90% 50%)     | 待追问、硬约束提醒，橙黄大字号使用    |
| Destructive | hsl(350 80% 58%)    | 删除证据、跳过题目，红色系            |
| Info        | hsl(266 68% 59%)    | 模型说明、公式提示，取紫色主色变体    |

## 3. Typography (字体排版)

-   **Heading**: `'Noto Serif SC', 'Source Han Serif CN', Georgia, serif` — 衬线体传递文化感与严肃性，契合高知人群审美
-   **Body**: `'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif` — 无衬线确保长文本可读性与数据对齐
-   **字体策略**: 标题用衬线体建立「理性心动」的文化质感，正文与数据用无衬线保障功能性；数字统一使用 tabular-nums

## 4. Layout Strategy (布局策略)

-   **导航意图**: 必须保留顶部 Sticky 导航栏 + 六步进度条（应用概要设计已声明）；至多一套全局导航，禁止额外 Sidebar
-   **页面架构**: 居中单栏流式布局，内容区 `max-w-5xl`；Step 2 深度访谈页三栏布局在容器内自适应分配
-   **响应式**: 桌面端三栏/双栏并排展示；平板/移动端自动折叠为单栏 Tab 切换，进度条保留但精简文字

## 5. Visual Language (视觉语言)

-   **形态参数**: 圆角 `rounded-[28px]`(卡片) / `rounded-full`(按钮/标签) · 阴影 `shadow-[0_8px_32px_-8px_rgba(220,90,163,0.08)]` · 间距基调 spacious
-   **识别签名**: ① 28px 超大圆角卡片 ② 粉紫渐变光晕环绕关键区域(Hero/画像卡) ③ 证据卡片左侧彩色竖条标识类型
-   **装饰策略**: 仅在 Hero 区和理想画像卡片使用粉紫渐变光晕背景；其余区域保持干净留白
-   **动效原则**: 温柔渐入，300-400ms ease-out；画像卡片从模糊到清晰，进度条平滑填充
-   **可及性**: 深色渐变背景上文字加 `text-shadow: 0 1px 3px rgba(0,0,0,0.3)`；所有交互态有明确 focus ring

## 6. Component Principles (组件原则)

-   **状态完整性**: Button/Input/Card 覆盖 Default/Hover/Focus/Disabled；输入框 Focus 时显示粉紫渐变边框(`ring-2 ring-offset-2`)
-   **层级清晰**: 主按钮用粉紫渐变填充；次级按钮用 `bg-accent text-accent-foreground`；幽灵按钮仅 hover 显色
-   **一致性**: 证据标签用胶囊形状+左竖条；权重滑块轨道用渐变；排名徽章用金属质感渐变(金/银/铜)

## 7. Image Direction (图片与视觉资产)

-   **Image Role**: 首页 Hero 区氛围插图 + 服务团队员工头像图标
-   **Image Art Direction**: 抽象几何光影，粉紫色调柔和过渡，无具象人物；传达「连接、探索、理性之美」；光线从左上方打入，营造通透感
-   **Image Prompt Keywords**: abstract geometric, soft pink purple gradient, ethereal light rays, connection nodes, bokeh circles, minimal composition, warm professional, translucent layers
-   **Image Avoidance**: 避免情侣剪影、爱心符号、握手照片、通用商务插画、饱和度过高的霓虹色

## 8. 应避免 (Anti-patterns)

1.  ❌ 使用纯黑 #000 或冷灰色系文字 — 破坏温暖专业基调，必须用深墨色 #302532
2.  ❌ 小圆角(<16px)或直角卡片 — 违背产品「安全、包容、高级感」的核心视觉承诺
3.  ❌ 数据密集区使用高饱和背景色 — 偏好模型/候选检索页应保持浅色底，让数据和证据本身成为焦点