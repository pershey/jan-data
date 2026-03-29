import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { formatIncome } from '@/utils/format';
import type { Game } from '@/types';

interface Props {
  games: Game[];
}

// 軸ラベル用に値を見やすい単位に丸める
function formatAxisValue(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 10000) {
    return `${val < 0 ? '-' : '+'}${(abs / 10000).toFixed(abs % 10000 === 0 ? 0 : 1)}万`;
  }
  return `${val < 0 ? '-' : val > 0 ? '+' : ''}¥${abs.toLocaleString()}`;
}

export function IncomeChart({ games }: Props) {
  if (games.length === 0) return null;

  // 日付順にソートして累積収支を計算
  const sorted = [...games].sort(
    (a, b) => a.playedAt.localeCompare(b.playedAt)
  );
  const points: number[] = [];
  let cumulative = 0;
  for (const game of sorted) {
    cumulative += game.income;
    points.push(cumulative);
  }

  const maxVal = Math.max(...points.map(Math.abs), 1);
  const chartHeight = 120;

  // 横軸ラベル用の日付（最初と最後）
  const firstDate = sorted[0].playedAt.slice(5, 10).replace('-', '/');
  const lastDate = sorted[sorted.length - 1].playedAt.slice(5, 10).replace('-', '/');

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {/* 縦軸ラベル */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{formatAxisValue(maxVal)}</Text>
          <Text style={styles.yLabel}>¥0</Text>
          <Text style={styles.yLabel}>{formatAxisValue(-maxVal)}</Text>
        </View>

        {/* グラフ本体 */}
        <View style={styles.chartWrapper}>
          <View style={[styles.chart, { height: chartHeight }]}>
            {/* ゼロライン */}
            <View
              style={[
                styles.zeroLine,
                { top: chartHeight / 2 },
              ]}
            />
            {points.map((val, i) => {
              const x = (i / Math.max(points.length - 1, 1)) * 100;
              // 上がプラス、下がマイナス
              const y = chartHeight / 2 - (val / maxVal) * (chartHeight / 2 - 4);
              const dotColor = val >= 0 ? Colors.positive : Colors.negative;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      left: `${x}%`,
                      top: y,
                      backgroundColor: dotColor,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* 横軸ラベル */}
          <View style={styles.xAxis}>
            <Text style={styles.xLabel}>{firstDate}</Text>
            <Text style={styles.xLabel}>
              {points.length}半荘
            </Text>
            {points.length > 1 && (
              <Text style={styles.xLabel}>{lastDate}</Text>
            )}
          </View>
        </View>
      </View>

      {/* 最終収支 */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>
          最終: ¥{formatIncome(cumulative)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chartArea: {
    flexDirection: 'row',
    gap: 4,
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 0,
    width: 52,
  },
  yLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontVariant: ['tabular-nums'],
  },
  chartWrapper: {
    flex: 1,
    gap: 4,
  },
  chart: {
    position: 'relative',
    overflow: 'hidden',
  },
  zeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  labels: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
