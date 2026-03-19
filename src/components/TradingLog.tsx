import React, { useState } from 'react';
import { Trash2, Image as ImageIcon, Star, ExternalLink, MoreVertical, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trade, ThemeMode } from '../types';
import { format } from 'date-fns';
import TradeForm from './TradeForm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TradingLogProps {
  trades: Trade[];
  onAdd: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onUpdate: (trade: Trade) => void;
  theme: ThemeMode;
}

export default function TradingLog({ trades, onDelete, onUpdate, theme }: TradingLogProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTrades = trades.filter(t => 
    t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.logic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.pattern2 && t.pattern2.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.entryTime.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h3 className={cn("text-xl font-black tracking-tight", theme === 'light' ? "text-zinc-900" : "text-white")}>交易笔记</h3>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="搜索品种、逻辑或形态..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full border rounded-2xl pl-12 pr-5 py-3 text-sm outline-none focus:border-emerald-500 transition-all font-bold",
                theme === 'light' ? "bg-white border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
              )}
            />
          </div>
          <button className={cn(
            "p-3 border rounded-2xl text-zinc-500 hover:text-white transition-all",
            theme === 'light' ? "bg-white border-zinc-200 hover:bg-zinc-100" : "bg-white/[0.03] border-white/10 hover:bg-white/5"
          )}>
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className={cn(
        "overflow-x-auto rounded-[2.5rem] border shadow-2xl transition-colors",
        theme === 'light' ? "bg-white border-zinc-200" : "bg-[#0F0F11] border-white/10"
      )}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn("border-b transition-colors", theme === 'light' ? "bg-zinc-50 border-zinc-200" : "bg-white/[0.02] border-white/5")}>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">品种/时间</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">逻辑/周期</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">级别/类型</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">手数/方向</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">信号/形态</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">回报/RR</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">评分</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">状态</th>
              <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-right">操作</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-colors", theme === 'light' ? "divide-zinc-100" : "divide-white/5")}>
            {filteredTrades.length === 0 && (
              <tr>
                <td colSpan={9} className="p-24 text-center text-zinc-500 italic">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <Search size={48} />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      {searchTerm ? "没有找到匹配的交易记录" : "暂无交易记录，开启你的交易之旅"}
                    </span>
                  </div>
                </td>
              </tr>
            )}
            {filteredTrades.map((trade) => (
              <tr 
                key={trade.id} 
                onClick={() => setSelectedTrade(trade)}
                className={cn(
                  "transition-all group cursor-pointer border-l-4 border-transparent",
                  theme === 'light' ? "hover:bg-zinc-50 hover:border-emerald-500" : "hover:bg-white/[0.02] hover:border-emerald-500"
                )}
              >
                <td className="p-6">
                  <div className={cn("font-black text-lg", theme === 'light' ? "text-zinc-900" : "text-white")}>{trade.symbol}</div>
                  <div className="text-[10px] text-zinc-500 font-mono font-bold mt-0.5">{format(new Date(trade.entryTime), 'MM/dd HH:mm')}</div>
                </td>
                <td className="p-6">
                  <div className={cn("text-xs truncate max-w-[180px] font-medium", theme === 'light' ? "text-zinc-600" : "text-zinc-300")}>{trade.logic}</div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mt-2", theme === 'light' ? "bg-zinc-100 text-zinc-500" : "bg-white/5 text-zinc-500")}>{trade.marketCycle}</div>
                </td>
                <td className="p-6">
                  <div className={cn("text-xs font-bold", theme === 'light' ? "text-zinc-500" : "text-zinc-400")}>{trade.timeframe}</div>
                  <div className="text-[10px] text-zinc-600 italic font-medium mt-1 uppercase tracking-tighter">{trade.tradeType}</div>
                </td>
                <td className="p-6">
                  <div className={cn("text-xs font-mono font-black", theme === 'light' ? "text-zinc-600" : "text-zinc-300")}>{trade.lots} 手</div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest mt-1", trade.direction === 'Long' ? 'text-emerald-500' : 'text-rose-500')}>
                    {trade.direction === 'Long' ? 'Long' : 'Short'}
                  </div>
                </td>
                <td className="p-6">
                  <div className={cn("text-xs font-bold", theme === 'light' ? "text-zinc-700" : "text-zinc-300")}>{trade.signalBar}</div>
                  <div className="text-[10px] text-zinc-500 font-medium mt-1">
                    {trade.pattern}{trade.pattern2 && trade.pattern2 !== '无' ? ` + ${trade.pattern2}` : ''}
                  </div>
                </td>
                <td className="p-6">
                  <div className={cn("text-sm font-mono font-black", trade.return > 0 ? 'text-emerald-400' : trade.return < 0 ? 'text-rose-400' : 'text-zinc-400')}>
                    {trade.return > 0 ? '+' : ''}{trade.return}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">1:{trade.rrRatio}</div>
                </td>
                <td className="p-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={12} fill={trade.rating >= s ? '#eab308' : 'none'} className={trade.rating >= s ? 'text-yellow-500' : 'text-zinc-800'} />
                    ))}
                  </div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border",
                    trade.status === '盈' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    trade.status === '亏' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                  )}>
                    {trade.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-4">
                    {trade.chartAttachment || trade.chartUrl ? <ImageIcon size={18} className="text-emerald-500/40" /> : null}
                    
                    {deletingId === trade.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(trade.id);
                            setDeletingId(null);
                          }}
                          className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-rose-400 transition-all"
                        >
                          确认
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all",
                            theme === 'light' ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          )}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(trade.id);
                        }}
                        className="p-3 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Large Edit Form */}
      <TradeForm 
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onSave={(updated) => {
          onUpdate(updated);
          setSelectedTrade(null);
        }}
        initialData={selectedTrade || undefined}
        title="编辑交易记录"
        theme={theme}
      />
    </div>
  );
}
