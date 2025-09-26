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

// Brand A Theme (Emerald Green)
export const brandATheme: Theme = {
  colors: {
    primary: '#10B981', // Emerald Green
    secondary: '#059669', // Teal Green
    accent: '#34D399', // Light Green
    background: '#F0FDF4', // Very light green
    surface: '#ECFDF5', // Light green
    text: '#14532D', // Dark green
    textSecondary: '#166534', // Medium green
    border: '#BBF7D0', // Light green border
    success: '#22C55E', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#16A34A', // Forest Green
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

// Brand B Theme (Deep Forest Green)
export const brandBTheme: Theme = {
  colors: {
    primary: '#16A34A', // Forest Green
    secondary: '#15803D', // Dark Forest Green
    accent: '#22C55E', // Bright Green
    background: '#F7FEF8', // Very light green
    surface: '#F0FDF4', // Light green
    text: '#0F2419', // Very dark green
    textSecondary: '#14532D', // Dark green
    border: '#A7F3D0', // Light green border
    success: '#22C55E', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#059669', // Teal Green
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
