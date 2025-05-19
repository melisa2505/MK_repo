import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Image } from 'react-native';
import { ThemedText } from './ThemedText';

interface LogoKerementasProps {
  style?: StyleProp<ViewStyle>;
  showText?: boolean;
}

export function LogoKerrementas({ style, showText = true }: LogoKerementasProps) {
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('@/assets/images/icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      {showText && (
        <ThemedText style={styles.text}>Mouse Kerrementas</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: '600',
  },
});