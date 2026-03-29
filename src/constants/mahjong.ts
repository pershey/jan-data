// 局の結果種別
export const ROUND_RESULTS = {
  ron_win: { label: 'ロン和了', color: '#E53935' },
  tsumo_win: { label: 'ツモ和了', color: '#FF6F00' },
  deal_in: { label: '放銃', color: '#1E88E5' },
  tsumo_loss: { label: '被ツモ', color: '#7B1FA2' },
  lateral: { label: '横移動', color: '#757575' },
  draw: { label: '流局', color: '#9E9E9E' },
} as const;

export type RoundResult = keyof typeof ROUND_RESULTS;

export const ROUND_RESULT_KEYS: RoundResult[] = [
  'ron_win',
  'tsumo_win',
  'deal_in',
  'tsumo_loss',
  'lateral',
  'draw',
];

// レートプリセット（1000点あたりの円）
export const RATE_PRESETS = [
  { label: '点5', value: 50 },
  { label: '点10', value: 100 },
] as const;

// ウマプリセット（千点単位: [小, 大]）
export const UMA_PRESETS = [
  { label: 'なし', small: 0, big: 0 },
  { label: '5-10', small: 5, big: 10 },
  { label: '10-20', small: 10, big: 20 },
  { label: '10-30', small: 10, big: 30 },
] as const;

// 原点（デフォルト）
export const BASE_SCORE = 30000;
// 配給原点（デフォルト）- 原点との差がオカになる
export const STARTING_SCORE = 25000;
