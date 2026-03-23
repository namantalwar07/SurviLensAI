import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  title: string;
  subtitle?: string;
  colors: string[];
  right?: React.ReactNode;
}
export const AppHeader: React.FC<Props> = ({ title, subtitle, colors, right }) => (
  <LinearGradient colors={colors} style={styles.container}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {right}
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 12 },
});