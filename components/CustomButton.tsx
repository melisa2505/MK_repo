import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ActivityIndicator, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  textColor?: string;
}

export function CustomButton({ title, loading = false, style, textColor, ...otherProps }: CustomButtonProps) {
  const backgroundColor = useThemeColor({}, 'buttonBackground');
  const defaultTextColor = useThemeColor({}, 'buttonText');
  const theme = useColorScheme() ?? 'light';
  
  // Verificar si el estilo incluye un backgroundColor transparente
  const buttonStyle = style as ViewStyle
  const isTransparent = buttonStyle?.backgroundColor === 'transparent';
  
  // Si es transparente, usar el color del texto según el tema actual
  const finalTextColor = isTransparent ? (theme === 'dark' ? 'white' : 'black') : textColor;

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }, style]} 
      disabled={loading} 
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={finalTextColor} />
      ) : (
        <ThemedText style={[styles.text, { color: finalTextColor }]}>
          {title}
          {isTransparent?"holi": "adios"}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});