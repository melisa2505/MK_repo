/**
 * Paleta de colores de Mouse Kerrementas
 */

const primaryRed = '#FF3B30';
const primaryBlack = '#202124';
const white = '#FFFFFF';
const lightGray = '#F5F5F7';
const successGreen = '#34C759';

export const Colors = {
  light: {
    text: primaryBlack,
    background: white,
    tint: primaryRed,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryRed,
    inputBackground: lightGray,
    buttonBackground: primaryRed,
    buttonText: white,
    success: successGreen,
  },
  dark: {
    text: white,
    background: primaryBlack,
    tint: primaryRed,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryRed,
    inputBackground: '#303133',
    buttonBackground: primaryRed,
    buttonText: white,
    success: successGreen,
  },
};
