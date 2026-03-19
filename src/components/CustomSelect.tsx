import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CustomSelectProps<T extends string> {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  allowCustom?: boolean;
  theme?: 'light' | 'dark';
}

export default function CustomSelect<T extends string>({ 
  value, 
  options, 
  onChange, 
  label,
  placeholder,
  allowCustom = false,
  theme = 'dark'
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full border rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all outline-none",
          theme === 'light' 
            ? "bg-zinc-100 border-zinc-200 text-zinc-900 hover:border-zinc-300" 
            : "bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700",
          isOpen && "border-emerald-500 ring-1 ring-emerald-500"
        )}
      >
        <span className={cn("truncate font-medium", !value && "text-zinc-500")}>
          {value || placeholder || "选择选项"}
        </span>
        <ChevronDown size={16} className={cn("text-zinc-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className={cn(
              "absolute z-[110] w-full mt-2 border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
              theme === 'light' ? "bg-white/90 border-zinc-200" : "bg-[#18181B]/90 border-zinc-800"
            )}
          >
            <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                    value === option 
                      ? "bg-emerald-500 text-black font-bold" 
                      : theme === 'light' ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  {option}
                </button>
              ))}
              
              {allowCustom && (
                <div className={cn(
                  "mt-1 pt-1 border-t",
                  theme === 'light' ? "border-zinc-100" : "border-zinc-800"
                )}>
                  {!isAddingCustom ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(true)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-emerald-500 hover:bg-emerald-500/10 transition-colors font-bold"
                    >
                      + 添加自定义
                    </button>
                  ) : (
                    <div className="p-2 flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="输入自定义值"
                        className={cn(
                          "flex-1 rounded-lg px-2 py-1 text-xs outline-none focus:border-emerald-500",
                          theme === 'light' ? "bg-zinc-100 border border-zinc-200" : "bg-zinc-800 border border-zinc-700 text-white"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customValue) {
                            onChange(customValue as T);
                            setIsOpen(false);
                            setIsAddingCustom(false);
                            setCustomValue('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customValue) {
                            onChange(customValue as T);
                            setIsOpen(false);
                            setIsAddingCustom(false);
                            setCustomValue('');
                          }
                        }}
                        className="bg-emerald-500 text-black px-2 py-1 rounded-lg text-[10px] font-bold"
                      >
                        确定
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
