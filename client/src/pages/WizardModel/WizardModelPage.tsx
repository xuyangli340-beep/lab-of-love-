import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Scale,
  Info,
} from 'lucide-react';
import { preferenceApi } from '@client/src/api/index';
import type { PreferenceFactor } from '@shared/api.interface';
import { Slider } from '@client/src/components/ui/slider';
import { Switch } from '@client/src/components/ui/switch';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@client/src/components/ui/dialog';
import { Label } from '@client/src/components/ui/label';

// ========== 默认因子配置 ==========
const DEFAULT_FACTORS: Omit<PreferenceFactor, 'id' | 'userProfileId'>[] = [
  { factorName: '沟通能力', weight: 80, isHardConstraint: false, isCustom: false },
  { factorName: '诚信可靠', weight: 90, isHardConstraint: true, isCustom: false },
  { factorName: '情绪稳定性', weight: 85, isHardConstraint: false, isCustom: false },
  { factorName: '外形吸引力', weight: 60, isHardConstraint: false, isCustom: false },
  { factorName: '责任感', weight: 85, isHardConstraint: true, isCustom: false },
  { factorName: '价值观契合', weight: 95, isHardConstraint: true, isCustom: false },
  { factorName: '智力与学识', weight: 75, isHardConstraint: false, isCustom: false },
  { factorName: '经济基础', weight: 70, isHardConstraint: false, isCustom: false },
  { factorName: '家庭背景', weight: 50, isHardConstraint: false, isCustom: false },
  { factorName: '生活习惯契合', weight: 75, isHardConstraint: false, isCustom: false },
  { factorName: '兴趣爱好共鸣', weight: 55, isHardConstraint: false, isCustom: false },
  { factorName: '性观念契合', weight: 70, isHardConstraint: false, isCustom: false },
];

// 环形图配色（粉紫系 12 色循环）
const CHART_COLORS = [
  'hsl(324 75% 61%)',
  'hsl(266 68% 59%)',
  'hsl(345 70% 65%)',
  'hsl(280 60% 65%)',
  'hsl(300 55% 70%)',
  'hsl(250 65% 68%)',
  'hsl(335 65% 68%)',
  'hsl(275 55% 62%)',
  'hsl(310 60% 68%)',
  'hsl(290 50% 65%)',
  'hsl(350 60% 70%)',
  'hsl(258 60% 65%)',
];

const HARD_CONSTRAINT_MIN_WEIGHT = 90;

