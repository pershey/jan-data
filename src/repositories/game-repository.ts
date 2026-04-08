import { useSQLiteContext } from 'expo-sqlite';
import type { Game } from '@/types';

interface GameRow {
  id: number;
  played_at: string;
  rate: number;
  rank: number;
  raw_score: number;
  game_fee: number;
  income: number;
  chip_count: number;
  chip_price: number;
  uma_big: number;
  uma_small: number;
  oka: number;
  top_prize: number;
  tobisho: number;
  tobisho_received: number;
  session_id: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: GameRow): Game {
  return {
    id: row.id,
    playedAt: row.played_at,
    rate: row.rate,
    rank: row.rank,
    rawScore: row.raw_score,
    gameFee: row.game_fee,
    income: row.income,
    chipCount: row.chip_count,
    chipPrice: row.chip_price,
    umaBig: row.uma_big,
    umaSmall: row.uma_small,
    oka: row.oka,
    topPrize: row.top_prize,
    tobisho: row.tobisho ?? 0,
    tobishoReceived: row.tobisho_received ?? 0,
    sessionId: row.session_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useGameRepository() {
  const db = useSQLiteContext();

  // 全件取得（新しい順）
  async function getAll(): Promise<Game[]> {
    const rows = await db.getAllAsync<GameRow>(
      'SELECT * FROM games ORDER BY played_at DESC'
    );
    return rows.map(mapRow);
  }

  // ID指定で取得
  async function getById(id: number): Promise<Game | null> {
    const row = await db.getFirstAsync<GameRow>(
      'SELECT * FROM games WHERE id = ?',
      [id]
    );
    return row ? mapRow(row) : null;
  }

  // セッション内の半荘を取得（新しい順）
  async function getBySessionId(sessionId: number): Promise<Game[]> {
    const rows = await db.getAllAsync<GameRow>(
      'SELECT * FROM games WHERE session_id = ? ORDER BY played_at DESC',
      [sessionId]
    );
    return rows.map(mapRow);
  }

  // セッションに紐づかない単発対局を取得
  async function getStandalone(): Promise<Game[]> {
    const rows = await db.getAllAsync<GameRow>(
      'SELECT * FROM games WHERE session_id IS NULL ORDER BY played_at DESC'
    );
    return rows.map(mapRow);
  }

  // 新規作成
  async function create(data: {
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
    topPrize?: number;
    tobisho?: number;
    tobishoReceived?: number;
    sessionId?: number | null;
    note?: string;
  }): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO games (played_at, rate, rank, raw_score, game_fee, income,
        chip_count, chip_price, uma_big, uma_small, oka, top_prize, tobisho, tobisho_received,
        session_id, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.playedAt,
        data.rate,
        data.rank,
        data.rawScore,
        data.gameFee,
        data.income,
        data.chipCount,
        data.chipPrice,
        data.umaBig,
        data.umaSmall,
        data.oka,
        data.topPrize ?? 0,
        data.tobisho ?? 0,
        data.tobishoReceived ?? 0,
        data.sessionId ?? null,
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
      topPrize?: number;
      tobisho?: number;
      tobishoReceived?: number;
      sessionId?: number | null;
      note?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE games SET
        played_at = ?, rate = ?, rank = ?, raw_score = ?, game_fee = ?, income = ?,
        chip_count = ?, chip_price = ?, uma_big = ?, uma_small = ?, oka = ?,
        top_prize = ?, tobisho = ?, tobisho_received = ?,
        session_id = ?, note = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.playedAt,
        data.rate,
        data.rank,
        data.rawScore,
        data.gameFee,
        data.income,
        data.chipCount,
        data.chipPrice,
        data.umaBig,
        data.umaSmall,
        data.oka,
        data.topPrize ?? 0,
        data.tobisho ?? 0,
        data.tobishoReceived ?? 0,
        data.sessionId ?? null,
        data.note ?? null,
        now,
        id,
      ]
    );
  }

  // 削除
  async function remove(id: number): Promise<void> {
    await db.runAsync('DELETE FROM games WHERE id = ?', [id]);
  }

  return { getAll, getById, getBySessionId, getStandalone, create, update, remove };
}
