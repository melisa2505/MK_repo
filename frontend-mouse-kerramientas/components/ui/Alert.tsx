import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  visible: boolean;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, visible }) => {
  if (!visible) return null;

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          textColor: '#155724',
          icon: 'check-circle',
          iconColor: '#28a745',
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          textColor: '#721c24',
          icon: 'exclamation-circle',
          iconColor: '#dc3545',
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          textColor: '#856404',
          icon: 'exclamation-triangle',
          iconColor: '#ffc107',
        };
      case 'info':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          textColor: '#0c5460',
          icon: 'info-circle',
          iconColor: '#17a2b8',
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          textColor: '#495057',
          icon: 'info-circle',
          iconColor: '#6c757d',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      }
    ]}>
      <View style={styles.content}>
        <FontAwesome5 
          name={config.icon} 
          size={20} 
          color={config.iconColor} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={16} color={config.textColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});