import { Theme } from './themes';

export const createStyles = (theme: Theme) => ({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Layout styles
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column' as const,
  },

  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  spaceBetween: {
    justifyContent: 'space-between' as const,
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  // Button styles
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },

  // Text styles
  h1: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight as any,
    lineHeight: theme.typography.h1.lineHeight,
    color: theme.colors.text,
  },

  h2: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    lineHeight: theme.typography.h2.lineHeight,
    color: theme.colors.text,
  },

  h3: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    lineHeight: theme.typography.h3.lineHeight,
    color: theme.colors.text,
  },

  body: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.text,
  },

  caption: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as any,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.textSecondary,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
  },

  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },

  // Spacing utilities
  mt: (size: keyof Theme['spacing']) => ({ marginTop: theme.spacing[size] }),
  mb: (size: keyof Theme['spacing']) => ({ marginBottom: theme.spacing[size] }),
  ml: (size: keyof Theme['spacing']) => ({ marginLeft: theme.spacing[size] }),
  mr: (size: keyof Theme['spacing']) => ({ marginRight: theme.spacing[size] }),
  mx: (size: keyof Theme['spacing']) => ({ 
    marginLeft: theme.spacing[size], 
    marginRight: theme.spacing[size] 
  }),
  my: (size: keyof Theme['spacing']) => ({ 
    marginTop: theme.spacing[size], 
    marginBottom: theme.spacing[size] 
  }),
  pt: (size: keyof Theme['spacing']) => ({ paddingTop: theme.spacing[size] }),
  pb: (size: keyof Theme['spacing']) => ({ paddingBottom: theme.spacing[size] }),
  pl: (size: keyof Theme['spacing']) => ({ paddingLeft: theme.spacing[size] }),
  pr: (size: keyof Theme['spacing']) => ({ paddingRight: theme.spacing[size] }),
  px: (size: keyof Theme['spacing']) => ({ 
    paddingLeft: theme.spacing[size], 
    paddingRight: theme.spacing[size] 
  }),
  py: (size: keyof Theme['spacing']) => ({ 
    paddingTop: theme.spacing[size], 
    paddingBottom: theme.spacing[size] 
  }),
});
