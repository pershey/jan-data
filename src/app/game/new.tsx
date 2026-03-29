import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RATE_PRESETS, UMA_PRESETS } from '@/constants/mahjong';
import type { RoundResult } from '@/constants/mahjong';
import type { RoundInput, Session } from '@/types';
import { calculateIncome } from '@/utils/calculate';
import { formatIncome } from '@/utils/format';
import { useGameRepository } from '@/repositories/game-repository';
import { useRoundRepository } from '@/repositories/round-repository';
import { useSessionRepository } from '@/repositories/session-repository';
import { ResultSelector } from '@/components/game/ResultSelector';
import { ROUND_RESULTS } from '@/constants/mahjong';

export default function NewGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const gameRepo = useGameRepository();
  const roundRepo = useRoundRepository();
  const sessionRepo = useSessionRepository();

  // セッション情報（セッション経由の場合）
  const [session, setSession] = useState<Session | null>(null);
  const hasSession = session !== null;

  // 半荘情報（セッションが無い場合のみ使用）
  const [rate, setRate] = useState(100);
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRateText, setCustomRateText] = useState('');
  const [gameFeeText, setGameFeeText] = useState('500');
  const [chipPriceText, setChipPriceText] = useState('100');
  const [umaIndex, setUmaIndex] = useState(2);
  const [okaText, setOkaText] = useState('5000');
  const [topPrizeText, setTopPrizeText] = useState('0');

  // 半荘固有の入力
  const [rank, setRank] = useState<number | null>(null);
  const [rawScoreText, setRawScoreText] = useState('');

  // 局データリスト
  const [rounds, setRounds] = useState<RoundInput[]>([]);

  // 局入力フォーム
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [roundRiichi, setRoundRiichi] = useState(false);
  const [roundHasCall, setRoundHasCall] = useState(false);
  const [roundCallCount, setRoundCallCount] = useState('1');
  const [roundChipDelta, setRoundChipDelta] = useState('0');

  // セッション読み込み
  useEffect(() => {
    async function loadSession() {
      if (params.sessionId) {
        const sessionId = parseInt(params.sessionId, 10);
        if (!isNaN(sessionId)) {
          const s = await sessionRepo.getById(sessionId);
          if (s) {
            setSession(s);
            // セッション設定を自動適用
            setRate(s.rate);
            setGameFeeText(String(s.gameFee));
            setChipPriceText(String(s.chipPrice));
            setOkaText(String(s.oka));
            setTopPrizeText(String(s.topPrize));
            const matchUma = UMA_PRESETS.findIndex(
              p => p.big === s.umaBig && p.small === s.umaSmall
            );
            if (matchUma >= 0) setUmaIndex(matchUma);
          }
        }
      }
    }
    loadSession();
  }, [params.sessionId]);

  // 実効値の取得
  const effectiveRate = hasSession ? session.rate : rate;
  const effectiveGameFee = hasSession ? session.gameFee : parseInt(gameFeeText, 10) || 0;
  const effectiveChipPrice = hasSession ? session.chipPrice : parseInt(chipPriceText, 10) || 0;
  const effectiveOka = hasSession ? session.oka : parseInt(okaText, 10) || 0;
  const effectiveTopPrize = hasSession ? session.topPrize : parseInt(topPrizeText, 10) || 0;
  const effectiveUma = hasSession
    ? { big: session.umaBig, small: session.umaSmall }
    : { big: UMA_PRESETS[umaIndex].big, small: UMA_PRESETS[umaIndex].small };

  const rawScore = parseInt(rawScoreText, 10) || 0;

  // チップ合計を局データから算出
  const totalChipDelta = rounds.reduce((sum, r) => sum + r.chipDelta, 0);

  const income =
    rawScore > 0 && rank !== null
      ? calculateIncome({
          rawScore,
          rate: effectiveRate,
          rank,
          gameFee: effectiveGameFee,
          chipCount: totalChipDelta,
          chipPrice: effectiveChipPrice,
          umaBig: effectiveUma.big,
          umaSmall: effectiveUma.small,
          oka: effectiveOka,
          topPrize: effectiveTopPrize,
        })
      : 0;
  const incomeColor = income >= 0 ? Colors.positive : Colors.negative;

  // フォームリセット
  function resetRoundForm() {
    setRoundResult(null);
    setRoundRiichi(false);
    setRoundHasCall(false);
    setRoundCallCount('1');
    setRoundChipDelta('0');
    setEditingRoundIndex(null);
    setShowRoundForm(false);
  }

  // 局を編集（フォームにデータを読み込み）
  function editRound(index: number) {
    const r = rounds[index];
    setRoundResult(r.result);
    setRoundRiichi(r.riichi);
    setRoundHasCall(r.hasCall);
    setRoundCallCount(String(r.callCount || 1));
    setRoundChipDelta(String(r.chipDelta));
    setEditingRoundIndex(index);
    setShowRoundForm(true);
  }

  // 局を追加 or 更新
  function saveRound() {
    if (!roundResult) {
      Alert.alert('エラー', '結果を選択してください');
      return;
    }
    const roundData: RoundInput = {
      roundNumber: editingRoundIndex !== null ? rounds[editingRoundIndex].roundNumber : rounds.length + 1,
      result: roundResult,
      riichi: roundRiichi,
      hasCall: roundHasCall,
      callCount: roundHasCall ? parseInt(roundCallCount, 10) || 1 : 0,
      chipDelta: parseInt(roundChipDelta, 10) || 0,
    };

    if (editingRoundIndex !== null) {
      // 更新
      const updated = [...rounds];
      updated[editingRoundIndex] = roundData;
      setRounds(updated);
    } else {
      // 新規追加
      setRounds([...rounds, roundData]);
    }
    resetRoundForm();
  }

  // 局を削除
  function removeRound(index: number) {
    const updated = rounds.filter((_, i) => i !== index);
    setRounds(updated.map((r, i) => ({ ...r, roundNumber: i + 1 })));
    // 編集中の局が削除された場合はフォームを閉じる
    if (editingRoundIndex === index) {
      resetRoundForm();
    } else if (editingRoundIndex !== null && editingRoundIndex > index) {
      setEditingRoundIndex(editingRoundIndex - 1);
    }
  }

  // 保存
  async function save() {
    if (rank === null) {
      Alert.alert('エラー', '順位を選択してください');
      return;
    }
    if (rawScore <= 0) {
      Alert.alert('エラー', '素点を入力してください');
      return;
    }

    try {
      const gameId = await gameRepo.create({
        playedAt: new Date().toISOString(),
        rate: effectiveRate,
        rank,
        rawScore,
        gameFee: effectiveGameFee,
        income,
        chipCount: totalChipDelta,
        chipPrice: effectiveChipPrice,
        umaBig: effectiveUma.big,
        umaSmall: effectiveUma.small,
        oka: effectiveOka,
        topPrize: effectiveTopPrize,
        sessionId: session?.id ?? null,
      });

      if (rounds.length > 0) {
        await roundRepo.createMany(gameId, rounds);
      }

      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
        {/* セッション経由の場合: 設定サマリー表示 */}
        {hasSession && (
          <View style={styles.sessionBanner}>
            <Text style={styles.sessionBannerTitle}>
              {session.name || 'セッション'}
            </Text>
            <View style={styles.sessionBannerSettings}>
              <Text style={styles.sessionBannerText}>
                {RATE_PRESETS.find(p => p.value === session.rate)?.label ?? `${session.rate}円`}
                {' / '}
                場代¥{session.gameFee}
                {session.topPrize > 0 ? ` / トップ賞¥${session.topPrize}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* === 半荘情報（セッションが無い場合のみ） === */}
        {!hasSession && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>半荘情報</Text>

              {/* レート */}
              <Text style={styles.label}>レート</Text>
              <View style={styles.rateRow}>
                {RATE_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.rateButton,
                      !isCustomRate && rate === preset.value && styles.rateButtonActive,
                    ]}
                    onPress={() => {
                      setRate(preset.value);
                      setIsCustomRate(false);
                      setCustomRateText('');
                    }}
                  >
                    <Text
                      style={[
                        styles.rateText,
                        !isCustomRate && rate === preset.value && styles.rateTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.rateButton,
                    isCustomRate && styles.rateButtonActive,
                  ]}
                  onPress={() => setIsCustomRate(true)}
                >
                  <Text
                    style={[
                      styles.rateText,
                      isCustomRate && styles.rateTextActive,
                    ]}
                  >
                    カスタム
                  </Text>
                </TouchableOpacity>
              </View>
              {isCustomRate && (
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="1000点あたりの円（例: 200）"
                  placeholderTextColor={Colors.textLight}
                  value={customRateText}
                  onChangeText={(text) => {
                    setCustomRateText(text);
                    const v = parseInt(text, 10);
                    if (v > 0) setRate(v);
                  }}
                  autoFocus
                />
              )}

              {/* 場代 */}
              <Text style={styles.label}>場代（円）</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="例: 500"
                placeholderTextColor={Colors.textLight}
                value={gameFeeText}
                onChangeText={setGameFeeText}
              />

              {/* トップ賞 */}
              <Text style={styles.label}>トップ賞（円）</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="例: 500"
                placeholderTextColor={Colors.textLight}
                value={topPrizeText}
                onChangeText={setTopPrizeText}
              />
              <Text style={styles.hintText}>
                ※ 1位がお店に支払う追加料金
              </Text>
            </View>

            {/* ウマオカ設定 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ウマ・オカ</Text>

              <Text style={styles.label}>ウマ</Text>
              <View style={styles.rateRow}>
                {UMA_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.rateButton,
                      umaIndex === index && styles.rateButtonActive,
                    ]}
                    onPress={() => setUmaIndex(index)}
                  >
                    <Text
                      style={[
                        styles.rateText,
                        umaIndex === index && styles.rateTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>オカ（原点との差 × 1人分）</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="例: 5000"
                placeholderTextColor={Colors.textLight}
                value={okaText}
                onChangeText={setOkaText}
              />
              <Text style={styles.hintText}>
                ※ 配給原点25000 / 原点30000 → 差5000
              </Text>
            </View>

            {/* チップ設定 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>チップ設定</Text>
              <Text style={styles.label}>チップ1枚の単価（円）</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="例: 100"
                placeholderTextColor={Colors.textLight}
                value={chipPriceText}
                onChangeText={setChipPriceText}
              />
            </View>
          </>
        )}

        {/* === 順位 === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>順位</Text>
          <View style={styles.rankRow}>
            {[1, 2, 3, 4].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.rankButton,
                  rank === r && styles.rankButtonActive,
                ]}
                onPress={() => setRank(r)}
              >
                <Text
                  style={[
                    styles.rankText,
                    rank === r && styles.rankTextActive,
                  ]}
                >
                  {r}着
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === 局データ === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>局データ（任意）</Text>

          {/* 追加済み局一覧（タップで編集） */}
          {rounds.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.roundItem,
                editingRoundIndex === i && styles.roundItemEditing,
              ]}
              onPress={() => editRound(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.roundNumber}>{r.roundNumber}局</Text>
              <View
                style={[
                  styles.roundResultBadge,
                  { backgroundColor: ROUND_RESULTS[r.result].color },
                ]}
              >
                <Text style={styles.roundResultText}>
                  {ROUND_RESULTS[r.result].label}
                </Text>
              </View>
              {r.riichi && <Text style={styles.roundTag}>リーチ</Text>}
              {r.hasCall && (
                <Text style={styles.roundTag}>鳴き{r.callCount}回</Text>
              )}
              {r.chipDelta !== 0 && (
                <Text
                  style={[
                    styles.roundTag,
                    { color: r.chipDelta > 0 ? Colors.positive : Colors.negative },
                  ]}
                >
                  チップ{r.chipDelta > 0 ? '+' : ''}{r.chipDelta}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => removeRound(i)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* 局入力フォーム */}
          {showRoundForm ? (
            <View style={styles.roundForm}>
              <Text style={styles.label}>結果</Text>
              <ResultSelector
                selected={roundResult}
                onSelect={setRoundResult}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>リーチ</Text>
                <Switch
                  value={roundRiichi}
                  onValueChange={setRoundRiichi}
                  trackColor={{ true: Colors.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>鳴き</Text>
                <Switch
                  value={roundHasCall}
                  onValueChange={setRoundHasCall}
                  trackColor={{ true: Colors.primary }}
                />
              </View>

              {roundHasCall && (
                <View style={styles.callCountRow}>
                  <Text style={styles.label}>鳴き回数</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    keyboardType="number-pad"
                    value={roundCallCount}
                    onChangeText={setRoundCallCount}
                  />
                </View>
              )}

              {/* チップ増減 */}
              <View style={styles.chipDeltaRow}>
                <Text style={styles.label}>チップ増減</Text>
                <View style={styles.chipDeltaControls}>
                  <TouchableOpacity
                    style={styles.chipDeltaButton}
                    onPress={() => {
                      const v = parseInt(roundChipDelta, 10) || 0;
                      setRoundChipDelta(String(v - 1));
                    }}
                  >
                    <Text style={styles.chipDeltaButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.chipDeltaInput]}
                    keyboardType="number-pad"
                    value={roundChipDelta}
                    onChangeText={setRoundChipDelta}
                  />
                  <TouchableOpacity
                    style={styles.chipDeltaButton}
                    onPress={() => {
                      const v = parseInt(roundChipDelta, 10) || 0;
                      setRoundChipDelta(String(v + 1));
                    }}
                  >
                    <Text style={styles.chipDeltaButtonText}>＋</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roundFormButtons}>
                <TouchableOpacity
                  style={styles.roundCancelButton}
                  onPress={resetRoundForm}
                >
                  <Text style={styles.roundCancelText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roundAddButton}
                  onPress={saveRound}
                >
                  <Text style={styles.roundAddText}>
                    {editingRoundIndex !== null ? '更新' : '追加'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addRoundButton}
              onPress={() => {
                setEditingRoundIndex(null);
                setShowRoundForm(true);
              }}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addRoundText}>局を追加</Text>
            </TouchableOpacity>
          )}

          {/* チップ合計サマリー */}
          {totalChipDelta !== 0 && (
            <View style={styles.chipSummary}>
              <Text style={styles.chipSummaryLabel}>チップ合計</Text>
              <Text
                style={[
                  styles.chipSummaryValue,
                  { color: totalChipDelta >= 0 ? Colors.positive : Colors.negative },
                ]}
              >
                {totalChipDelta >= 0 ? '+' : ''}
                {totalChipDelta}枚（¥{formatIncome(totalChipDelta * effectiveChipPrice)}）
              </Text>
            </View>
          )}
        </View>

        {/* === 素点（局データの後） === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>素点</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="例: 35200"
            placeholderTextColor={Colors.textLight}
            value={rawScoreText}
            onChangeText={setRawScoreText}
          />
        </View>

        {/* === 収支プレビュー === */}
        {rawScore > 0 && rank !== null && (
          <View style={styles.incomePreview}>
            <Text style={styles.incomeLabel}>収支</Text>
            <Text style={[styles.incomeValue, { color: incomeColor }]}>
              ¥{formatIncome(income)}
            </Text>
          </View>
        )}

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sessionBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  sessionBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  sessionBannerSettings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sessionBannerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: -4,
  },
  rateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rateButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rateTextActive: {
    color: Colors.white,
  },
  rankRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rankButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rankButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  rankTextActive: {
    color: Colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  smallInput: {
    width: 60,
    textAlign: 'center',
  },
  incomePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  incomeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  incomeValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  chipSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
  },
  chipSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  // 局データ
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
  },
  roundItemEditing: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  roundNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 36,
  },
  roundResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roundResultText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  roundTag: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roundForm: {
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  callCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chipDeltaRow: {
    gap: 8,
  },
  chipDeltaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipDeltaButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDeltaButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  chipDeltaInput: {
    width: 60,
    textAlign: 'center',
  },
  roundFormButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  roundCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  roundCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roundAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  roundAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  addRoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addRoundText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
