// mobile/src/components/FilterChips.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface FilterChipsProps {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}

export function FilterChips({ items, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row} style={{ marginBottom: 12 }}
    >
      {items.map(item => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, selected === item && styles.active]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.label, selected === item && styles.activeLabel]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:         { paddingHorizontal: 16, gap: 8 },
  chip:        { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 100, backgroundColor: COLORS.dark3, borderWidth: 0.5, borderColor: COLORS.border },
  active:      { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  label:       { color: COLORS.muted, fontSize: 13 },
  activeLabel: { color: COLORS.dark, fontWeight: '600' },
});
