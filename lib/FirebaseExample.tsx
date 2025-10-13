// Example: How to use Firebase in your Grocery Delivery App

import { useEffect, useState } from 'react';
import { Alert, Button, Platform, Text, View } from 'react-native';
import FirebaseService from './services/FirebaseService';

// Example component showing Firebase integration
const FirebaseExampleScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = FirebaseService.getCurrentUser();
    setUser(currentUser);

    // Log screen view to analytics
    FirebaseService.logEvent('screen_view', {
      screen_name: 'FirebaseExample',
      screen_class: 'FirebaseExampleScreen'
    });
  }, []);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const testUser = await FirebaseService.signUpWithEmail(
        'test@example.com',
        'password123'
      );
      setUser(testUser);
      Alert.alert('Success', 'User created successfully!');

      // Log sign up event
      FirebaseService.logEvent('sign_up', {
        method: 'email'
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const loggedInUser = await FirebaseService.signInWithEmail(
        'test@example.com',
        'password123'
      );
      setUser(loggedInUser);
      Alert.alert('Success', 'Logged in successfully!');

      // Log login event
      FirebaseService.logEvent('login', {
        method: 'email'
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await FirebaseService.signOut();
      setUser(null);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddTestData = async () => {
    try {
      const docId = await FirebaseService.addDocument('test_collection', {
        name: 'Test Item',
        description: 'This is a test document',
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      });
      Alert.alert('Success', `Document added with ID: ${docId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGetData = async () => {
    try {
      const documents = await FirebaseService.getDocuments('test_collection');
      Alert.alert('Success', `Found ${documents.length} documents`);
      console.log('Documents:', documents);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Firebase Integration Test
      </Text>

      {user ? (
        <View>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Logged in as: {user.email}
          </Text>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            disabled={loading}
          />
        </View>
      ) : (
        <View>
          <Button
            title="Sign Up (Test)"
            onPress={handleSignUp}
            disabled={loading}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Sign In (Test)"
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>
      )}

      <View style={{ height: 30 }} />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Firestore Tests
      </Text>

      <Button
        title="Add Test Document"
        onPress={handleAddTestData}
        disabled={loading}
      />
      <View style={{ height: 10 }} />
      <Button
        title="Get Documents"
        onPress={handleGetData}
        disabled={loading}
      />

      <View style={{ height: 30 }} />

      <Text style={{ fontSize: 16, color: 'gray' }}>
        Platform: {Platform.OS}
      </Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>
        Firebase Configured: {user ? 'Yes' : 'Not yet - follow FIREBASE_SETUP.md'}
      </Text>
    </View>
  );
};

export default FirebaseExampleScreen;