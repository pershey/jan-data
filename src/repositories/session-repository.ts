import { useSQLiteContext } from 'expo-sqlite';
import type { Session } from '@/types';

interface SessionRow {
  id: number;
  name: string | null;
  rate: number;
  game_fee: number;
  chip_price: number;
  uma_big: number;
  uma_small: number;
  oka: number;
  top_prize: number;
  started_at: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    rate: row.rate,
    gameFee: row.game_fee,
    chipPrice: row.chip_price,
    umaBig: row.uma_big,
    umaSmall: row.uma_small,
    oka: row.oka,
    topPrize: row.top_prize,
    startedAt: row.started_at,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useSessionRepository() {
  const db = useSQLiteContext();

  // 全件取得（新しい順）
  async function getAll(): Promise<Session[]> {
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM sessions ORDER BY started_at DESC'
    );
    return rows.map(mapRow);
  }

  // ID指定で取得
  async function getById(id: number): Promise<Session | null> {
    const row = await db.getFirstAsync<SessionRow>(
      'SELECT * FROM sessions WHERE id = ?',
      [id]
    );
    return row ? mapRow(row) : null;
  }

  // 新規作成
  async function create(data: {
    name?: string;
    rate: number;
    gameFee: number;
    chipPrice: number;
    umaBig: number;
    umaSmall: number;
    oka: number;
    topPrize: number;
    startedAt: string;
    note?: string;
  }): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO sessions (name, rate, game_fee, chip_price, uma_big, uma_small, oka, top_prize, started_at, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name ?? null,
        data.rate,
        data.gameFee,
        data.chipPrice,
        data.umaBig,
        data.umaSmall,
        data.oka,
        data.topPrize,
        data.startedAt,
        data.note ?? null,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  }

  // 更新
  async function update(
    id: number,
    data: {
      name?: string;
      rate: number;
      gameFee: number;
      chipPrice: number;
      umaBig: number;
      umaSmall: number;
      oka: number;
      topPrize: number;
      note?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE sessions SET
        name = ?, rate = ?, game_fee = ?, chip_price = ?,
        uma_big = ?, uma_small = ?, oka = ?, top_prize = ?,
        note = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.name ?? null,
        data.rate,
        data.gameFee,
        data.chipPrice,
        data.umaBig,
        data.umaSmall,
        data.oka,
        data.topPrize,
        data.note ?? null,
        now,
        id,
      ]
    );
  }

  // 削除
  async function remove(id: number): Promise<void> {
    await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
  }

  return { getAll, getById, create, update, remove };
}
