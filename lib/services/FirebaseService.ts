import { Platform } from 'react-native';
import { getAnalytics, getAuth, getFirestore } from '../firebase';

class FirebaseService {
  // Authentication methods
  static async signInWithEmail(email: string, password: string) {
    try {
      if (Platform.OS === 'web') {
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const auth = getAuth();
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } else {
        const auth = getAuth();
        const result = await auth.signInWithEmailAndPassword(email, password);
        return result.user;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signUpWithEmail(email: string, password: string) {
    try {
      if (Platform.OS === 'web') {
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const auth = getAuth();
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
      } else {
        const auth = getAuth();
        const result = await auth.createUserWithEmailAndPassword(email, password);
        return result.user;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      if (Platform.OS === 'web') {
        const { signOut } = require('firebase/auth');
        const auth = getAuth();
        await signOut(auth);
      } else {
        const auth = getAuth();
        await auth.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static getCurrentUser() {
    const auth = getAuth();
    return auth.currentUser;
  }

  // Firestore methods
  static async addDocument(collectionName: string, data: any) {
    try {
      if (Platform.OS === 'web') {
        const { collection, addDoc } = require('firebase/firestore');
        const firestore = getFirestore();
        const collectionRef = collection(firestore, collectionName);
        const docRef = await addDoc(collectionRef, data);
        return docRef.id;
      } else {
        const firestore = getFirestore();
        const docRef = await firestore.collection(collectionName).add(data);
        return docRef.id;
      }
    } catch (error) {
      console.error('Add document error:', error);
      throw error;
    }
  }

  static async getDocuments(collectionName: string) {
    try {
      if (Platform.OS === 'web') {
        const { collection, getDocs } = require('firebase/firestore');
        const firestore = getFirestore();
        const collectionRef = collection(firestore, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } else {
        const firestore = getFirestore();
        const snapshot = await firestore.collection(collectionName).get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  // Analytics methods
  static async logEvent(eventName: string, parameters?: any) {
    try {
      if (Platform.OS === 'web') {
        const { logEvent } = require('firebase/analytics');
        const analytics = getAnalytics();
        if (analytics) {
          await logEvent(analytics, eventName, parameters);
        }
      } else {
        const analytics = getAnalytics();
        if (analytics) {
          await analytics.logEvent(eventName, parameters);
        }
      }
    } catch (error) {
      console.warn('Analytics log event failed:', error);
    }
  }

  // Crashlytics (native only)
  static recordError(error: Error, context?: any) {
    if (Platform.OS !== 'web') {
      const crashlytics = require('../firebase').getCrashlytics();
      if (crashlytics) {
        crashlytics.recordError(error, context);
      }
    }
  }
}

export default FirebaseService;