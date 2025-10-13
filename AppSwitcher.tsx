import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import both versions
import MainApp from './App';
import TestApp from './TestApp';

const AppSwitcher: React.FC = () => {
  const [mode, setMode] = React.useState<'main' | 'test'>('test'); // Start with test mode

  if (mode === 'main') {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.switcherBar}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setMode('test')}
          >
            <Text style={styles.switchButtonText}>🧪 Switch to Test Mode</Text>
          </TouchableOpacity>
        </View>
        <MainApp />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.switcherBar}>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setMode('main')}
        >
          <Text style={styles.switchButtonText}>🏠 Switch to Main App</Text>
        </TouchableOpacity>
      </View>
      <TestApp />
    </View>
  );
};

const styles = StyleSheet.create({
  switcherBar: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  switchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AppSwitcher;