// ========== 主组件 ==========
const WizardModelPage = () => {
  const [factors, setFactors] = useState<PreferenceFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorWeight, setNewFactorWeight] = useState(60);

  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const initializedRef = useRef(false);

  // ========== 数据加载 ==========
  useEffect(() => {
    const loadFactors = async () => {
      try {
        const result = await preferenceApi.getList();
        if (result.items && result.items.length > 0) {
          setFactors(result.items);
        } else {
          // 空列表 → 用默认因子批量初始化
          const created: PreferenceFactor[] = [];
          for (const factor of DEFAULT_FACTORS) {
            const res = await preferenceApi.create(factor);
            created.push({ ...factor, id: res.id, userProfileId: '' });
          }
          setFactors(created);
        }
      } catch (error) {
        logger.error('加载偏好因子失败', String(error));
      } finally {
        setLoading(false);
      }
    };
    if (!initializedRef.current) {
      initializedRef.current = true;
      loadFactors();
    }
  }, []);

  // ========== 防抖保存 ==========
  const scheduleSave = useCallback(
    (id: string, data: { weight?: number; isHardConstraint?: boolean }) => {
      const existing = saveTimersRef.current.get(id);
      if (existing) {
        clearTimeout(existing);
      }
      const timer = setTimeout(async () => {
        try {
          setSaving(true);
          await preferenceApi.update(id, data);
        } catch (error) {
          logger.error('保存偏好因子失败', String(error));
        } finally {
          setSaving(false);
          saveTimersRef.current.delete(id);
        }
      }, 800);
      saveTimersRef.current.set(id, timer);
    },
    [],
  );

  // ========== 权重变更 ==========
  const handleWeightChange = useCallback(
    (id: string, value: number[]) => {
      const weight = value[0];
      setFactors((prev) =>
        prev.map((f: PreferenceFactor) =>
          f.id === id ? { ...f, weight } : f,
        ),
      );
      scheduleSave(id, { weight });
    },
    [scheduleSave],
  );

  // ========== 硬约束切换 ==========
  const handleHardConstraintToggle = useCallback(
    (id: string, checked: boolean) => {
      setFactors((prev) =>
        prev.map((f: PreferenceFactor) => {
          if (f.id !== id) return f;
          const newWeight =
            checked && f.weight < HARD_CONSTRAINT_MIN_WEIGHT
              ? HARD_CONSTRAINT_MIN_WEIGHT
              : f.weight;
          return { ...f, isHardConstraint: checked, weight: newWeight };
        }),
      );
      const factor = factors.find((f: PreferenceFactor) => f.id === id);
      if (factor) {
        const newWeight =
          checked && factor.weight < HARD_CONSTRAINT_MIN_WEIGHT
            ? HARD_CONSTRAINT_MIN_WEIGHT
            : factor.weight;
        scheduleSave(id, { isHardConstraint: checked, weight: newWeight });
      }
    },
    [factors, scheduleSave],
  );

  // ========== 删除自定义因子 ==========
  const handleDeleteFactor = useCallback(async (id: string) => {
    try {
      await preferenceApi.remove(id);
      setFactors((prev) => prev.filter((f: PreferenceFactor) => f.id !== id));
    } catch (error) {
      logger.error('删除偏好因子失败', String(error));
    }
  }, []);

  // ========== 添加自定义因子 ==========
  const handleAddFactor = useCallback(async () => {
    if (!newFactorName.trim()) return;
    try {
      const res = await preferenceApi.create({
        factorName: newFactorName.trim(),
        weight: newFactorWeight,
        isHardConstraint: false,
        isCustom: true,
      });
      const newFactor: PreferenceFactor = {
        id: res.id,
        userProfileId: '',
        factorName: newFactorName.trim(),
        weight: newFactorWeight,
        isHardConstraint: false,
        isCustom: true,
      };
      setFactors((prev) => [...prev, newFactor]);
      setNewFactorName('');
      setNewFactorWeight(60);
      setDialogOpen(false);
    } catch (error) {
      logger.error('创建偏好因子失败', String(error));
    }
  }, [newFactorName, newFactorWeight]);

  // ========== 计算总权重与占比 ==========
  const totalWeight = useMemo(
    () => factors.reduce((sum: number, f: PreferenceFactor) => sum + f.weight, 0),
    [factors],
  );

  const hardConstraintCount = useMemo(
    () => factors.filter((f: PreferenceFactor) => f.isHardConstraint).length,
    [factors],
  );

  // 环形图 conic-gradient 字符串
  const conicGradient = useMemo(() => {
    if (totalWeight === 0 || factors.length === 0) return '';
    let cumulative = 0;
    const stops: string[] = [];
    factors.forEach((f: PreferenceFactor, i: number) => {
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const startPct = (cumulative / totalWeight) * 100;
      cumulative += f.weight;
      const endPct = (cumulative / totalWeight) * 100;
      stops.push(`${color} ${startPct}% ${endPct}%`);
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [factors, totalWeight]);

  // 模型完整度（归一化到 100 满分）
  const modelCompleteness = useMemo(() => {
    // 以 12 个因子 × 平均 75 权重 = 900 作为"完整"基准
    const baseline = 900;
    return Math.min(100, Math.round((totalWeight / baseline) * 100));
  }, [totalWeight]);

  // ========== 渲染 ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
          <span className="text-primary-gradient">偏好模型</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Step 3 · 调整因子权重，构建你的理性心动评分模型
        </p>
      </div>

      {/* 主内容：左右两栏 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ========== 左侧：因子权重列表 ========== */}
        <div className="flex-1 lg:flex-[2] space-y-4">
          <div className="bg-card rounded-[28px] shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)] border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  因子权重
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full text-xs"
                >
                  {factors.length} 项
                </Badge>
              </div>
              {saving && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  保存中...
                </span>
              )}
            </div>

            {/* 因子列表 */}
            <div className="space-y-2">
              {factors.map((factor: PreferenceFactor, index: number) => (
                <FactorRow
                  key={factor.id}
                  factor={factor}
                  color={CHART_COLORS[index % CHART_COLORS.length]}
                  onWeightChange={(val) => handleWeightChange(factor.id, val)}
                  onHardConstraintToggle={(checked) =>
                    handleHardConstraintToggle(factor.id, checked)
                  }
                  onDelete={
                    factor.isCustom
                      ? () => handleDeleteFactor(factor.id)
                      : undefined
                  }
                />
              ))}
            </div>

            {/* 添加自定义因子 */}
            <div className="mt-5 pt-4 border-t border-border">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent h-11"
                  >
                    <Plus className="w-4 h-4" />
                    添加自定义因子
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[28px] border-border sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl">
                      添加自定义因子
                    </DialogTitle>
                    <DialogDescription>
                      定义对你而言重要的独特偏好维度
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="factorName">因子名称</Label>
                      <Input
                        id="factorName"
                        placeholder="例如：音乐品味、运动习惯"
                        value={newFactorName}
                        onChange={(e) => setNewFactorName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          初始权重
                        </span>
                        <span className="text-sm font-bold text-primary tabular-nums">
                          {newFactorWeight}
                        </span>
                      </div>
                      <Slider
                        value={[newFactorWeight]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => setNewFactorWeight(val[0])}
                        className="[&_[data-slot=slider-range]]:bg-primary-gradient"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-row gap-2 sm:justify-end">
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        className="rounded-full flex-1 sm:flex-none"
                      >
                        取消
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleAddFactor}
                      disabled={!newFactorName.trim()}
                      className="rounded-full bg-primary-gradient border-0 flex-1 sm:flex-none"
                    >
                      添加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* ========== 右侧：可视化 + 公式说明 ========== */}
        <div className="lg:flex-1 space-y-4">
          {/* 模型得分可视化卡片 */}
          <div className="bg-card rounded-[28px] shadow-[0_8px_32px_-8px_rgba(220_90_163_0.08)] border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                模型可视化
              </h2>
            </div>

            {/* 环形图 */}
            <div className="relative w-48 h-48 mx-auto">
              <div
                className="w-full h-full rounded-full"
                style={{ background: conicGradient }}
              />
              {/* 中心白色圆形成环形 */}
              <div className="absolute inset-4 rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-primary-gradient tabular-nums">
                  {modelCompleteness}%
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  模型完整度
                </span>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="flex items-center justify-around mt-5 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {totalWeight}
                </div>
                <div className="text-xs text-muted-foreground">总权重</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {hardConstraintCount}
                </div>
                <div className="text-xs text-muted-foreground">硬约束</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {factors.length}
                </div>
                <div className="text-xs text-muted-foreground">因子数</div>
              </div>
            </div>

            {/* 图例 */}
            <div className="mt-5 pt-4 border-t border-border max-h-52 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {factors.map((f: PreferenceFactor, i: number) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {f.factorName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 公式说明面板 */}
          <div className="bg-accent/30 rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setFormulaExpanded(!formulaExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-info" />
                <span className="font-medium text-sm text-foreground">
                  评分公式说明
                </span>
              </div>
              {formulaExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {formulaExpanded && (
              <div className="px-4 pb-4 space-y-3 text-sm text-muted-foreground border-t border-border/50 pt-3">
                <div>
                  <div className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-primary" />
                    匹配评分公式
                  </div>
                  <div className="bg-card rounded-xl p-3 font-mono text-xs text-foreground border border-border">
                    总分 = Σ(因子权重 × 匹配度) / Σ权重
                  </div>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-destructive" />
                    硬约束规则
                  </div>
                  <p className="text-xs leading-relaxed">
                    任一硬约束因子不满足 → 整体匹配度直接归零，
                    该候选人被排除在候选池之外。硬约束权重自动不低于 90。
                  </p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    权重归一化
                  </div>
                  <p className="text-xs leading-relaxed">
                    所有权重会自动归一化后参与计算，因此权重的
                    <span className="text-foreground font-medium">相对比例</span>
                    比绝对值更重要。你可以自由调整，系统会确保总分落在 0-100 区间。
                  </p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-info" />
                    不确定性标注
                  </div>
                  <p className="text-xs leading-relaxed">
                    所有匹配评分均带有 ±5% 置信区间。模型基于证据推理，
                    结果仅供参考，最终判断请结合真实相处感受。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 因子行子组件 ==========
interface FactorRowProps {
  factor: PreferenceFactor;
  color: string;
  onWeightChange: (value: number[]) => void;
  onHardConstraintToggle: (checked: boolean) => void;
  onDelete?: () => void;
}

const FactorRow = ({
  factor,
  color,
  onWeightChange,
  onHardConstraintToggle,
  onDelete,
}: FactorRowProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative rounded-2xl px-4 py-3 transition-colors hover:bg-accent/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 左侧色条标识 */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-4">
        {/* 左侧：因子名 + 类型标签/开关 */}
        <div className="flex-shrink-0 w-40 md:w-48">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-foreground truncate">
              {factor.factorName}
            </span>
            {factor.isCustom && (
              <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-full">
                自定义
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={factor.isHardConstraint}
              onCheckedChange={onHardConstraintToggle}
              className="data-[state=checked]:bg-pink-500 h-5 w-9"
            />
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                factor.isHardConstraint
                  ? 'bg-pink-100 text-pink-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {factor.isHardConstraint ? '硬约束' : '软偏好'}
            </span>
          </div>
        </div>

        {/* 中间：滑块 */}
        <div className="flex-1 min-w-0">
          <Slider
            value={[factor.weight]}
            min={0}
            max={100}
            step={1}
            onValueChange={onWeightChange}
            className="[&_[data-slot=slider-range]]:bg-primary-gradient [&_[data-slot=slider-track]]:bg-accent"
          />
        </div>

        {/* 右侧：权重数值 + 删除按钮 */}
        <div className="flex-shrink-0 flex items-center gap-2 w-14 justify-end">
          <span className="text-lg font-bold text-foreground tabular-nums w-9 text-right">
            {factor.weight}
          </span>
          {onDelete && hovered && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
              title="删除因子"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardModelPage;
