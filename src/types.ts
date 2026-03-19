export type MarketCycle = '突破' | '窄通道' | '宽通道' | '震荡区间';
export type Timeframe = '1分钟' | '5分钟' | '15分钟' | '30分钟' | '1小时' | '2小时' | '4小时' | '日线' | '周线' | '月线' | string;
export type SignalBar = '趋势K线' | '孕线' | '外包线' | '十字星' | '单K线反转' | '双K线反转';
export type TradePattern = '无' | '双顶' | '双底' | '牛旗' | '熊旗' | '两段式回调' | '三推楔形' | '嵌套楔形' | '抛物线楔形' | '趋势回调' | '高1' | '高2' | '高3' | '低1' | '低2' | '低3' | '头肩顶' | '头肩底';
export type TradeType = '趋势延续' | '反转' | '突破' | '假突破';

export interface Trade {
  id: string;
  symbol: string;           // 品种
  entryTime: string;        // 开仓时间
  logic: string;            // 交易逻辑
  marketCycle: MarketCycle; // 市场周期
  timeframe: Timeframe;     // 时间级别
  lots: number;             // 手数
  direction: 'Long' | 'Short'; // 方向
  return: number;           // 回报
  chartUrl: string;         // 图表链接
  chartAttachment?: string; // 图表附件 (Base64)
  pattern: TradePattern;    // 形态1
  pattern2?: TradePattern;  // 形态2
  signalBar: SignalBar;     // 信号K线
  rrRatio: number;          // 盈亏比
  tradeType: TradeType;     // 交易类型
  status: '盈' | '亏' | '保本'; // 盈/亏/保本
  rating: number;           // 评分 (1-5)
  review: string;           // 交易复盘
}

export interface Account {
  id: string;
  name: string;
  remark?: string; // 备注
  initialBalance: number;
  trades: Trade[];
}

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
}

export interface AccountStats {
  initialBalance: number;
  currentBalance: number;
  totalTrades: number;
  winRate: number;
  avgRR: number;
  maxDrawdown: number;
  expectancy: number;
}
