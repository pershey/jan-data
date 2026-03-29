# CURRENT_STATUS.md（自動更新）
## プロジェクト: jan-data（麻雀フリー専用成績管理アプリ）
## 最終更新: 2026-03-29

## 直近のセッション文脈
### 最終セッション (2026-03-29)
- **議題**: バナー広告統合 + iOSリリース準備
- **実施内容**:
  - AdMob バナー広告統合:
    - `react-native-google-mobile-ads` + `expo-dev-client` インストール
    - `app.json`: `ios.bundleIdentifier: "com.jandata.app"` + AdMobプラグイン設定
    - `eas.json` 新規作成（development / preview / production 3プロファイル）
    - `src/constants/ads.ts` 新規作成（`__DEV__` でテスト/本番ID自動切替）
    - `src/components/ads/BannerAdView.native.tsx` 新規作成（ネイティブ用バナー広告）
    - `src/components/ads/BannerAdView.tsx` 新規作成（Web用ダミー、nullを返す）
    - プラットフォーム別ファイル分割でWebビルド互換性を確保
    - ホーム画面 ScrollView 末尾に `<BannerAdView />` 配置
  - 前回: コンペモード + 収支推移チャート軸ラベル + 対局詳細/編集簡素化
- **主要な結論・決定事項**:
  - iOS先行リリース → Android後追加
  - 広告配置はホーム画面下部のみ（バナータイプ）
  - bundleIdentifier: `com.jandata.app`
  - テスト広告IDで開発、本番時に `ads.ts` と `app.json` のIDを差し替え
- **未解決・次回持ち越し事項**:
  - `eas init` 実行（EASプロジェクト初期化）
  - AdMob本番ID取得・設定（`ads.ts` の `PROD_BANNER_ID_IOS` + `app.json` の `iosAppId`）
  - `eas.json` の submit セクション（appleId, ascAppId, appleTeamId）を実値に設定
  - EAS Build 実行（`eas build --profile development --platform ios`）
  - ATT（App Tracking Transparency）は今回スコープ外、必要時に別途対応

## 完了済み機能
1. ✅ 基盤構築（Expo SDK 55, expo-sqlite, Expo Router）
2. ✅ 対局CRUD（半荘入力・一覧・詳細・編集・削除）
3. ✅ 局データCRUD（和了/放銃/被ツモ/横移動/流局、リーチ、鳴き、チップ増減）
4. ✅ 統計計算（和了率・放銃率・副露率・立直率・収支期待値）
5. ✅ ホーム画面（収支期待値・統計概要）
6. ✅ 収支計算修正（/1000レート、ウマ・オカ・チップ込み）
7. ✅ レートプリセット（点5/点10/カスタム）
8. ✅ セッション（場）機能
9. ✅ トップ賞（1位がお店に払う追加料金）
10. ✅ 素点入力位置を局データの後に移動
11. ✅ 局データ再編集機能（タップで編集フォーム復元、更新/追加の切り替え）
12. ✅ セッション作成画面バツボタン（モーダル閉じる）
13. ✅ 過去雀荘プルダウン選択（設定自動反映、新規入力切り替え）
14. ✅ 全モーダル画面にバツボタン追加（session/edit, game/new, game/edit）
15. ✅ 対局詳細画面簡素化（セッション配下: 収支+チップ+局データのみ）
16. ✅ 対局編集画面簡素化（セッション配下: 順位+局データ+素点のみ）
17. ✅ セッション設定変更時の配下対局収支再計算
18. ✅ 収支推移チャート軸ラベル（縦軸: ±金額、横軸: 日付・半荘数）
19. ✅ コンペモード（対戦相手の勝率管理、4番目タブ、+勝/+敗/取消、長押し編集/削除）
20. ✅ 相性ベスト3（統計タブ内、5戦以上フィルタ、メダル表示）
21. ✅ AdMob バナー広告統合（ホーム画面下部、プラットフォーム別ファイル分割）
22. ✅ iOSリリース準備（bundleIdentifier、eas.json、EAS Build設定）
