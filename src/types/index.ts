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
}
