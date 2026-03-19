import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import { Trade, ThemeMode } from '../types';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PerformanceAnalysisProps {
  trades: Trade[];
  accountSize: number;
  theme: ThemeMode;
}

export default function PerformanceAnalysis({ trades, accountSize, theme }: PerformanceAnalysisProps) {
  const analysis = useMemo(() => {
    if (trades.length === 0) return null;

    // Sort trades by time for curve
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

    let currentBalance = accountSize;
    let maxBalance = accountSize;
    let maxDD = 0;
    
    const equityCurve = sortedTrades.map((t, index) => {
      currentBalance += t.return;
      if (currentBalance > maxBalance) maxBalance = currentBalance;
      
      const dd = ((maxBalance - currentBalance) / maxBalance) * 100;
      if (dd > maxDD) maxDD = dd;

      return {
        index: index + 1,
        date: format(new Date(t.entryTime), 'MM/dd'),
        balance: Number(currentBalance.toFixed(2)),
        profit: t.return
      };
    });

    // Add initial point
    equityCurve.unshift({ index: 0, date: 'Start', balance: accountSize, profit: 0 });

    const wins = trades.filter(t => t.status === '盈');
    const losses = trades.filter(t => t.status === '亏');
    
    const winRate = wins.length / trades.length;
    const avgWin = wins.reduce((acc, t) => acc + t.return, 0) / (wins.length || 1);
    const avgLoss = Math.abs(losses.reduce((acc, t) => acc + t.return, 0) / (losses.length || 1));
    
    const rrRatio = avgWin / (avgLoss || 1);
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

    return {
      totalTrades: trades.length,
      winRate: (winRate * 100).toFixed(1),
      rrRatio: rrRatio.toFixed(2),
      maxDD: maxDD.toFixed(2),
      expectancy: expectancy.toFixed(2),
      equityCurve,
      netProfit: (currentBalance - accountSize).toFixed(2),
      growth: (((currentBalance - accountSize) / accountSize) * 100).toFixed(1)
    };
  }, [trades, accountSize]);

  if (!analysis) {
    return (
      <div className={cn("h-[60vh] flex items-center justify-center italic", theme === 'light' ? "text-zinc-400" : "text-zinc-500")}>
        需要至少一笔交易数据来生成绩效分析。
      </div>
    );
  }

  const cardClass = cn(
    "border p-6 rounded-2xl transition-colors",
    theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
  );

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="交易次数" value={analysis.totalTrades} theme={theme} />
        <MetricCard label="胜率" value={`${analysis.winRate}%`} color="text-emerald-500" theme={theme} />
        <MetricCard label="平均盈亏比" value={`1:${analysis.rrRatio}`} theme={theme} />
        <MetricCard label="最大回撤" value={`${analysis.maxDD}%`} color="text-rose-500" theme={theme} />
        <MetricCard label="交易期望值" value={analysis.expectancy} subValue="每笔预期收益" theme={theme} />
        <MetricCard label="资金增长" value={`${analysis.growth}%`} color="text-emerald-500" theme={theme} />
      </div>

      {/* Equity Curve Chart */}
      <div className={cn("border p-8 rounded-3xl transition-colors", theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800")}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">资金增长曲线</h4>
            <p className={cn("text-2xl font-bold", theme === 'light' ? "text-zinc-900" : "text-zinc-100")}>
              ${Number(analysis.netProfit).toLocaleString()} <span className="text-sm font-normal text-zinc-500 ml-2">总净利润</span>
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
              Real-time Analysis
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analysis.equityCurve}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? "#f3f4f6" : "#27272a"} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 100', 'dataMax + 100']}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', 
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #27272a', 
                  borderRadius: '12px', 
                  padding: '12px' 
                }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                formatter={(value: any) => [`$${value}`, '账户余额']}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={cardClass}>
          <h5 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">进阶统计</h5>
          <div className="space-y-4">
            <StatRow label="初始资金" value={`$${accountSize.toLocaleString()}`} theme={theme} />
            <StatRow label="当前净值" value={`$${(accountSize + Number(analysis.netProfit)).toLocaleString()}`} theme={theme} />
            <StatRow label="盈亏比 (Avg Win/Loss)" value={analysis.rrRatio} theme={theme} />
            <StatRow label="期望值 (Expectancy)" value={analysis.expectancy} theme={theme} />
          </div>
        </div>
        <div className={cardClass}>
          <h5 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-4">风险管理</h5>
          <div className="space-y-4">
            <StatRow label="最大回撤率" value={`${analysis.maxDD}%`} theme={theme} />
            <StatRow label="总交易笔数" value={analysis.totalTrades} theme={theme} />
            <StatRow label="盈利交易" value={trades.filter(t => t.status === '盈').length} theme={theme} />
            <StatRow label="亏损交易" value={trades.filter(t => t.status === '亏').length} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, subValue, theme }: { label: string, value: string | number, color?: string, subValue?: string, theme: ThemeMode }) {
  const defaultColor = theme === 'light' ? "text-zinc-900" : "text-zinc-100";
  return (
    <div className={cn(
      "border p-5 rounded-2xl transition-colors",
      theme === 'light' ? "bg-white border-zinc-200 hover:border-zinc-300" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
    )}>
      <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">{label}</div>
      <div className={cn("text-2xl font-mono font-bold", color || defaultColor)}>{value}</div>
      {subValue && <div className="text-[10px] text-zinc-600 mt-1 uppercase">{subValue}</div>}
    </div>
  );
}

function StatRow({ label, value, theme }: { label: string, value: string | number, theme: ThemeMode }) {
  return (
    <div className={cn("flex justify-between items-center py-2 border-b last:border-0", theme === 'light' ? "border-zinc-100" : "border-zinc-800/50")}>
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className={cn("font-mono font-medium", theme === 'light' ? "text-zinc-700" : "text-zinc-200")}>{value}</span>
    </div>
  );
}
