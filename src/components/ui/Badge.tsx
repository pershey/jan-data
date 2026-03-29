import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const RANK_COLORS = [Colors.rank1, Colors.rank2, Colors.rank3, Colors.rank4];

interface Props {
  rank: number;
}

export function RankBadge({ rank }: Props) {
  const bgColor = RANK_COLORS[rank - 1] ?? Colors.textLight;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{rank}着</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
});
