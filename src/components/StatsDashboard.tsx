import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Trade, ThemeMode } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsDashboardProps {
  trades: Trade[];
  theme: ThemeMode;
}

export default function StatsDashboard({ trades, theme }: StatsDashboardProps) {
  const stats = useMemo(() => {
    if (trades.length === 0) return null;

    const winCount = trades.filter(t => t.status === '盈').length;
    const lossCount = trades.filter(t => t.status === '亏').length;
    const beCount = trades.filter(t => t.status === '保本').length;

    // By Symbol
    const symbolStats: Record<string, { count: number, profit: number }> = {};
    trades.forEach(t => {
      if (!symbolStats[t.symbol]) symbolStats[t.symbol] = { count: 0, profit: 0 };
      symbolStats[t.symbol].count += 1;
      symbolStats[t.symbol].profit += t.return;
    });

    const symbolData = Object.entries(symbolStats).map(([name, data]) => ({
      name,
      count: data.count,
      profit: Number(data.profit.toFixed(2))
    })).sort((a, b) => b.profit - a.profit);

    // By Type
    const typeStats: Record<string, { count: number, profit: number }> = {};
    trades.forEach(t => {
      const type = t.tradeType || 'Unknown';
      if (!typeStats[type]) typeStats[type] = { count: 0, profit: 0 };
      typeStats[type].count += 1;
      typeStats[type].profit += t.return;
    });

    const typeData = Object.entries(typeStats).map(([name, data]) => ({
      name,
      value: data.count,
      profit: data.profit
    }));

    // By Pattern
    const patternStats: Record<string, { count: number, profit: number }> = {};
    trades.forEach(t => {
      const patterns = [t.pattern, t.pattern2].filter(p => p && p !== '无');
      patterns.forEach(pattern => {
        if (!patternStats[pattern]) patternStats[pattern] = { count: 0, profit: 0 };
        patternStats[pattern].count += 1;
        patternStats[pattern].profit += t.return;
      });
    });

    const patternData = Object.entries(patternStats).map(([name, data]) => ({
      name,
      value: data.count,
      profit: data.profit
    })).sort((a, b) => b.profit - a.profit);

    // By Signal Bar
    const signalStats: Record<string, { count: number, profit: number }> = {};
    trades.forEach(t => {
      const signal = t.signalBar || 'Unknown';
      if (!signalStats[signal]) signalStats[signal] = { count: 0, profit: 0 };
      signalStats[signal].count += 1;
      signalStats[signal].profit += t.return;
    });

    const signalData = Object.entries(signalStats).map(([name, data]) => ({
      name,
      value: data.count,
      profit: data.profit
    })).sort((a, b) => b.profit - a.profit);

    return {
      winRate: (winCount / trades.length * 100).toFixed(1),
      winCount,
      lossCount,
      beCount,
      symbolData,
      typeData,
      patternData,
      signalData,
      totalProfit: trades.reduce((acc, t) => acc + t.return, 0).toFixed(2)
    };
  }, [trades]);

  if (!stats) {
    return (
      <div className={cn("h-[60vh] flex items-center justify-center italic", theme === 'light' ? "text-zinc-400" : "text-zinc-500")}>
        需要至少一笔交易数据来生成可视化图表。
      </div>
    );
  }

  const pieData = [
    { name: '盈利', value: stats.winCount, color: '#10b981' },
    { name: '亏损', value: stats.lossCount, color: '#f43f5e' },
    { name: '保本', value: stats.beCount, color: '#71717a' },
  ];

  const cardClass = cn(
    "border p-6 rounded-2xl transition-colors",
    theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
  );

  const titleClass = "text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
      {/* Win Rate Pie Chart */}
      <div className={cardClass}>
        <h4 className={titleClass}>胜率分布</h4>
        <div className="h-64 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', 
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #27272a', 
                  borderRadius: '8px' 
                }}
                itemStyle={{ color: theme === 'light' ? '#18181b' : '#f4f4f5' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-4 ml-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-zinc-400">{d.name}:</span>
                <span className={cn("font-bold", theme === 'light' ? "text-zinc-900" : "text-zinc-100")}>{d.value}</span>
              </div>
            ))}
            <div className={cn("mt-2 pt-2 border-t", theme === 'light' ? "border-zinc-100" : "border-zinc-800")}>
              <div className="text-xs text-zinc-500 uppercase font-bold">总胜率</div>
              <div className="text-2xl font-bold text-emerald-500">{stats.winRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit by Symbol */}
      <div className={cardClass}>
        <h4 className={titleClass}>品种盈亏统计</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.symbolData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? "#f3f4f6" : "#27272a"} vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: theme === 'light' ? '#f3f4f6' : '#27272a', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', 
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #27272a', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                {stats.symbolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Performance */}
      <div className={cardClass}>
        <h4 className={titleClass}>形态表现 (Pattern)</h4>
        <div className="space-y-4">
          {stats.patternData.slice(0, 5).map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className={cn("text-sm", theme === 'light' ? "text-zinc-600" : "text-zinc-300")}>{item.name}</div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500">{item.value} 笔</div>
                <div className={`text-sm font-mono font-bold ${item.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Bar Performance */}
      <div className={cardClass}>
        <h4 className={titleClass}>信号K线表现 (Signal Bar)</h4>
        <div className="space-y-4">
          {stats.signalData.slice(0, 5).map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className={cn("text-sm", theme === 'light' ? "text-zinc-600" : "text-zinc-300")}>{item.name}</div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500">{item.value} 笔</div>
                <div className={`text-sm font-mono font-bold ${item.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Types */}
      <div className={cn(cardClass, "lg:col-span-2")}>
        <h4 className={titleClass}>交易类型表现</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.typeData.map(type => (
            <div key={type.name} className={cn("p-4 rounded-xl border", theme === 'light' ? "bg-zinc-50 border-zinc-100" : "bg-zinc-800/30 border-zinc-800/50")}>
              <div className="text-xs text-zinc-500 uppercase font-bold mb-1">{type.name}</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className={cn("text-xl font-bold", theme === 'light' ? "text-zinc-900" : "text-zinc-100")}>{type.value} 笔交易</div>
                  <div className={`text-sm font-mono ${type.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {type.profit >= 0 ? '+' : ''}{type.profit.toFixed(2)}
                  </div>
                </div>
                <div className={cn("w-16 h-1 rounded-full overflow-hidden", theme === 'light' ? "bg-zinc-200" : "bg-zinc-700")}>
                  <div 
                    className={`h-full ${type.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${Math.min(100, (Math.abs(type.profit) / (Math.abs(Number(stats.totalProfit)) || 1) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
