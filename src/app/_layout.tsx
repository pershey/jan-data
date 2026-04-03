import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { initializeAds } from '@/utils/ad-init';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      // ATTダイアログ表示 + AdMob SDK初期化（ネイティブのみ）
      await initializeAds();
      await SplashScreen.hideAsync();
    };
    init();
  }, []);

  return (
    <SQLiteProvider
      databaseName="jandata.db"
      onInit={async (db) => {
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await db.execAsync('PRAGMA foreign_keys = ON;');
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            rate INTEGER NOT NULL,
            game_fee INTEGER NOT NULL DEFAULT 0,
            chip_price INTEGER NOT NULL DEFAULT 0,
            uma_big INTEGER NOT NULL DEFAULT 0,
            uma_small INTEGER NOT NULL DEFAULT 0,
            oka INTEGER NOT NULL DEFAULT 0,
            top_prize INTEGER NOT NULL DEFAULT 0,
            started_at TEXT NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            played_at TEXT NOT NULL,
            rate INTEGER NOT NULL,
            rank INTEGER NOT NULL,
            raw_score INTEGER NOT NULL,
            game_fee INTEGER NOT NULL DEFAULT 0,
            income INTEGER NOT NULL,
            chip_count INTEGER NOT NULL DEFAULT 0,
            chip_price INTEGER NOT NULL DEFAULT 0,
            uma_big INTEGER NOT NULL DEFAULT 0,
            uma_small INTEGER NOT NULL DEFAULT 0,
            oka INTEGER NOT NULL DEFAULT 0,
            top_prize INTEGER NOT NULL DEFAULT 0,
            session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
            note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
            round_number INTEGER NOT NULL,
            result TEXT NOT NULL,
            riichi INTEGER NOT NULL DEFAULT 0,
            has_call INTEGER NOT NULL DEFAULT 0,
            call_count INTEGER NOT NULL DEFAULT 0,
            chip_delta INTEGER NOT NULL DEFAULT 0,
            note TEXT,
            created_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS opponents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            wins INTEGER NOT NULL DEFAULT 0,
            losses INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
        `);
        // 既存テーブルへのカラム追加（マイグレーション）
        const migrate = async (table: string, col: string, def: string) => {
          try { await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${col} ${def};`); } catch { /* 既存 */ }
        };
        await migrate('games', 'chip_count', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'chip_price', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'uma_big', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'uma_small', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'oka', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'top_prize', 'INTEGER NOT NULL DEFAULT 0');
        await migrate('games', 'session_id', 'INTEGER REFERENCES sessions(id) ON DELETE SET NULL');
        await migrate('rounds', 'chip_delta', 'INTEGER NOT NULL DEFAULT 0');
      }}
    >
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="session/new" options={{ title: 'セッション作成', presentation: 'modal' }} />
        <Stack.Screen name="session/[id]" options={{ title: 'セッション詳細' }} />
        <Stack.Screen name="session/edit/[id]" options={{ title: 'セッション編集', presentation: 'modal' }} />
        <Stack.Screen name="game/new" options={{ title: '対局入力', presentation: 'modal' }} />
        <Stack.Screen name="game/[id]" options={{ title: '対局詳細' }} />
        <Stack.Screen name="game/edit/[id]" options={{ title: '対局編集', presentation: 'modal' }} />
      </Stack>
    </SQLiteProvider>
  );
}
