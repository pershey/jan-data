# CURRENT_STATUS.md（自動更新）
## プロジェクト: jan-data（麻雀フリー専用成績管理アプリ）
## 最終更新: 2026-03-31

## 直近のセッション文脈
### 最終セッション (2026-03-31)
- **議題**: iOSリリース完了（AdMob本番ID → EAS Build → App Store提出）
- **実施内容**:
  - AdMob本番ID設定（ads.ts + app.json）
  - EASプロジェクト初期化（eas init → @pershey/jan-data）
  - Git初期化 + GitHub リポジトリ作成（pershey/jan-data、public）
  - iOS開発ビルド成功（シミュレータ向け）
  - iOS本番ビルド成功（App Store向け、v1.0.0 build 3）
  - App Store提出完了（eas submit）
  - eas.json にApple提出情報設定（appleId, ascAppId, appleTeamId）
  - app.json に ITSAppUsesNonExemptEncryption: false 追加
  - プライバシーポリシーページ作成（GitHub Pages公開）
  - サポートページ作成（GitHub Pages公開）
  - App Store Connect 情報入力（説明文、キーワード、著作権、スクリーンショット等）
  - ローカルビルド（npx expo run:ios）でシミュレータ動作確認
  - iPad Pro 13-inch シミュレータにもインストール
- **主要な結論・決定事項**:
  - AdMob iOS App ID: ca-app-pub-7844017135115297~8203010029
  - バナー広告ユニットID: ca-app-pub-7844017135115297/3390403135
  - Apple ID: pershey_1228@icloud.com
  - ASC App ID: 6761330642
  - Apple Team ID: NRJLLKV544
  - bundleIdentifier: com.jandata.app
  - GitHub: https://github.com/pershey/jan-data
  - プライバシーポリシー: https://pershey.github.io/jan-data/privacy-policy.html
  - サポートURL: https://pershey.github.io/jan-data/support.html
- **未解決・次回持ち越し事項**:
  - Apple審査結果待ち
  - アプリアイコン（Geminiで生成 → assets/icon.png 差し替え → 再ビルド提出）
  - ATT（App Tracking Transparency）は今回スコープ外、必要時に別途対応
  - Android版リリース（後日対応予定）

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
23. ✅ EASプロジェクト初期化 + 本番ビルド + App Store提出
24. ✅ プライバシーポリシー + サポートページ（GitHub Pages）
25. ✅ App Store Connect情報入力（説明文・キーワード・著作権・スクリーンショット）
