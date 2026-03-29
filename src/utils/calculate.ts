import { BASE_SCORE } from '@/constants/mahjong';

// 収支を計算（チップ・ウマオカ・トップ賞込み）
export function calculateIncome(params: {
  rawScore: number;
  rate: number;       // 1000点あたりの円
  rank: number;
  gameFee: number;
  chipCount: number;
  chipPrice: number;
  umaBig: number;     // 千点単位 (例: 20)
  umaSmall: number;   // 千点単位 (例: 10)
  oka: number;        // 配給原点と原点の差 (例: 5000)
  topPrize?: number;  // トップ賞（1位がお店に払う金額、円）
}): number {
  const {
    rawScore, rate, rank, gameFee,
    chipCount, chipPrice,
    umaBig, umaSmall, oka,
    topPrize = 0,
  } = params;

  // ポイント差分
  const pointDiff = rawScore - BASE_SCORE;

  // ウマ（千点単位 → 点に変換）
  let umaPoints = 0;
  if (rank === 1) umaPoints = umaBig * 1000;
  else if (rank === 2) umaPoints = umaSmall * 1000;
  else if (rank === 3) umaPoints = -umaSmall * 1000;
  else if (rank === 4) umaPoints = -umaBig * 1000;

  // オカ（1着のみ全額）
  const okaPoints = rank === 1 ? oka * 4 : 0;

  // レート換算: (ポイント差分 + ウマ + オカ) / 1000 * レート
  const rateIncome = ((pointDiff + umaPoints + okaPoints) / 1000) * rate;

  // チップ収入
  const chipIncome = chipCount * chipPrice;

  // トップ賞（1位のみお店に支払う追加料金）
  const topPrizeCost = rank === 1 ? topPrize : 0;

  // 最終収支 = レート換算 + チップ - 場代 - トップ賞
  return Math.round(rateIncome + chipIncome - gameFee - topPrizeCost);
}
