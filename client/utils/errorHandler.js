import { Alert } from 'react-native';

/**
 * Centralized error handling utility for consistent user feedback
 */
class ErrorHandler {
  /**
   * Shows a standardized error alert to the user
   * @param {string} title - The alert title
   * @param {string|Error} error - The error message or Error object
   * @param {object} options - Additional options
   */
  static showError(title, error, options = {}) {
    const {
      logError = true,
      fallbackMessage = 'An unexpected error occurred. Please try again.',
      onDismiss = null
    } = options;

    // Extract user-friendly message
    let message = fallbackMessage;
    
    if (typeof error === 'string') {
      message = error;
    } else if (error?.response?.data?.error) {
      message = error.response.data.error;
    } else if (error?.response?.data?.msg) {
      message = error.response.data.msg;
    } else if (error?.message) {
      message = error.message;
    }

    // Log error for debugging (only in development or when explicitly requested)
    if (logError && __DEV__) {
      console.error(`[${title}]:`, error);
    }

    // Show alert to user
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss
        }
      ]
    );
  }

  /**
   * Shows a standardized confirmation dialog
   * @param {string} title - The alert title
   * @param {string} message - The confirmation message
   * @param {function} onConfirm - Callback when user confirms
   * @param {object} options - Additional options
   */
  static showConfirmation(title, message, onConfirm, options = {}) {
    const {
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmStyle = 'destructive',
      onCancel = null
    } = options;

    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: confirmText,
          style: confirmStyle,
          onPress: onConfirm
        }
      ]
    );
  }

  /**
   * Common error handlers for specific scenarios
   */
  static network(error) {
    this.showError(
      'Network Error',
      error,
      {
        fallbackMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
      }
    );
  }

  static validation(message) {
    this.showError('Invalid Input', message, { logError: false });
  }

  static authentication(error) {
    this.showError(
      'Authentication Failed',
      error,
      {
        fallbackMessage: 'Please check your credentials and try again.'
      }
    );
  }

  static save(itemType, error) {
    this.showError(
      'Save Failed',
      error,
      {
        fallbackMessage: `Could not save the ${itemType}. Please try again.`
      }
    );
  }

  static delete(itemType, error) {
    this.showError(
      'Delete Failed',
      error,
      {
        fallbackMessage: `Could not delete the ${itemType}. Please try again.`
      }
    );
  }

  static load(itemType, error) {
    this.showError(
      'Load Failed',
      error,
      {
        fallbackMessage: `Failed to load ${itemType} data. Please try again.`
      }
    );
  }

  /**
   * Confirmation dialogs for common scenarios
   */
  static confirmDelete(itemType, itemName, onConfirm) {
    const message = itemName 
      ? `Are you sure you want to permanently delete "${itemName}"?`
      : `Are you sure you want to permanently delete this ${itemType}?`;

    this.showConfirmation(
      `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
      message,
      onConfirm,
      {
        confirmText: 'Delete',
        confirmStyle: 'destructive'
      }
    );
  }
}

export default ErrorHandler;