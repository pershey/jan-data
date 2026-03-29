import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RATE_PRESETS } from '@/constants/mahjong';
import { formatDate, formatIncome } from '@/utils/format';
import type { Session } from '@/types';

interface Props {
  session: Session;
  gameCount: number;
  totalIncome: number;
  onPress: () => void;
}

export function SessionListItem({ session, gameCount, totalIncome, onPress }: Props) {
  const incomeColor = totalIncome >= 0 ? Colors.positive : Colors.negative;
  const rateLabel = RATE_PRESETS.find(p => p.value === session.rate)?.label ?? `${session.rate}円`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <Text style={styles.name} numberOfLines={1}>
            {session.name || 'セッション'}
          </Text>
          <Text style={styles.date}>{formatDate(session.startedAt)}</Text>
        </View>
        <Text style={[styles.income, { color: incomeColor }]}>
          ¥{formatIncome(totalIncome)}
        </Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>{rateLabel}</Text>
        <Text style={styles.meta}>{gameCount}半荘</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  income: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
});
