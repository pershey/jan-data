import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';

// UIが完全に描画されるまで待機するヘルパー
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ネイティブ環境でのATTダイアログ表示 + AdMob SDK初期化
// 注意: この関数はスプラッシュスクリーン非表示後に呼ぶこと
export async function initializeAds(): Promise<void> {
  if (Platform.OS === 'ios') {
    // iOSではアプリ起動直後にATTダイアログを表示するとシステムに抑制される
    // UIが完全に描画された後、十分な遅延を入れてからダイアログを表示する
    await delay(1500);
    await requestTrackingPermissionsAsync();
  }
  await mobileAds().initialize();
}
