import { useState, useCallback } from 'react';
import { useGameRepository } from '@/repositories/game-repository';
import { useRoundRepository } from '@/repositories/round-repository';
import { calculateStats } from '@/services/stats-service';
import type { Game, MahjongStats } from '@/types';

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

export function useStats() {
  const gameRepo = useGameRepository();
  const roundRepo = useRoundRepository();
  const [stats, setStats] = useState<MahjongStats>(emptyStats);
  const [games, setGames] = useState<Game[]>([]);

  const reload = useCallback(async () => {
    const allGames = await gameRepo.getAll();
    const allRounds = await roundRepo.getAll();
    setGames(allGames);
    setStats(calculateStats(allGames, allRounds));
  }, []);

  return { stats, games, reload };
}
