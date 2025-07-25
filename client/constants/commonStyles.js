import { StyleSheet } from 'react-native';
import colors from './colors';

// Common reusable styles to reduce duplication across components
const commonStyles = StyleSheet.create({
  // Input field styles
  input: {
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.primaryText,
    fontSize: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: colors.shadow.offset,
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },

  inputError: {
    borderWidth: 1,
    borderColor: colors.destructive,
  },

  // Label styles
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: colors.primaryText,
  },

  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },

  paddedContainer: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
    padding: 16,
    justifyContent: 'center',
  },

  // Card-like containers
  card: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...colors.shadow,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: colors.tertiaryBackground,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },

  destructiveButton: {
    backgroundColor: colors.destructive,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  destructiveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Text styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 24,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 12,
  },

  bodyText: {
    fontSize: 16,
    color: colors.primaryText,
    lineHeight: 22,
  },

  mutedText: {
    fontSize: 14,
    color: colors.mutedAccent,
  },

  // Form group styles
  formGroup: {
    marginBottom: 16,
  },

  // Centered content
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Section headers
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: 24,
    marginBottom: 12,
  },
});

export default commonStyles;