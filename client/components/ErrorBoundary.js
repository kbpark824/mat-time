import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you could send this to an error reporting service
    if (__DEV__) {
      console.warn('Error details:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
            </Text>
            
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            )}
            
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    padding: 20,
  },
  errorCard: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    ...colors.shadow,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.mutedAccent,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: colors.destructive,
    backgroundColor: colors.tertiaryBackground,
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;