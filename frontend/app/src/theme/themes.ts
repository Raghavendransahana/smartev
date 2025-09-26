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
    primary: '#1E40AF',
    secondary: '#059669',
    accent: '#7C3AED',
    background: '#FFFFFF',
    surface: 'rgba(255,255,255,0.95)',
    text: '#1F2937',
    textSecondary: 'rgba(75,85,99,0.8)',
    border: 'rgba(209,213,219,0.8)',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#1E40AF',
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
    primary: '#7C3AED',
    secondary: '#1E40AF',
    accent: '#EA580C',
    background: '#F9FAFB',
    surface: 'rgba(249,250,251,0.95)',
    text: '#111827',
    textSecondary: 'rgba(55,65,81,0.8)',
    border: 'rgba(209,213,219,0.7)',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
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
