import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ROUND_RESULTS, ROUND_RESULT_KEYS, type RoundResult } from '@/constants/mahjong';
import { Colors } from '@/constants/colors';

interface Props {
  selected: RoundResult | null;
  onSelect: (result: RoundResult) => void;
}

export function ResultSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {ROUND_RESULT_KEYS.map((key) => {
        const item = ROUND_RESULTS[key];
        const isSelected = selected === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.button,
              isSelected && { backgroundColor: item.color },
            ]}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.white,
  },
});
