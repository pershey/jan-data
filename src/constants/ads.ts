import { Platform } from 'react-native';

// テスト用広告ID（開発環境で使用）
const TEST_BANNER_ID_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ID_ANDROID = 'ca-app-pub-3940256099942544/6300978111';

// 本番用広告ID（リリース時にAdMobコンソールで取得したIDに差し替え）
const PROD_BANNER_ID_IOS = 'ca-app-pub-7844017135115297/3390403135';
const PROD_BANNER_ID_ANDROID = 'YOUR_PRODUCTION_ANDROID_BANNER_ID';

// __DEV__ はReact Nativeの組み込み変数。開発ビルドではtrue
const isDev = __DEV__;

export const AdUnitIds = {
  banner: Platform.select({
    ios: isDev ? TEST_BANNER_ID_IOS : PROD_BANNER_ID_IOS,
    android: isDev ? TEST_BANNER_ID_ANDROID : PROD_BANNER_ID_ANDROID,
    default: '',
  }),
} as const;
