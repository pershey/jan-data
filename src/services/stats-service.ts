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
    goshugiRate: 0,
    akaRate: 0,
    ippatsuRate: 0,
    uraRate: 0,
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

  // 和了局
  const winRounds = rounds.filter(
    (r) => r.result === 'ron_win' || r.result === 'tsumo_win'
  );
  const winCount = winRounds.length;

  // 和了率
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

  // ご祝儀関連（和了局のみ対象）
  let goshugiRate = 0;
  let akaRate = 0;
  let ippatsuRate = 0;
  let uraRate = 0;

  if (winCount > 0) {
    const goshugiCount = winRounds.filter(
      (r) => r.hasAka || r.hasIppatsu || r.hasUra
    ).length;
    goshugiRate = goshugiCount / winCount;
    akaRate = winRounds.filter((r) => r.hasAka).length / winCount;
    ippatsuRate = winRounds.filter((r) => r.hasIppatsu).length / winCount;
    uraRate = winRounds.filter((r) => r.hasUra).length / winCount;
  }

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
    goshugiRate,
    akaRate,
    ippatsuRate,
    uraRate,
  };
}
