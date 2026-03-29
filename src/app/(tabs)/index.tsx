import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStats } from '@/hooks/useStats';
import { SummaryCard } from '@/components/home/SummaryCard';
import { StatsOverview } from '@/components/home/StatsOverview';
import { BannerAdView } from '@/components/ads/BannerAdView';

export default function HomeScreen() {
  const { stats, reload } = useStats();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SummaryCard
        avgIncome={stats.avgIncome}
        totalIncome={stats.totalIncome}
        totalGames={stats.totalGames}
      />
      <StatsOverview stats={stats} />
      {stats.totalGames === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            対局データがありません{'\n'}「対局一覧」タブから入力を始めましょう
          </Text>
        </View>
      )}
      {/* バナー広告: コンテンツの最下部に配置 */}
      <BannerAdView />
    </ScrollView>
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
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
