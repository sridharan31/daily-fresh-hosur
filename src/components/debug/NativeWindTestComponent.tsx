import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

/**
 * Simple diagnostic component to test if NativeWind CSS is being applied
 * This component tests basic className styling without complex form logic
 */
export const NativeWindTestComponent: React.FC = () => {
  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Test 1: Simple View with className */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800">Test 1: Basic View</Text>
            <Text className="text-sm text-gray-600">This should have white background</Text>
          </View>

          {/* Test 2: Flexbox Layout */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-green-500 rounded p-3">
              <Text className="text-white font-bold">Green</Text>
            </View>
            <View className="flex-1 bg-blue-500 rounded p-3">
              <Text className="text-white font-bold">Blue</Text>
            </View>
          </View>

          {/* Test 3: Text Styling */}
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">Text Styles Test</Text>
            <Text className="text-base text-gray-700 mb-1">Regular text</Text>
            <Text className="text-sm text-gray-600">Small text</Text>
            <Text className="text-xs text-gray-500">Extra small text</Text>
          </View>

          {/* Test 4: Border and Shadow */}
          <View className="border-2 border-green-500 p-4 rounded-xl mb-4">
            <Text className="text-green-600 font-semibold">Border Test</Text>
            <Text className="text-sm text-gray-600 mt-2">This should have a green border</Text>
          </View>

          {/* Test 5: Color Variations */}
          <View className="mb-4">
            <View className="bg-red-100 p-3 mb-2 rounded">
              <Text className="text-red-800">Red background</Text>
            </View>
            <View className="bg-yellow-100 p-3 mb-2 rounded">
              <Text className="text-yellow-800">Yellow background</Text>
            </View>
            <View className="bg-green-100 p-3 rounded">
              <Text className="text-green-800">Green background</Text>
            </View>
          </View>

          {/* Test 6: Padding and Margin */}
          <View className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <Text className="text-blue-900 font-bold mb-3">Spacing Test</Text>
            <View className="mb-2 pl-4">
              <Text className="text-blue-800">• Item 1</Text>
            </View>
            <View className="mb-2 pl-4">
              <Text className="text-blue-800">• Item 2</Text>
            </View>
            <View className="pl-4">
              <Text className="text-blue-800">• Item 3</Text>
            </View>
          </View>

          {/* Test 7: Complex Layout */}
          <View className="mt-6 bg-gradient-to-b from-purple-100 to-pink-100 p-6 rounded-xl">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Complex Layout</Text>
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-4 h-4 bg-purple-600 rounded-full"></View>
              <Text className="text-gray-700 flex-1">Feature with icon</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-4 h-4 bg-pink-600 rounded-full"></View>
              <Text className="text-gray-700 flex-1">Another feature</Text>
            </View>
          </View>

          {/* Bottom spacing */}
          <View className="h-8"></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default NativeWindTestComponent;
