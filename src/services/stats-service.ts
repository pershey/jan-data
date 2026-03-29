import type { Game, Round, MahjongStats } from '@/types';

// 統計を計算
export function calculateStats(games: Game[], rounds: Round[]): MahjongStats {
  const totalGames = games.length;
  const totalRounds = rounds.length;

  const emptyStats: MahjongStats = {
    totalGames: 0,
    totalRounds: 0,
    winRate: 0,
    dealInRate: 0,
    callRate: 0,
    riichiRate: 0,
    avgIncome: 0,
    totalIncome: 0,
    rankDistribution: [0, 0, 0, 0],
    avgRank: 0,
  };

  if (totalGames === 0) return emptyStats;

  // 収支統計
  const totalIncome = games.reduce((sum, g) => sum + g.income, 0);
  const avgIncome = totalIncome / totalGames;

  // 順位分布
  const rankDistribution: [number, number, number, number] = [0, 0, 0, 0];
  games.forEach((g) => {
    if (g.rank >= 1 && g.rank <= 4) {
      rankDistribution[g.rank - 1]++;
    }
  });

  // 平均順位
  const avgRank = games.reduce((sum, g) => sum + g.rank, 0) / totalGames;

  // 局データが無い場合は率を0にする
  if (totalRounds === 0) {
    return {
      ...emptyStats,
      totalGames,
      avgIncome,
      totalIncome,
      rankDistribution,
      avgRank,
    };
  }

  // 和了率
  const winCount = rounds.filter(
    (r) => r.result === 'ron_win' || r.result === 'tsumo_win'
  ).length;
  const winRate = winCount / totalRounds;

  // 放銃率
  const dealInCount = rounds.filter((r) => r.result === 'deal_in').length;
  const dealInRate = dealInCount / totalRounds;

  // 副露率
  const callCount = rounds.filter((r) => r.hasCall).length;
  const callRate = callCount / totalRounds;

  // 立直率
  const riichiCount = rounds.filter((r) => r.riichi).length;
  const riichiRate = riichiCount / totalRounds;

  return {
    totalGames,
    totalRounds,
    winRate,
    dealInRate,
    callRate,
    riichiRate,
    avgIncome,
    totalIncome,
    rankDistribution,
    avgRank,
  };
}
