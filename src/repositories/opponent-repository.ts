import { useSQLiteContext } from 'expo-sqlite';
import type { Opponent } from '@/types';

interface OpponentRow {
  id: number;
  name: string;
  wins: number;
  losses: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: OpponentRow): Opponent {
  return {
    id: row.id,
    name: row.name,
    wins: row.wins,
    losses: row.losses,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useOpponentRepository() {
  const db = useSQLiteContext();

  // 全件取得
  async function getAll(): Promise<Opponent[]> {
    const rows = await db.getAllAsync<OpponentRow>(
      'SELECT * FROM opponents ORDER BY name ASC'
    );
    return rows.map(mapRow);
  }

  // ID指定で取得
  async function getById(id: number): Promise<Opponent | null> {
    const row = await db.getFirstAsync<OpponentRow>(
      'SELECT * FROM opponents WHERE id = ?',
      [id]
    );
    return row ? mapRow(row) : null;
  }

  // 新規追加
  async function create(name: string): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO opponents (name, wins, losses, created_at, updated_at)
       VALUES (?, 0, 0, ?, ?)`,
      [name, now, now]
    );
    return result.lastInsertRowId;
  }

  // 勝ち +1
  async function incrementWins(id: number): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE opponents SET wins = wins + 1, updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  // 負け +1
  async function incrementLosses(id: number): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE opponents SET losses = losses + 1, updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  // 勝ち -1（最低0）
  async function decrementWins(id: number): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE opponents SET wins = MAX(wins - 1, 0), updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  // 負け -1（最低0）
  async function decrementLosses(id: number): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE opponents SET losses = MAX(losses - 1, 0), updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  // 名前変更
  async function updateName(id: number, name: string): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE opponents SET name = ?, updated_at = ? WHERE id = ?',
      [name, now, id]
    );
  }

  // 削除
  async function remove(id: number): Promise<void> {
    await db.runAsync('DELETE FROM opponents WHERE id = ?', [id]);
  }

  return {
    getAll,
    getById,
    create,
    incrementWins,
    incrementLosses,
    decrementWins,
    decrementLosses,
    updateName,
    remove,
  };
}
