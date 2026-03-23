import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '../theme';

export const GlassCard: React.FC<{ style?: ViewStyle; children: React.ReactNode }> = ({ style, children }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surfaceCard + 'CC',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 14,
  },
});