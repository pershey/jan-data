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
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RATE_PRESETS, UMA_PRESETS } from '@/constants/mahjong';
import { useSessionRepository } from '@/repositories/session-repository';
import type { Session } from '@/types';

export default function NewSessionScreen() {
  const router = useRouter();
  const sessionRepo = useSessionRepository();

  // 過去の雀荘テンプレート
  const [pastTemplates, setPastTemplates] = useState<Session[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Session | null>(null);

  // セッション設定
  const [name, setName] = useState('');
  const [rate, setRate] = useState(100); // デフォルト: 点10
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRateText, setCustomRateText] = useState('');
  const [gameFeeText, setGameFeeText] = useState('500');
  const [chipPriceText, setChipPriceText] = useState('100');
  const [umaIndex, setUmaIndex] = useState(2); // デフォルト: 10-20
  const [okaText, setOkaText] = useState('5000');
  const [topPrizeText, setTopPrizeText] = useState('0');

  // 過去のセッションを読み込み、名前ありの雀荘をユニークに抽出
  useEffect(() => {
    async function loadTemplates() {
      const all = await sessionRepo.getAll();
      // 名前付きセッションを名前でグルーピング（最新のものを採用）
      const uniqueByName = new Map<string, Session>();
      for (const s of all) {
        if (s.name && !uniqueByName.has(s.name)) {
          uniqueByName.set(s.name, s);
        }
      }
      setPastTemplates(Array.from(uniqueByName.values()));
    }
    loadTemplates();
  }, []);

  const gameFee = parseInt(gameFeeText, 10) || 0;
  const chipPrice = parseInt(chipPriceText, 10) || 0;
  const oka = parseInt(okaText, 10) || 0;
  const topPrize = parseInt(topPrizeText, 10) || 0;
  const uma = UMA_PRESETS[umaIndex];

  // テンプレートから設定を反映
  function applyTemplate(session: Session) {
    setName(session.name || '');
    setRate(session.rate);
    // レートプリセットに該当するか確認
    const isPreset = RATE_PRESETS.some((p) => p.value === session.rate);
    if (!isPreset) {
      setIsCustomRate(true);
      setCustomRateText(String(session.rate));
    } else {
      setIsCustomRate(false);
      setCustomRateText('');
    }
    setGameFeeText(String(session.gameFee));
    setChipPriceText(String(session.chipPrice));
    setOkaText(String(session.oka));
    setTopPrizeText(String(session.topPrize));
    const matchUma = UMA_PRESETS.findIndex(
      (p) => p.big === session.umaBig && p.small === session.umaSmall
    );
    if (matchUma >= 0) setUmaIndex(matchUma);
    setSelectedTemplate(session);
    setShowPicker(false);
  }

  // 新規入力にリセット
  function resetToNew() {
    setName('');
    setRate(100);
    setIsCustomRate(false);
    setCustomRateText('');
    setGameFeeText('500');
    setChipPriceText('100');
    setUmaIndex(2);
    setOkaText('5000');
    setTopPrizeText('0');
    setSelectedTemplate(null);
    setShowPicker(false);
  }

  // レートのラベルを取得
  function getRateLabel(r: number): string {
    const preset = RATE_PRESETS.find((p) => p.value === r);
    return preset ? preset.label : `${r}円`;
  }

  // ウマのラベルを取得
  function getUmaLabel(big: number, small: number): string {
    const preset = UMA_PRESETS.find((p) => p.big === big && p.small === small);
    return preset ? preset.label : `${small}-${big}`;
  }

  async function save() {
    try {
      const sessionId = await sessionRepo.create({
        name: name.trim() || undefined,
        rate,
        gameFee,
        chipPrice,
        umaBig: uma.big,
        umaSmall: uma.small,
        oka,
        topPrize,
        startedAt: new Date().toISOString(),
      });
      router.replace(`/session/${sessionId}`);
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  }

  return (
    <>
      {/* ヘッダーにバツボタンを追加 */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeButton}
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
          {/* === 過去の雀荘から選択 === */}
          {pastTemplates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>雀荘を選択</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPicker(true)}
              >
                <View style={styles.pickerContent}>
                  {selectedTemplate ? (
                    <>
                      <Ionicons name="storefront-outline" size={18} color={Colors.primary} />
                      <Text style={styles.pickerSelectedText} numberOfLines={1}>
                        {selectedTemplate.name}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="search-outline" size={18} color={Colors.textLight} />
                      <Text style={styles.pickerPlaceholder}>
                        過去の雀荘から選択...
                      </Text>
                    </>
                  )}
                </View>
                <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
              </TouchableOpacity>
              {selectedTemplate && (
                <TouchableOpacity
                  style={styles.resetLink}
                  onPress={resetToNew}
                >
                  <Ionicons name="refresh-outline" size={14} color={Colors.primary} />
                  <Text style={styles.resetLinkText}>新規入力に切り替え</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* === セッション名 === */}
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

          {/* === レート設定 === */}
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
                autoFocus
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

          {/* === ウマオカ設定 === */}
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

          {/* === チップ設定 === */}
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

          {/* === 設定サマリー === */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>設定確認</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>レート</Text>
              <Text style={styles.summaryValue}>
                {RATE_PRESETS.find(p => p.value === rate && !isCustomRate)?.label ?? `${rate}円/1000点`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ウマ</Text>
              <Text style={styles.summaryValue}>{uma.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>オカ</Text>
              <Text style={styles.summaryValue}>{oka > 0 ? `${oka.toLocaleString()}点` : 'なし'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>場代</Text>
              <Text style={styles.summaryValue}>¥{gameFee.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>トップ賞</Text>
              <Text style={styles.summaryValue}>{topPrize > 0 ? `¥${topPrize.toLocaleString()}` : 'なし'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>チップ単価</Text>
              <Text style={styles.summaryValue}>{chipPrice > 0 ? `¥${chipPrice}` : 'なし'}</Text>
            </View>
          </View>

          {/* === 保存ボタン === */}
          <TouchableOpacity style={styles.saveButton} onPress={save}>
            <Text style={styles.saveText}>セッション開始</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* === 雀荘選択モーダル === */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>雀荘を選択</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* 新規入力オプション */}
            <TouchableOpacity
              style={[
                styles.modalItem,
                !selectedTemplate && styles.modalItemActive,
              ]}
              onPress={resetToNew}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <View style={styles.modalItemContent}>
                <Text style={styles.modalItemName}>新規入力</Text>
                <Text style={styles.modalItemSub}>設定をデフォルトに戻す</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            {/* 過去の雀荘リスト */}
            <FlatList
              data={pastTemplates}
              keyExtractor={(item) => String(item.id)}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedTemplate?.name === item.name && styles.modalItemActive,
                  ]}
                  onPress={() => applyTemplate(item)}
                >
                  <Ionicons name="storefront-outline" size={20} color={Colors.text} />
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>
                      {getRateLabel(item.rate)} / ウマ{getUmaLabel(item.umaBig, item.umaSmall)}
                      {item.gameFee > 0 ? ` / 場代¥${item.gameFee}` : ''}
                      {item.topPrize > 0 ? ` / トップ賞¥${item.topPrize}` : ''}
                    </Text>
                  </View>
                  {selectedTemplate?.name === item.name && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  closeButton: {
    padding: 4,
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
  // プルダウンセレクター
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surface,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pickerSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  resetLinkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  // レートボタン
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
  // サマリーカード
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
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
  // モーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 16,
  },
  modalList: {
    flexGrow: 0,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  modalItemActive: {
    backgroundColor: '#E8F5E9',
  },
  modalItemContent: {
    flex: 1,
    gap: 2,
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  modalItemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
