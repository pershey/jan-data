import { useSQLiteContext } from 'expo-sqlite';
import type { Round } from '@/types';
import type { RoundResult } from '@/constants/mahjong';

interface RoundRow {
  id: number;
  game_id: number;
  round_number: number;
  result: string;
  riichi: number;
  has_call: number;
  call_count: number;
  chip_delta: number;
  note: string | null;
  created_at: string;
}

function mapRow(row: RoundRow): Round {
  return {
    id: row.id,
    gameId: row.game_id,
    roundNumber: row.round_number,
    result: row.result as RoundResult,
    riichi: row.riichi === 1,
    hasCall: row.has_call === 1,
    callCount: row.call_count,
    chipDelta: row.chip_delta,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function useRoundRepository() {
  const db = useSQLiteContext();

  // 半荘に紐づく局を取得
  async function getByGameId(gameId: number): Promise<Round[]> {
    const rows = await db.getAllAsync<RoundRow>(
      'SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number ASC',
      [gameId]
    );
    return rows.map(mapRow);
  }

  // 全局取得
  async function getAll(): Promise<Round[]> {
    const rows = await db.getAllAsync<RoundRow>(
      'SELECT * FROM rounds ORDER BY id ASC'
    );
    return rows.map(mapRow);
  }

  // 一括作成（半荘保存時にまとめて局を保存）
  async function createMany(
    gameId: number,
    roundsData: {
      roundNumber: number;
      result: RoundResult;
      riichi: boolean;
      hasCall: boolean;
      callCount: number;
      chipDelta: number;
    }[]
  ): Promise<void> {
    const now = new Date().toISOString();
    for (const r of roundsData) {
      await db.runAsync(
        `INSERT INTO rounds (game_id, round_number, result, riichi, has_call, call_count, chip_delta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gameId,
          r.roundNumber,
          r.result,
          r.riichi ? 1 : 0,
          r.hasCall ? 1 : 0,
          r.callCount,
          r.chipDelta,
          now,
        ]
      );
    }
  }

  // 全局置換（編集時に使用: 既存局を削除して新規作成）
  async function replaceAll(
    gameId: number,
    roundsData: {
      roundNumber: number;
      result: RoundResult;
      riichi: boolean;
      hasCall: boolean;
      callCount: number;
      chipDelta: number;
    }[]
  ): Promise<void> {
    await db.runAsync('DELETE FROM rounds WHERE game_id = ?', [gameId]);
    await createMany(gameId, roundsData);
  }

  return { getByGameId, getAll, createMany, replaceAll };
}
