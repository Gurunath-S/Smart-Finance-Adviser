import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/spacing';
import { shadows } from '../../theme/theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  icon = 'add',
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, shadows.hero, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Add transaction"
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={30} color={colors.textInverse} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
