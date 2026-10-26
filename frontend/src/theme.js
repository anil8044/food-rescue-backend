import { createTheme } from '@mui/material/styles';

// Light theme: warm cream background, green brand colour, soft tints for sections.
export const COLORS = {
  background: '#fbf8f3',
  card: '#ffffff',
  surface1: '#f4efe6',
  surface2: '#e8f4ec',
  foreground: '#1f2a24',
  primary: '#2b8a57',
  primaryDark: '#1d6a41',
  muted: '#5b6860',
  label: '#6b7770',
  accent: '#d9692a',
  border: 'rgba(31,42,36,0.12)',
  // section tints used on the home page
  mint: '#e6f3ea',
  peach: '#fdebdc',
  sky: '#e4eefa',
  butter: '#fbf1cf',
};

const SERIF = "'DM Serif Display', serif";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.primary, dark: COLORS.primaryDark, contrastText: '#ffffff' },
    secondary: { main: COLORS.accent },
    success: { main: COLORS.primary },
    warning: { main: COLORS.accent },
    info: { main: '#2f6fb5' },
    error: { main: '#c93c3c' },
    background: { default: COLORS.background, paper: COLORS.card },
    text: { primary: COLORS.foreground, secondary: COLORS.muted },
    divider: COLORS.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontFamily: SERIF, fontWeight: 400 },
    h4: { fontFamily: SERIF, fontWeight: 400 },
    h5: { fontFamily: SERIF, fontWeight: 400 },
    h6: { fontFamily: SERIF, fontWeight: 400, fontSize: '1.25rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: { backgroundColor: COLORS.background },
      },
    },
    MuiPaper: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 1px 3px rgba(31,42,36,0.06)' } } },
    MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 2px 8px rgba(31,42,36,0.06)' } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 999,
          paddingInline: 20,
          transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease',
          '&:hover': { transform: 'translateY(-1px)' },
        },
        sizeLarge: { paddingBlock: 12, fontSize: '1rem' },
        sizeSmall: { paddingInline: 14 },
        containedPrimary: {
          boxShadow: '0 4px 14px rgba(43,138,87,0.30)',
          '&:hover': { boxShadow: '0 6px 18px rgba(43,138,87,0.38)' },
        },
        containedError: { boxShadow: '0 4px 14px rgba(201,60,60,0.25)' },
        outlinedInherit: { borderColor: 'rgba(31,42,36,0.35)', borderWidth: 1.5 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: COLORS.label,
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        },
      },
    },
  },
});

export default theme;
