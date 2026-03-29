import { useState, useCallback } from 'react';
import { useGameRepository } from '@/repositories/game-repository';
import type { Game } from '@/types';

export function useGames() {
  const repo = useGameRepository();
  const [games, setGames] = useState<Game[]>([]);

  const reload = useCallback(async () => {
    const data = await repo.getAll();
    setGames(data);
  }, []);

  return { games, reload };
}
