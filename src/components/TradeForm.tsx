import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, BarChart2, Zap, Target, TrendingUp, TrendingDown, Star, Image as ImageIcon, MessageSquare, Info, ChevronDown, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trade, MarketCycle, Timeframe, SignalBar, TradePattern, TradeType, ThemeMode } from '../types';
import { format } from 'date-fns';
import CustomSelect from './CustomSelect';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialData?: Partial<Trade>;
  theme?: ThemeMode;
  title?: string;
}

const MARKET_CYCLES: MarketCycle[] = ['突破', '窄通道', '宽通道', '震荡区间'];
const TIMEFRAMES: Timeframe[] = ['1分钟', '5分钟', '15分钟', '30分钟', '1小时', '2小时', '4小时', '日线', '周线', '月线'];
const SIGNAL_BARS: SignalBar[] = ['趋势K线', '孕线', '外包线', '十字星', '单K线反转', '双K线反转'];
const PATTERNS: TradePattern[] = ['无', '双顶', '双底', '牛旗', '熊旗', '两段式回调', '三推楔形', '嵌套楔形', '抛物线楔形', '趋势回调', '高1', '高2', '高3', '低1', '低2', '低3', '头肩顶', '头肩底'];
const TRADE_TYPES: TradeType[] = ['趋势延续', '反转', '突破', '假突破'];

import { generateId } from '../utils';

