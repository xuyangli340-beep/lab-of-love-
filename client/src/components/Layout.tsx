import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Heart, Sparkles, Users } from 'lucide-react';

const wizardSteps = [
  { path: '/wizard/profile', label: '最小档案', step: 1 },
  { path: '/wizard/interview', label: '深度访谈', step: 2 },
  { path: '/wizard/model', label: '偏好模型', step: 3 },
  { path: '/wizard/portrait', label: '理想画像', step: 4 },
  { path: '/wizard/candidates', label: '候选检索', step: 5 },
  { path: '/wizard/team', label: '服务团队', step: 6 },
];

const isWizardPage = (pathname: string) => {
  return pathname.startsWith('/wizard/');
};

const Layout = () => {
  const location = useLocation();
  const showWizardNav = isWizardPage(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-[14px] bg-primary-gradient flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white fill-white/30" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-semibold text-base text-foreground">
                婚联网
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide">
                理性心动实验室
              </span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary-foreground bg-primary-gradient'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`
              }
            >
              首页
            </NavLink>
            <NavLink
              to="/wizard/profile"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive || showWizardNav
                    ? 'text-primary-foreground bg-primary-gradient'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`
              }
            >
              开始匹配
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/auth/login"
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              登录
            </NavLink>
            <NavLink
              to="/auth/register"
              className="px-5 py-2 rounded-full text-sm font-medium text-primary-foreground bg-primary-gradient shadow-md hover:shadow-lg transition-shadow"
            >
              注册
            </NavLink>
          </div>
        </div>
      </header>

      {/* 六步向导进度条 */}
      {showWizardNav && (
        <div className="sticky top-16 z-40 bg-card/90 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-2">
              {wizardSteps.map((step, index) => (
                <div key={step.path} className="flex items-center flex-1">
                  <NavLink
                    to={step.path}
                    className={({ isActive }) => {
                      const isCurrent = isActive || location.pathname === step.path;
                      return `flex items-center gap-2 px-3 py-2 rounded-2xl transition-all ${
                        isCurrent
                          ? 'bg-primary-gradient text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`;
                    }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </span>
                    <span className="text-sm font-medium hidden lg:inline">
                      {step.label}
                    </span>
                  </NavLink>
                  {index < wizardSteps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-border rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              婚联网·理性心动实验室 — 证据优先于标签
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              © 2026 婚联网 版权所有
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
