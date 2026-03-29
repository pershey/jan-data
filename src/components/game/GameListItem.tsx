import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { RankBadge } from '@/components/ui/Badge';
import { formatDate, formatIncome, formatScore } from '@/utils/format';
import type { Game } from '@/types';

interface Props {
  game: Game;
  onPress: () => void;
}

export function GameListItem({ game, onPress }: Props) {
  const incomeColor = game.income >= 0 ? Colors.positive : Colors.negative;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.date}>{formatDate(game.playedAt)}</Text>
      <RankBadge rank={game.rank} />
      <Text style={styles.score}>{formatScore(game.rawScore)}</Text>
      <Text style={[styles.income, { color: incomeColor }]}>
        ¥{formatIncome(game.income)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    width: 40,
  },
  score: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  income: {
    fontSize: 16,
    fontWeight: '700',
  },
});