export default function TradeForm({ isOpen, onClose, onSave, initialData, title = "新增交易记录", theme = 'dark' }: TradeFormProps) {
  const defaultFormData: Partial<Trade> = {
    symbol: '',
    entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    logic: '',
    marketCycle: '突破',
    timeframe: '1小时',
    lots: 0.1,
    direction: 'Long',
    return: 0,
    chartUrl: '',
    pattern: '无',
    pattern2: '无',
    signalBar: '趋势K线',
    rrRatio: 1,
    tradeType: '趋势延续',
    rating: 3,
    review: '',
  };

  const [formData, setFormData] = useState<Partial<Trade>>(defaultFormData);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [returnInput, setReturnInput] = useState<string>('0');
  const [lotsInput, setLotsInput] = useState<string>('0.1');

  const lotsRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...defaultFormData, ...initialData });
        setReturnInput(String(initialData.return || 0));
        setLotsInput(String(initialData.lots || 0.1));
      } else {
        setFormData({ ...defaultFormData, entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
        setReturnInput('0');
        setLotsInput('0.1');
      }
    }
  }, [isOpen, initialData]);

  // Handle wheel events with passive: false to prevent page scroll
  useEffect(() => {
    const handleLotsWheel = (e: WheelEvent) => {
      if (document.activeElement === lotsRef.current) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1;
        const currentVal = parseFloat(lotsInput) || 0;
        const newVal = Number((currentVal + direction * 0.01).toFixed(2));
        if (newVal >= 0.01) {
          setLotsInput(String(newVal));
          setFormData(prev => ({ ...prev, lots: newVal }));
        }
      }
    };

    const handleReturnWheel = (e: WheelEvent) => {
      if (document.activeElement === returnRef.current) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1;
        const currentVal = parseFloat(returnInput) || 0;
        const newVal = Number((currentVal + direction * 1).toFixed(2));
        setReturnInput(String(newVal));
        setFormData(prev => ({ ...prev, return: newVal }));
      }
    };

    const lotsEl = lotsRef.current;
    const returnEl = returnRef.current;

    if (lotsEl) lotsEl.addEventListener('wheel', handleLotsWheel, { passive: false });
    if (returnEl) returnEl.addEventListener('wheel', handleReturnWheel, { passive: false });

    return () => {
      if (lotsEl) lotsEl.removeEventListener('wheel', handleLotsWheel);
      if (returnEl) returnEl.removeEventListener('wheel', handleReturnWheel);
    };
  }, [lotsInput, returnInput, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculateStatus = (ret: number): '盈' | '亏' | '保本' => {
      if (ret > 0) return '盈';
      if (ret < 0) return '亏';
      return '保本';
    };

    const trade: Trade = {
      ...formData as Trade,
      id: formData.id || generateId(),
      status: calculateStatus(formData.return || 0),
    };
    onSave(trade);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, chartAttachment: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
      >
        {/* Backdrop with subtle blur and gradient */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Main Form Container */}
          <motion.div
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            className={cn(
              "relative w-full max-w-6xl max-h-[92vh] border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden",
              theme === 'light' ? "bg-white border-zinc-200" : "bg-[#0F0F11] border-white/10"
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-10 py-8 border-b",
              theme === 'light' ? "bg-zinc-50/50 border-zinc-100" : "bg-white/[0.02] border-white/5"
            )}>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <Zap className="text-black w-7 h-7" />
                </div>
                <div>
                  <h2 className={cn("text-2xl font-bold tracking-tight", theme === 'light' ? "text-zinc-900" : "text-white")}>{title}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={cn(
                  "p-3 rounded-2xl transition-all group",
                  theme === 'light' ? "hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900" : "hover:bg-white/5 text-zinc-500 hover:text-white"
                )}
              >
                <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar overflow-x-visible">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-visible">
                
                {/* Left Column: Core Data */}
                <div className="lg:col-span-7 space-y-10">
                  
                  {/* Symbol & Time */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                        <BarChart2 size={14} className="text-emerald-500" /> 交易品种
                      </label>
                      <input
                        required
                        type="text"
                        placeholder=""
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all text-lg font-bold",
                          theme === 'light' ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
                        )}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-500" /> 开仓时间
                      </label>
                      <input
                        required
                        type="datetime-local"
                        value={formData.entryTime}
                        onChange={e => setFormData({ ...formData, entryTime: e.target.value })}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono",
                          theme === 'light' ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
                        )}
                      />
                    </div>
                  </div>

                  {/* Direction & Lots & Return */}
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">交易方向</label>
                      <div className={cn(
                        "flex rounded-2xl p-1.5 border",
                        theme === 'light' ? "bg-zinc-100 border-zinc-200" : "bg-white/[0.03] border-white/10"
                      )}>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, direction: 'Long' })}
                          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            formData.direction === 'Long' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <TrendingUp size={14} /> 多
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, direction: 'Short' })}
                          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            formData.direction === 'Short' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <TrendingDown size={14} /> 空
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">手数</label>
                      <input
                        ref={lotsRef}
                        required
                        type="text"
                        inputMode="decimal"
                        value={lotsInput}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                            setLotsInput(val);
                            const num = parseFloat(val);
                            if (!isNaN(num)) setFormData({ ...formData, lots: num });
                          }
                        }}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none font-mono text-lg",
                          theme === 'light' ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
                        )}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">盈亏金额</label>
                      <input
                        ref={returnRef}
                        required
                        type="text"
                        inputMode="decimal"
                        value={returnInput}
                        onChange={e => {
                          const val = e.target.value;
                          // Allow empty, minus sign, or valid number
                          if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
                            setReturnInput(val);
                            const num = parseFloat(val);
                            if (!isNaN(num)) setFormData({ ...formData, return: num });
                            else if (val === '' || val === '-') setFormData({ ...formData, return: 0 });
                          }
                        }}
                        className={cn(
                          "w-full border rounded-2xl px-5 py-4 font-mono font-bold outline-none text-lg",
                          theme === 'light' ? "bg-zinc-100 border-zinc-200" : "bg-white/[0.03] border-white/10",
                          (formData.return || 0) > 0 ? 'text-emerald-500' : (formData.return || 0) < 0 ? 'text-rose-500' : 'text-zinc-500'
                        )}
                      />
                    </div>
                  </div>

                  {/* Logic */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                      <MessageSquare size={14} className="text-emerald-500" /> 交易逻辑
                    </label>
                    <textarea
                      required
                      placeholder="描述你进入这笔交易的原因..."
                      value={formData.logic}
                      onChange={e => setFormData({ ...formData, logic: e.target.value })}
                      className={cn(
                        "w-full border rounded-2xl px-5 py-4 placeholder:text-zinc-600 focus:border-emerald-500 outline-none min-h-[140px] resize-none transition-all leading-relaxed",
                        theme === 'light' ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
                      )}
                    />
                  </div>

                  {/* Review */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Star size={14} className="text-emerald-500" /> 交易复盘
                    </label>
                    <textarea
                      placeholder="交易结束后的总结与反思..."
                      value={formData.review}
                      onChange={e => setFormData({ ...formData, review: e.target.value })}
                      className={cn(
                        "w-full border rounded-2xl px-5 py-4 placeholder:text-zinc-600 focus:border-emerald-500 outline-none min-h-[140px] resize-none transition-all leading-relaxed",
                        theme === 'light' ? "bg-zinc-100 border-zinc-200 text-zinc-900" : "bg-white/[0.03] border-white/10 text-white"
                      )}
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">执行评分</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={cn(
                            "w-12 h-12 rounded-2xl transition-all flex items-center justify-center",
                            (formData.rating || 0) >= star 
                              ? 'text-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/5' 
                              : theme === 'light' ? 'text-zinc-300 bg-zinc-100 hover:bg-zinc-200' : 'text-zinc-700 bg-white/[0.03] hover:bg-white/5'
                          )}
                        >
                          <Star size={24} fill={(formData.rating || 0) >= star ? 'currentColor' : 'none'} className="transition-transform active:scale-90" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Price Action Details */}
                <div className="lg:col-span-5 space-y-10 overflow-visible">
                  
                  {/* Selectors Grid */}
                  <div className="grid grid-cols-1 gap-8 overflow-visible">
                    <CustomSelect 
                      theme={theme}
                      label="交易类型 (Trade Type)"
                      value={formData.tradeType as string}
                      options={TRADE_TYPES}
                      onChange={(val) => setFormData({ ...formData, tradeType: val as TradeType })}
                    />

                    <CustomSelect 
                      theme={theme}
                      label="市场周期 (Market Cycle)"
                      value={formData.marketCycle as string}
                      options={MARKET_CYCLES}
                      onChange={(val) => setFormData({ ...formData, marketCycle: val as MarketCycle })}
                    />

                    <CustomSelect 
                      theme={theme}
                      label="时间级别 (Timeframe)"
                      value={formData.timeframe as string}
                      options={TIMEFRAMES}
                      onChange={(val) => setFormData({ ...formData, timeframe: val as Timeframe })}
                      allowCustom
                    />

                    <div className="grid grid-cols-2 gap-4 overflow-visible">
                      <CustomSelect 
                        theme={theme}
                        label="形态 1 (Pattern 1)"
                        value={formData.pattern as string}
                        options={PATTERNS}
                        onChange={(val) => setFormData({ ...formData, pattern: val as TradePattern })}
                      />
                      <CustomSelect 
                        theme={theme}
                        label="形态 2 (Pattern 2)"
                        value={formData.pattern2 as string || '无'}
                        options={PATTERNS}
                        onChange={(val) => setFormData({ ...formData, pattern2: val as TradePattern })}
                      />
                    </div>

                    <CustomSelect 
                      theme={theme}
                      label="信号K线 (Signal Bar)"
                      value={formData.signalBar as string}
                      options={SIGNAL_BARS}
                      onChange={(val) => setFormData({ ...formData, signalBar: val as SignalBar })}
                    />

                    {/* Chart View Link */}
                    {formData.chartAttachment && (
                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsPreviewOpen(true)}
                          className="w-full flex items-center justify-center gap-2 py-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all"
                        >
                          <ImageIcon size={16} /> 查看图表
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Chart Upload */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
                      <ImageIcon size={14} className="text-emerald-500" /> 图表附件上传
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all overflow-hidden",
                        theme === 'light' ? "bg-zinc-50 border-zinc-200 group-hover:bg-zinc-100" : "bg-white/[0.02] border-white/10 group-hover:bg-white/[0.05]",
                        "group-hover:border-emerald-500/50"
                      )}>
                        {formData.chartAttachment ? (
                          <div className="relative w-full h-full">
                            <img src={formData.chartAttachment} className="h-full w-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs font-bold text-white uppercase tracking-widest">更换图片</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                              theme === 'light' ? "bg-white shadow-sm" : "bg-white/5"
                            )}>
                              <ImageIcon className="text-zinc-600 group-hover:text-emerald-500" size={24} />
                            </div>
                            <div className="text-center">
                              <span className="block text-xs text-zinc-400 font-bold uppercase tracking-widest">点击或拖拽上传图表</span>
                              <span className="block text-[10px] text-zinc-600 mt-1 uppercase">Supports PNG, JPG, WebP</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className={cn(
              "px-10 py-8 border-t flex justify-end gap-6",
              theme === 'light' ? "bg-zinc-50/50 border-zinc-100" : "bg-white/[0.02] border-white/5"
            )}>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "px-8 py-4 rounded-2xl text-sm font-bold transition-all",
                  theme === 'light' ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200" : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/40 transition-all transform active:scale-95"
              >
                保存交易记录
              </button>
            </div>
          </motion.div>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && formData.chartAttachment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
            >
              <div 
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                onClick={() => setIsPreviewOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-full max-h-full flex flex-col items-center"
              >
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                >
                  <X size={32} />
                </button>
                <img 
                  src={formData.chartAttachment} 
                  alt="Chart Preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                />
                <div className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{formData.symbol} - 图表分析预览</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
