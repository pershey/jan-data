import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RATE_PRESETS, UMA_PRESETS } from '@/constants/mahjong';
import { useSessionRepository } from '@/repositories/session-repository';
import { useGameRepository } from '@/repositories/game-repository';
import { calculateIncome } from '@/utils/calculate';

export default function EditSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionRepo = useSessionRepository();
  const gameRepo = useGameRepository();

  // セッション設定
  const [name, setName] = useState('');
  const [rate, setRate] = useState(100);
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRateText, setCustomRateText] = useState('');
  const [gameFeeText, setGameFeeText] = useState('0');
  const [chipPriceText, setChipPriceText] = useState('0');
  const [umaIndex, setUmaIndex] = useState(0);
  const [okaText, setOkaText] = useState('0');
  const [topPrizeText, setTopPrizeText] = useState('0');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const sessionId = parseInt(id!, 10);
      if (isNaN(sessionId)) return;
      const s = await sessionRepo.getById(sessionId);
      if (!s) return;

      setName(s.name ?? '');
      setRate(s.rate);
      setGameFeeText(String(s.gameFee));
      setChipPriceText(String(s.chipPrice));
      setOkaText(String(s.oka));
      setTopPrizeText(String(s.topPrize));

      // レートプリセット判定
      const matchingPreset = RATE_PRESETS.find(p => p.value === s.rate);
      if (!matchingPreset) {
        setIsCustomRate(true);
        setCustomRateText(String(s.rate));
      }

      // ウマプリセット判定
      const umaMatch = UMA_PRESETS.findIndex(
        p => p.big === s.umaBig && p.small === s.umaSmall
      );
      setUmaIndex(umaMatch >= 0 ? umaMatch : 0);

      setLoaded(true);
    }
    load();
  }, [id]);

  const gameFee = parseInt(gameFeeText, 10) || 0;
  const chipPrice = parseInt(chipPriceText, 10) || 0;
  const oka = parseInt(okaText, 10) || 0;
  const topPrize = parseInt(topPrizeText, 10) || 0;
  const uma = UMA_PRESETS[umaIndex];

  async function save() {
    const sessionId = parseInt(id!, 10);
    if (isNaN(sessionId)) return;

    try {
      // セッション設定を更新
      await sessionRepo.update(sessionId, {
        name: name.trim() || undefined,
        rate,
        gameFee,
        chipPrice,
        umaBig: uma.big,
        umaSmall: uma.small,
        oka,
        topPrize,
      });

      // 配下の全対局の収支を新しいセッション設定で再計算
      const games = await gameRepo.getBySessionId(sessionId);
      for (const game of games) {
        const newIncome = calculateIncome({
          rawScore: game.rawScore,
          rate,
          rank: game.rank,
          gameFee,
          chipCount: game.chipCount,
          chipPrice,
          umaBig: uma.big,
          umaSmall: uma.small,
          oka,
          topPrize,
        });
        await gameRepo.update(game.id, {
          playedAt: game.playedAt,
          rate,
          rank: game.rank,
          rawScore: game.rawScore,
          gameFee,
          income: newIncome,
          chipCount: game.chipCount,
          chipPrice,
          umaBig: uma.big,
          umaSmall: uma.small,
          oka,
          topPrize,
          sessionId,
        });
      }

      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  }

  if (!loaded) {
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
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: Colors.textSecondary }}>読み込み中...</Text>
        </View>
      </>
    );
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
        {/* セッション名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>セッション情報</Text>
          <Text style={styles.label}>セッション名（任意）</Text>
          <TextInput
            style={styles.input}
            placeholder="例: 渋谷の雀荘"
            placeholderTextColor={Colors.textLight}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* レート・場代 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>レート・場代</Text>

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
            />
          )}

          <Text style={styles.label}>場代（円）</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="例: 500"
            placeholderTextColor={Colors.textLight}
            value={gameFeeText}
            onChangeText={setGameFeeText}
          />

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

        {/* ウマオカ */}
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

        {/* チップ */}
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
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
