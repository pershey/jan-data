import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 半荘テーブル
export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playedAt: text('played_at').notNull(),
  rate: integer('rate').notNull(),
  rank: integer('rank').notNull(),
  rawScore: integer('raw_score').notNull(),
  gameFee: integer('game_fee').notNull().default(0),
  income: integer('income').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 局テーブル
export const rounds = sqliteTable('rounds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  result: text('result').notNull(), // ron_win | tsumo_win | deal_in | tsumo_loss | lateral | draw
  riichi: integer('riichi', { mode: 'boolean' }).notNull().default(false),
  hasCall: integer('has_call', { mode: 'boolean' }).notNull().default(false),
  callCount: integer('call_count').notNull().default(0),
  note: text('note'),
  createdAt: text('created_at').notNull(),
});
