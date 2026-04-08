import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'stats_display_settings';

// 表示可能な統計項目
export type StatsItemKey =
  | 'winRate'
  | 'dealInRate'
  | 'callRate'
  | 'riichiRate'
  | 'goshugiRate'
  | 'akaRate'
  | 'ippatsuRate'
  | 'uraRate';

export interface StatsDisplaySettings {
  winRate: boolean;
  dealInRate: boolean;
  callRate: boolean;
  riichiRate: boolean;
  goshugiRate: boolean;
  akaRate: boolean;
  ippatsuRate: boolean;
  uraRate: boolean;
}

// デフォルト設定（基本4項目ON、ご祝儀系OFF）
const DEFAULT_SETTINGS: StatsDisplaySettings = {
  winRate: true,
  dealInRate: true,
  callRate: true,
  riichiRate: true,
  goshugiRate: false,
  akaRate: false,
  ippatsuRate: false,
  uraRate: false,
};

// 項目のラベル定義
export const STATS_ITEM_LABELS: Record<StatsItemKey, string> = {
  winRate: '和了率',
  dealInRate: '放銃率',
  callRate: '副露率',
  riichiRate: '立直率',
  goshugiRate: 'ご祝儀ゲット率',
  akaRate: '赤ドラ率',
  ippatsuRate: '一発率',
  uraRate: '裏ドラ率',
};

export function useStatsSettings() {
  const [settings, setSettings] = useState<StatsDisplaySettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // 設定の読み込み
  useEffect(() => {
    async function load() {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const saved = JSON.parse(json) as Partial<StatsDisplaySettings>;
          // デフォルトとマージ（新しい項目が追加された時に対応）
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        }
      } catch {
        // 読み込み失敗時はデフォルト値を使用
      }
      setLoaded(true);
    }
    load();
  }, []);

  // 設定の保存
  const updateSetting = useCallback(async (key: StatsItemKey, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // 非同期で保存（エラーは無視）
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { settings, loaded, updateSetting };
}
