import type { RoundResult } from '@/constants/mahjong';

// セッション（場）データ
export interface Session {
  id: number;
  name: string | null;
  rate: number;
  gameFee: number;
  chipPrice: number;
  umaBig: number;
  umaSmall: number;
  oka: number;
  topPrize: number;
  tobisho: number; // トビ賞（円）、0=なし
  startedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// 半荘データ
export interface Game {
  id: number;
  playedAt: string;
  rate: number;
  rank: number;
  rawScore: number;
  gameFee: number;
  income: number;
  chipCount: number;
  chipPrice: number;
  umaBig: number;
  umaSmall: number;
  oka: number;
  topPrize: number;
  tobisho: number; // トビ賞設定値（円）
  tobishoReceived: number; // トビ賞獲得数（相手をトビにした回数）
  sessionId: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// 局データ
export interface Round {
  id: number;
  gameId: number;
  roundNumber: number;
  result: RoundResult;
  riichi: boolean;
  hasCall: boolean;
  callCount: number;
  chipDelta: number;
  hasAka: boolean; // 赤ドラ
  hasIppatsu: boolean; // 一発
  hasUra: boolean; // 裏ドラ
  note: string | null;
  createdAt: string;
}

// 統計データ
export interface MahjongStats {
  totalGames: number;
  totalRounds: number;
  winRate: number;
  dealInRate: number;
  callRate: number;
  riichiRate: number;
  avgIncome: number;
  totalIncome: number;
  rankDistribution: [number, number, number, number];
  avgRank: number;
  // ご祝儀関連
  goshugiRate: number; // ご祝儀ゲット率（赤/一発/裏いずれかを伴う和了の割合）
  akaRate: number; // 赤ドラ率
  ippatsuRate: number; // 一発率
  uraRate: number; // 裏ドラ率
}

// 対戦相手データ（コンペモード）
export interface Opponent {
  id: number;
  name: string;
  wins: number;
  losses: number;
  createdAt: string;
  updatedAt: string;
}

// 入力フォーム用の局データ（ID無し）
export interface RoundInput {
  roundNumber: number;
  result: RoundResult;
  riichi: boolean;
  hasCall: boolean;
  callCount: number;
  chipDelta: number;
  hasAka: boolean; // 赤ドラ
  hasIppatsu: boolean; // 一発
  hasUra: boolean; // 裏ドラ
}
