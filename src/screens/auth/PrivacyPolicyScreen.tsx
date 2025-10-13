// app/screens/auth/PrivacyPolicyScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Header from '../../components/common/Header';
import { AuthNavigationProp, AuthRouteProp } from '../../navigation/navigationTypes';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<AuthRouteProp<'PrivacyPolicy'>>();

  const handleGoBack = () => {
    if (route.params?.fromScreen) {
      navigation.goBack();
    } else {
      navigation.navigate('Welcome');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Privacy Policy" 
        showBack 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: June 25, 2025</Text>
        
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            FreshCart ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.subSectionTitle}>Personal Information</Text>
          <Text style={styles.sectionText}>
            We may collect personal information that you voluntarily provide to us when you:
          </Text>
          <Text style={styles.bulletPoint}>• Register for an account</Text>
          <Text style={styles.bulletPoint}>• Make a purchase</Text>
          <Text style={styles.bulletPoint}>• Contact customer support</Text>
          <Text style={styles.bulletPoint}>• Subscribe to newsletters</Text>
          
          <Text style={styles.subSectionTitle}>Usage Information</Text>
          <Text style={styles.sectionText}>
            We automatically collect certain information when you use our app:
          </Text>
          <Text style={styles.bulletPoint}>• Device information (model, operating system)</Text>
          <Text style={styles.bulletPoint}>• App usage patterns</Text>
          <Text style={styles.bulletPoint}>• Log files and analytics data</Text>
          <Text style={styles.bulletPoint}>• Location data (with permission)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Process and fulfill your orders</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Send important notifications about your orders</Text>
          <Text style={styles.bulletPoint}>• Improve our app and services</Text>
          <Text style={styles.bulletPoint}>• Personalize your experience</Text>
          <Text style={styles.bulletPoint}>• Prevent fraud and ensure security</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With delivery partners to fulfill your orders</Text>
          <Text style={styles.bulletPoint}>• With payment processors to handle transactions</Text>
          <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
          <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Location Information</Text>
          <Text style={styles.sectionText}>
            We may request access to your location information to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate delivery estimates</Text>
          <Text style={styles.bulletPoint}>• Show nearby stores and products</Text>
          <Text style={styles.bulletPoint}>• Improve our delivery services</Text>
          <Text style={styles.sectionText}>
            You can disable location services through your device settings at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            Our app may use cookies and similar tracking technologies to enhance your experience and gather information about visitors and visits to our app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
          <Text style={styles.sectionText}>
            Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Your Rights</Text>
          <Text style={styles.sectionText}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal information</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this Privacy Policy, please contact us:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@freshcart.com</Text>
          <Text style={styles.contactInfo}>Phone: +1 (555) 123-4567</Text>
          <Text style={styles.contactInfo}>Address: 123 Grocery Street, Fresh City, FC 12345</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  introSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  introText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 15,
    color: '#4CAF50',
    marginBottom: 4,
    marginLeft: 16,
  },
});

export default PrivacyPolicyScreen;
