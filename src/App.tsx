import { useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  Table as TableIcon, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Wallet,
  Plus,
  Trash2,
  ChevronDown,
  User,
  Settings,
  Sun,
  Moon,
  Palette,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trade, Account, ThemeMode } from './types';
import { format } from 'date-fns';
import TradingLog from './components/TradingLog';
import StatsDashboard from './components/StatsDashboard';
import PerformanceAnalysis from './components/PerformanceAnalysis';
import TradeForm from './components/TradeForm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { generateId } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'analysis'>('log');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pa_trader_theme') as ThemeMode) || 'dark';
  });
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('pa_trader_accounts');
    if (saved) return JSON.parse(saved);
    
    return [{
      id: 'default',
      name: '主交易账户',
      remark: '默认交易账户',
      initialBalance: 10000,
      trades: []
    }];
  });
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    return localStorage.getItem('pa_trader_active_account_id') || 'default';
  });
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({ name: '', initialBalance: 10000, remark: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccountId) || accounts[0];
  }, [accounts, activeAccountId]);

  useEffect(() => {
    localStorage.setItem('pa_trader_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('pa_trader_active_account_id', activeAccountId);
  }, [activeAccountId]);

  useEffect(() => {
    localStorage.setItem('pa_trader_theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  const handleAddAccount = () => {
    if (!newAccountData.name) return;
    const newAccount: Account = {
      id: generateId(),
      name: newAccountData.name,
      remark: newAccountData.remark,
      initialBalance: newAccountData.initialBalance,
      trades: []
    };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
    setIsAddingAccount(false);
    setNewAccountData({ name: '', initialBalance: 10000, remark: '' });
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    const newAccounts = accounts.filter(a => a.id !== id);
    setAccounts(newAccounts);
    if (activeAccountId === id) {
      setActiveAccountId(newAccounts[0].id);
    }
  };

  const updateActiveAccount = (updates: Partial<Account>) => {
    setAccounts(accounts.map(a => a.id === activeAccountId ? { ...a, ...updates } : a));
  };

  const addTrade = (trade: Trade) => {
    updateActiveAccount({ trades: [trade, ...activeAccount.trades] });
  };

  const deleteTrade = (id: string) => {
    updateActiveAccount({ trades: activeAccount.trades.filter(t => t.id !== id) });
  };

  const updateTrade = (updatedTrade: Trade) => {
    updateActiveAccount({ trades: activeAccount.trades.map(t => t.id === updatedTrade.id ? updatedTrade : t) });
  };

  const clearAllData = () => {
    const defaultAccounts = [{
      id: 'default',
      name: '主交易账户',
      remark: '默认交易账户',
      initialBalance: 10000,
      trades: []
    }];
    setAccounts(defaultAccounts);
    setActiveAccountId('default');
    localStorage.clear();
    setIsSettingsOpen(false);
    window.location.reload();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `trading_notes_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const themeColors = {
    dark: 'bg-[#0A0A0A] text-zinc-100',
    light: 'bg-zinc-50 text-zinc-900'
  };

  const sidebarColors = {
    dark: 'bg-[#111111] border-zinc-800/50',
    light: 'bg-white border-zinc-200'
  };

  return (
    <div className={cn("min-h-screen font-sans selection:bg-emerald-500/30 transition-colors duration-300", themeColors[theme])}>
      {/* Sidebar / Navigation */}
      <div className={cn("fixed left-0 top-0 h-full w-20 md:w-64 border-r flex flex-col z-50 transition-colors duration-300", sidebarColors[theme])}>
        <div className="p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="text-black w-6 h-6" />
            </div>
            <span className={cn("hidden md:block font-bold text-lg tracking-tight leading-tight", theme === 'light' ? 'text-zinc-900' : 'text-white')}>
              交易笔记
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          <NavItem 
            active={activeTab === 'log'} 
            onClick={() => setActiveTab('log')}
            icon={<TableIcon size={20} />}
            label="交易记录"
            theme={theme}
          />
          <NavItem 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 size={20} />}
            label="交易报告"
            theme={theme}
          />
          <NavItem 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
            icon={<PieChartIcon size={20} />}
            label="绩效分析"
            theme={theme}
          />
        </nav>

        <div className="p-4 border-t border-zinc-800/50 space-y-4">
          {/* Install App Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500 text-black font-bold transition-all duration-200 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <Download size={20} />
              <span className="hidden md:block">安装桌面版</span>
            </button>
          )}

          {/* Settings Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
              theme === 'light' ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden md:block font-medium">系统设置</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-zinc-800/50">
            <button 
              onClick={() => setTheme('dark')}
              className={cn("flex-1 p-2 rounded-lg flex justify-center transition-all", theme === 'dark' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Moon size={16} />
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={cn("flex-1 p-2 rounded-lg flex justify-center transition-all", theme === 'light' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Sun size={16} />
            </button>
          </div>

          {/* Account Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={cn(
                "w-full rounded-xl p-3 flex items-center justify-between transition-colors group border",
                theme === 'light' ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200" : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors shrink-0">
                  <User size={16} />
                </div>
                <div className="text-left hidden md:block overflow-hidden">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase truncate">{activeAccount.name}</div>
                  <div className="text-sm font-mono font-bold text-emerald-500 truncate">${(activeAccount.initialBalance + activeAccount.trades.reduce((acc, t) => acc + t.return, 0)).toLocaleString()}</div>
                </div>
              </div>
              <ChevronDown size={16} className={cn("text-zinc-600 transition-transform hidden md:block", isAccountMenuOpen && "rotate-180")} />
            </button>

              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute bottom-full left-0 w-full mb-2 border rounded-2xl shadow-2xl overflow-hidden z-50",
                      theme === 'light' ? "bg-white border-zinc-200" : "bg-[#18181B] border-zinc-800"
                    )}
                  >
                    <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                      {accounts.map(acc => (
                        <div key={acc.id} className="flex items-center gap-1 group">
                          <button
                            onClick={() => {
                              setActiveAccountId(acc.id);
                              setIsAccountMenuOpen(false);
                            }}
                            className={cn(
                              "flex-1 text-left px-4 py-3 rounded-xl transition-all text-sm",
                              acc.id === activeAccountId 
                                ? "bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20" 
                                : theme === 'light' ? "hover:bg-zinc-100 text-zinc-600" : "hover:bg-zinc-800/50 text-zinc-400"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span>{acc.name}</span>
                              {acc.id === activeAccountId && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            {acc.remark && <div className={cn("text-[10px] mt-0.5 opacity-60 truncate font-normal", acc.id === activeAccountId ? "text-black" : "")}>{acc.remark}</div>}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAccount(acc.id);
                            }}
                            className="p-2 text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setIsAddingAccount(true);
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-t border-zinc-800/50 transition-all"
                    >
                      <Plus size={16} />
                      添加新账户
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pl-20 md:pl-64 min-h-screen">
          <header className={cn(
            "h-24 border-b flex items-center justify-between px-10 sticky top-0 backdrop-blur-xl z-40 transition-colors duration-300",
            theme === 'light' ? "bg-white/80 border-zinc-200" : "bg-[#0A0A0A]/80 border-zinc-800/50"
          )}>
            <div className="flex items-center gap-6">
              <h2 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? 'text-zinc-900' : 'text-white')}>
                {activeTab === 'log' && "交易笔记"}
                {activeTab === 'stats' && "统计报表"}
                {activeTab === 'analysis' && "深度分析"}
              </h2>
              <div className="h-6 w-[1px] bg-zinc-800/50 mx-2 hidden md:block"></div>
              <div className="hidden md:flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{activeAccount.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAddingTrade(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-emerald-500/40 transition-all active:scale-95"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">新增交易</span>
              </button>
            </div>
          </header>

          <div className="p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + activeAccountId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {activeTab === 'log' && (
                  <TradingLog 
                    trades={activeAccount.trades} 
                    onAdd={addTrade} 
                    onDelete={deleteTrade} 
                    onUpdate={updateTrade}
                    theme={theme}
                  />
                )}
                {activeTab === 'stats' && (
                  <StatsDashboard trades={activeAccount.trades} theme={theme} />
                )}
                {activeTab === 'analysis' && (
                  <PerformanceAnalysis trades={activeAccount.trades} accountSize={activeAccount.initialBalance} theme={theme} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className={cn(
                "relative w-full max-w-md border rounded-[2.5rem] p-10 shadow-2xl",
                theme === 'light' ? "bg-white border-zinc-200" : "bg-[#121212] border-white/10"
              )}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Settings className="text-emerald-500 w-6 h-6" />
                  </div>
                  <h3 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-zinc-900" : "text-white")}>系统设置</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)} 
                  className={cn("p-2 rounded-xl transition-colors", theme === 'light' ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-white/5 text-zinc-500")}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">数据管理</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={exportData}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center justify-between transition-all border",
                        theme === 'light' ? "bg-zinc-50 border-zinc-200 hover:bg-zinc-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span className="text-sm font-bold">导出备份 (JSON)</span>
                      </div>
                      <ChevronDown size={16} className="-rotate-90 text-zinc-600" />
                    </button>
                    
                    <button 
                      onClick={clearAllData}
                      className="w-full p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 size={18} className="text-rose-500" />
                        <span className="text-sm font-bold text-rose-500">清空所有数据</span>
                      </div>
                      <span className="text-[10px] font-black text-rose-500/50 uppercase opacity-0 group-hover:opacity-100 transition-opacity">危险操作</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">桌面端应用 (PWA)</h4>
                  <div className={cn(
                    "p-5 rounded-2xl border text-sm leading-relaxed",
                    theme === 'light' ? "bg-zinc-50 border-zinc-200 text-zinc-600" : "bg-white/5 border-white/5 text-zinc-400"
                  )}>
                    您可以将此应用直接安装到桌面，无需通过浏览器打开：
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>点击浏览器地址栏右侧的 <span className="text-emerald-500 font-bold">“安装”</span> 图标</li>
                      <li>或者在浏览器菜单中选择 <span className="text-emerald-500 font-bold">“安装 交易笔记...”</span></li>
                    </ul>
                    安装后，它将作为一个独立的软件出现在您的桌面和开始菜单中。
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">开发者导出</h4>
                  <div className={cn(
                    "p-5 rounded-2xl border text-sm leading-relaxed",
                    theme === 'light' ? "bg-zinc-50 border-zinc-200 text-zinc-600" : "bg-white/5 border-white/5 text-zinc-400"
                  )}>
                    您可以点击 AI Studio 右上角的 <span className="text-emerald-500 font-bold">Settings</span> 菜单，选择 <span className="text-emerald-500 font-bold">Export to ZIP</span> 下载完整代码包。
                    <br /><br />
                    解压后在本地运行 <code className="bg-black/20 px-1 rounded">npm install</code> 和 <code className="bg-black/20 px-1 rounded">npm run dev</code> 即可在桌面端使用。
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Account Modal */}
        <AnimatePresence>
          {isAddingAccount && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setIsAddingAccount(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className={cn(
                  "relative w-full max-w-md border rounded-[2.5rem] p-10 shadow-2xl",
                  theme === 'light' ? "bg-white border-zinc-200" : "bg-[#121212] border-white/10"
                )}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Wallet className="text-black w-6 h-6" />
                    </div>
                    <h3 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-zinc-900" : "text-white")}>添加新账户</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddingAccount(false)} 
                    className={cn("p-2 rounded-xl transition-colors", theme === 'light' ? "hover:bg-zinc-100 text-zinc-400" : "hover:bg-white/5 text-zinc-500")}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">账户名称</label>
                    <input 
                      type="text"
                      placeholder="例如: Prop Firm A, Personal Account"
                      value={newAccountData.name}
                      onChange={e => setNewAccountData({ ...newAccountData, name: e.target.value })}
                      className={cn(
                        "w-full border rounded-2xl px-5 py-4 outline-none transition-all font-bold",
                        theme === 'light' 
                          ? "bg-zinc-50 border-zinc-200 focus:border-emerald-500 text-zinc-900" 
                          : "bg-white/[0.03] border-white/10 focus:border-emerald-500 text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">初始资金</label>
                    <input 
                      type="number"
                      value={newAccountData.initialBalance}
                      onChange={e => setNewAccountData({ ...newAccountData, initialBalance: Number(e.target.value) })}
                      className={cn(
                        "w-full border rounded-2xl px-5 py-4 outline-none transition-all font-mono font-bold",
                        theme === 'light' 
                          ? "bg-zinc-50 border-zinc-200 focus:border-emerald-500 text-zinc-900" 
                          : "bg-white/[0.03] border-white/10 focus:border-emerald-500 text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">备注</label>
                    <textarea 
                      placeholder="账户描述或交易规则..."
                      value={newAccountData.remark}
                      onChange={e => setNewAccountData({ ...newAccountData, remark: e.target.value })}
                      className={cn(
                        "w-full border rounded-2xl px-5 py-4 outline-none transition-all min-h-[100px] resize-none",
                        theme === 'light' 
                          ? "bg-zinc-50 border-zinc-200 focus:border-emerald-500 text-zinc-900" 
                          : "bg-white/[0.03] border-white/10 focus:border-emerald-500 text-white"
                      )}
                    />
                  </div>
                  <button 
                    onClick={handleAddAccount}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-emerald-500/40 transition-all mt-4 transform active:scale-95"
                  >
                    创建账户
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Full Screen Trade Form */}
      <TradeForm 
        isOpen={isAddingTrade}
        onClose={() => setIsAddingTrade(false)}
        onSave={addTrade}
        theme={theme}
      />
    </div>
  );
}

function NavItem({ active, onClick, icon, label, theme }: { active: boolean, onClick: () => void, icon: ReactNode, label: string, theme: ThemeMode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
          : theme === 'light' ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
      )}
    >
      <span className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="hidden md:block font-medium">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
    </button>
  );
}
