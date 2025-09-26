export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const brandATheme: Theme = {
  colors: {
    primary: '#38BDF8',
    secondary: '#22C55E',
    accent: '#8B5CF6',
    background: '#030712',
    surface: 'rgba(15,23,42,0.85)',
    text: '#E2E8F0',
    textSecondary: 'rgba(148,163,184,0.75)',
    border: 'rgba(51,65,85,0.45)',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const brandBTheme: Theme = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#38BDF8',
    accent: '#F97316',
    background: '#030712',
    surface: 'rgba(30,41,59,0.85)',
    text: '#F8FAFC',
    textSecondary: 'rgba(148,163,184,0.7)',
    border: 'rgba(71,85,105,0.45)',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#7C3AED',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const themes = {
  brandA: brandATheme,
  brandB: brandBTheme,
};

export type ThemeName = keyof typeof themes;
