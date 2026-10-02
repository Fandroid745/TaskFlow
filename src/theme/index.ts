import { Platform } from 'react-native';

export const colors = {
  ink: '#17202A',
  muted: '#73808C',
  paper: '#F7F8F4',
  white: '#FFFFFF',
  line: '#E3E8E5',
  green: '#2E7D5B',
  greenSoft: '#E1F1E8',
  yellow: '#F3B562',
  yellowSoft: '#FFF0D7',
  red: '#D75A5A',
  redSoft: '#FBE5E3',
  blue: '#5B7FA3',
};

export function getThemeColors(isDark: boolean) {
  return isDark ? {
    ...colors,
    ink: '#F2F5F2',
    muted: '#A4B1AA',
    paper: '#121815',
    white: '#1D2721',
    line: '#334239',
    greenSoft: '#214B38',
    yellowSoft: '#59431F',
    redSoft: '#552B2B',
  } : colors;
}

export const fonts = {
  display: Platform.select({ ios: 'Avenir Next', android: 'sans-serif' }) ?? 'sans-serif',
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif' }) ?? 'sans-serif',
};
