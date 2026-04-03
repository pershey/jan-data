import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';

// ネイティブ環境でのATTダイアログ表示 + AdMob SDK初期化
export async function initializeAds(): Promise<void> {
  if (Platform.OS === 'ios') {
    await requestTrackingPermissionsAsync();
  }
  await mobileAds().initialize();
}
