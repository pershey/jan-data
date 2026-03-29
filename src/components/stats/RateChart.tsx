import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { formatPercent } from '@/utils/format';

interface Props {
  label: string;
  value: number;
  color: string;
}

export function RateChart({ label, value, color }: Props) {
  // バーの最大幅を50%として表示（一般的な麻雀の各種率は0〜50%程度）
  const barWidth = Math.min(value * 2, 1) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{formatPercent(value)}</Text>
      </View>
      <View style={styles.barBg}>
        <View
          style={[styles.bar, { width: `${barWidth}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});
