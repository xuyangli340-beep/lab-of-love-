import { useRef, useState, useCallback } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { StaffMember, RoleKey } from './staff-data';
import { ROLE_TABS } from './staff-data';

interface PosterSectionProps {
  selections: Record<RoleKey, StaffMember | null>;
}

const PosterSection = ({ selections }: PosterSectionProps) => {
  const [posterGenerated, setPosterGenerated] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedCount = Object.values(selections).filter(Boolean).length;

  // 辅助函数：圆角矩形
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 辅助函数：文字换行
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) => {
    let line = '';
    let currentY = y;
    let lineCount = 0;
    const maxLines = 3;

    for (let i = 0; i < text.length; i++) {
      const testLine = line + text.charAt(i);
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = text.charAt(i);
        currentY += lineHeight;
        lineCount++;
        if (lineCount >= maxLines - 1) {
          let remaining = text.substring(i);
          while (
            ctx.measureText(remaining + '…').width > maxWidth &&
            remaining.length > 0
          ) {
            remaining = remaining.slice(0, -1);
          }
          ctx.fillText(remaining + '…', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
    }
  };

  const generatePoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGeneratingPoster(true);

    setTimeout(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setGeneratingPoster(false);
        return;
      }

      const W = 800;
      const H = 1200;
      canvas.width = W;
      canvas.height = H;

      // 背景
      const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
      bgGradient.addColorStop(0, '#fff6fa');
      bgGradient.addColorStop(1, '#fceef6');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, W, H);

      // 顶部粉紫渐变装饰条
      const topGradient = ctx.createLinearGradient(0, 0, W, 0);
      topGradient.addColorStop(0, '#dc5aa3');
      topGradient.addColorStop(1, '#925ad5');
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, W, 12);

      // 装饰光晕
      const glow1 = ctx.createRadialGradient(100, 200, 0, 100, 200, 300);
      glow1.addColorStop(0, 'rgba(220,90,163,0.15)');
      glow1.addColorStop(1, 'rgba(220,90,163,0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 400, 500);

      const glow2 = ctx.createRadialGradient(700, 300, 0, 700, 300, 250);
      glow2.addColorStop(0, 'rgba(146,90,213,0.12)');
      glow2.addColorStop(1, 'rgba(146,90,213,0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(500, 100, 400, 500);

      // Logo 区域
      ctx.save();
      const logoGradient = ctx.createLinearGradient(60, 60, 100, 100);
      logoGradient.addColorStop(0, '#dc5aa3');
      logoGradient.addColorStop(1, '#925ad5');
      ctx.fillStyle = logoGradient;
      ctx.beginPath();
      ctx.arc(80, 80, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Logo 心形
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♥', 80, 80);
      ctx.restore();

      // 品牌名
      ctx.save();
      ctx.fillStyle = '#302532';
      ctx.font =
        'bold 28px "Noto Serif SC", "Source Han Serif CN", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('婚联网', 125, 60);
      ctx.fillStyle = '#8a7a8c';
      ctx.font = '14px "Inter", "PingFang SC", sans-serif';
      ctx.fillText('理性心动实验室', 125, 95);
      ctx.restore();

      // 主标题
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#302532';
      ctx.font =
        'bold 42px "Noto Serif SC", "Source Han Serif CN", Georgia, serif';
      ctx.fillText('专属服务方案', W / 2, 180);

      ctx.fillStyle = '#925ad5';
      ctx.font = '20px "Inter", "PingFang SC", sans-serif';
      ctx.fillText('尊敬的客户 · 为您定制', W / 2, 240);
      ctx.restore();

      // 分割装饰线
      ctx.save();
      const lineGradient = ctx.createLinearGradient(W / 2 - 80, 0, W / 2 + 80, 0);
      lineGradient.addColorStop(0, 'rgba(220,90,163,0)');
      lineGradient.addColorStop(0.5, 'rgba(220,90,163,0.5)');
      lineGradient.addColorStop(1, 'rgba(146,90,213,0)');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 80, 290);
      ctx.lineTo(W / 2 + 80, 290);
      ctx.stroke();
      ctx.restore();

      // 理想画像摘要卡片
      const portraitY = 320;
      const portraitH = 140;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      roundRect(ctx, 60, portraitY, W - 120, portraitH, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,90,163,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#dc5aa3';
      ctx.font = 'bold 16px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.fillText('✦ 理想画像摘要', 90, portraitY + 28);

      const summaryText =
        '寻找一位身高175cm以上、本科及以上学历、年收入30万+、性格温和稳重、有责任感和上进心的伴侣。重视家庭观念，希望对方有良好的生活习惯和健康的生活方式，能够相互理解、共同成长。';
      ctx.fillStyle = '#5a4a5c';
      ctx.font = '14px "Inter", "PingFang SC", sans-serif';
      ctx.textBaseline = 'top';
      wrapText(ctx, summaryText, 90, portraitY + 58, W - 180, 24);
      ctx.restore();

      // 目标候选
      const candidateY = portraitY + portraitH + 24;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      roundRect(ctx, 60, candidateY, W - 120, 100, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(146,90,213,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#925ad5';
      ctx.font = 'bold 16px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('★ 目标候选推荐', 90, candidateY + 22);

      ctx.fillStyle = '#302532';
      ctx.font = 'bold 20px "Noto Serif SC", serif';
      ctx.fillText('陈先生 · 28岁 · 产品经理', 90, candidateY + 52);

      const badgeX = W - 160;
      const badgeY = candidateY + 50;
      const badgeGradient = ctx.createLinearGradient(
        badgeX,
        badgeY,
        badgeX + 80,
        badgeY + 36,
      );
      badgeGradient.addColorStop(0, '#dc5aa3');
      badgeGradient.addColorStop(1, '#925ad5');
      ctx.fillStyle = badgeGradient;
      roundRect(ctx, badgeX, badgeY, 80, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('92.5分', badgeX + 40, badgeY + 18);
      ctx.restore();

      // 服务团队标题
      const teamTitleY = candidateY + 100 + 32;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#302532';
      ctx.font = 'bold 26px "Noto Serif SC", serif';
      ctx.fillText('您的专属服务团队', W / 2, teamTitleY);
      ctx.restore();

      // 三位负责人
      const cardW = 210;
      const cardH = 180;
      const startX = 60;
      const gap = (W - 120 - cardW * 3) / 2;
      const teamCardY = teamTitleY + 36;

      ROLE_TABS.forEach((r, i) => {
        const x = startX + i * (cardW + gap);
        const staff = selections[r.key];

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        roundRect(ctx, x, teamCardY, cardW, cardH, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,90,163,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const avatarX = x + cardW / 2;
        const avatarY = teamCardY + 50;
        if (staff) {
          const avatarGrad = ctx.createLinearGradient(
            avatarX - 28,
            avatarY - 28,
            avatarX + 28,
            avatarY + 28,
          );
          avatarGrad.addColorStop(0, '#dc5aa3');
          avatarGrad.addColorStop(1, '#925ad5');
          ctx.fillStyle = avatarGrad;
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, 28, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px "Noto Serif SC", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(staff.name.charAt(0), avatarX, avatarY);
        } else {
          ctx.fillStyle = '#f0e8ee';
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#b0a0b0';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', avatarX, avatarY);
        }

        ctx.fillStyle = '#302532';
        ctx.font = 'bold 16px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(staff?.name || '待选择', avatarX, teamCardY + 90);

        ctx.fillStyle = '#925ad5';
        ctx.font = '12px "Inter", "PingFang SC", sans-serif';
        ctx.fillText(r.label, avatarX, teamCardY + 114);

        if (staff) {
          ctx.fillStyle = '#8a7a8c';
          ctx.font = '11px "Inter", "PingFang SC", sans-serif';
          ctx.fillText(staff.experience, avatarX, teamCardY + 136);
        }
        ctx.restore();
      });

      // 服务目标
      const goalY = teamCardY + cardH + 32;
      ctx.save();
      const goalGrad = ctx.createLinearGradient(60, goalY, W - 60, goalY + 100);
      goalGrad.addColorStop(0, 'rgba(220,90,163,0.08)');
      goalGrad.addColorStop(1, 'rgba(146,90,213,0.08)');
      ctx.fillStyle = goalGrad;
      roundRect(ctx, 60, goalY, W - 120, 100, 24);
      ctx.fill();

      ctx.fillStyle = '#dc5aa3';
      ctx.font = 'bold 16px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('🎯 服务目标', 90, goalY + 24);

      ctx.fillStyle = '#302532';
      ctx.font = '15px "Inter", "PingFang SC", sans-serif';
      ctx.fillText('6个月内完成深度匹配，找到契合度90%以上的理想伴侣', 90, goalY + 54);

      ctx.fillStyle = '#8a7a8c';
      ctx.font = '13px "Inter", "PingFang SC", sans-serif';
      ctx.fillText('全程专属团队1v1服务 · 每周进度同步 · 不满意可调整', 90, goalY + 78);
      ctx.restore();

      // 底部区域
      const bottomY = H - 140;

      // 二维码占位
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, bottomY, 100, 100);
      ctx.strokeStyle = '#efd9e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, bottomY, 100, 100);

      ctx.fillStyle = '#302532';
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 0 || (row === 0 && col < 3) || (col === 0 && row < 3)) {
            ctx.fillRect(68 + col * 11, bottomY + 8 + row * 11, 9, 9);
          }
        }
      }
      ctx.fillStyle = '#dc5aa3';
      ctx.fillRect(68, bottomY + 8, 22, 22);
      ctx.fillRect(130, bottomY + 8, 22, 22);
      ctx.fillRect(68, bottomY + 70, 22, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(73, bottomY + 13, 12, 12);
      ctx.fillRect(135, bottomY + 13, 12, 12);
      ctx.fillRect(73, bottomY + 75, 12, 12);
      ctx.fillStyle = '#dc5aa3';
      ctx.fillRect(77, bottomY + 17, 4, 4);
      ctx.fillRect(139, bottomY + 17, 4, 4);
      ctx.fillRect(77, bottomY + 79, 4, 4);
      ctx.restore();

      // 右侧文字
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillStyle = '#302532';
      ctx.font = 'bold 18px "Noto Serif SC", serif';
      ctx.fillText('扫码开启专属服务', W - 60, bottomY + 30);

      ctx.fillStyle = '#8a7a8c';
      ctx.font = '13px "Inter", "PingFang SC", sans-serif';
      ctx.fillText('婚联网 · 理性心动实验室', W - 60, bottomY + 58);

      const today = new Date();
      const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
      ctx.fillStyle = '#b0a0b0';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText(`方案生成日期：${dateStr}`, W - 60, bottomY + 82);
      ctx.restore();

      // 底部装饰条
      const bottomGradient = ctx.createLinearGradient(0, H - 12, W, 0);
      bottomGradient.addColorStop(0, '#dc5aa3');
      bottomGradient.addColorStop(1, '#925ad5');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, H - 8, W, 8);

      setPosterGenerated(true);
      setGeneratingPoster(false);
    }, 100);
  }, [selections]);

  const downloadPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = '婚联网-专属服务方案.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#302532] to-[#5a3a7a] rounded-[28px] p-6 md:p-10 text-white">
      <div className="text-center mb-8">
        <h2 className="font-serif font-bold text-2xl md:text-3xl mb-2 text-on-dark-gradient">
          专属服务方案
        </h2>
        <p className="text-white/60 text-sm">一键生成您的专属服务团队方案海报，保存分享</p>
      </div>

      {/* 生成按钮 */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generatePoster}
          disabled={generatingPoster || selectedCount === 0}
          data-poster-generate
          className="px-8 py-3.5 rounded-full font-medium text-primary-foreground bg-primary-gradient shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          {generatingPoster ? '生成中...' : '生成专属服务方案海报'}
        </button>
      </div>

      {/* 海报预览 */}
      <div className="flex justify-center">
        <div
          className="bg-white/5 rounded-[28px] p-4 md:p-6 backdrop-blur-sm border border-white/10"
          style={{ maxWidth: '420px', width: '100%' }}
        >
          {posterGenerated ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[20px] shadow-2xl">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block"
                  style={{ aspectRatio: '800 / 1200' }}
                />
              </div>
              <button
                onClick={downloadPoster}
                className="w-full py-3 rounded-full font-medium bg-white text-[#302532] hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载 PNG
              </button>
            </div>
          ) : (
            <div
              className="rounded-[20px] border-2 border-dashed border-white/20 flex flex-col items-center justify-center py-20"
              style={{ aspectRatio: '800 / 1200' }}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-white/50 text-sm text-center px-4">
                {selectedCount === 0
                  ? '请先选择至少一位团队成员'
                  : '点击上方按钮生成专属服务方案海报'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterSection;
