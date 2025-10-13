import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/hooks/useTheme';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  {
    id: 'faq1',
    question: 'How do I track my order?',
    answer: 'You can track your order in real-time by going to "My Orders" section and clicking on your active order. You will see the current status and estimated delivery time.',
    category: 'Orders'
  },
  {
    id: 'faq2',
    question: 'What are your delivery hours?',
    answer: 'We deliver from 8:00 AM to 10:00 PM, 7 days a week. Same-day delivery is available for orders placed before 6:00 PM.',
    category: 'Delivery'
  },
  {
    id: 'faq3',
    question: 'How can I cancel my order?',
    answer: 'You can cancel your order within 15 minutes of placing it by going to "My Orders" and clicking the cancel button. After this time, please contact our support team.',
    category: 'Orders'
  },
  {
    id: 'faq4',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, Apple Pay, Google Pay, and cash on delivery for select areas.',
    category: 'Payment'
  },
  {
    id: 'faq5',
    question: 'Are your products fresh?',
    answer: 'Yes! We source all our fresh produce directly from local farms and suppliers. All items are checked for quality before delivery.',
    category: 'Products'
  },
  {
    id: 'faq6',
    question: 'What is your refund policy?',
    answer: 'If you are not satisfied with your order, we offer full refunds within 24 hours of delivery. Contact our support team for assistance.',
    category: 'Refunds'
  }
];

export default function SupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const { colors, isDark, cardStyle, headerStyle, textStyles } = useTheme();
  const styles = createStyles(colors);

  const handleCall = () => {
    Linking.openURL('tel:+971501234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@grocerydelivery.com?subject=Support Request');
  };

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=971501234567&text=Hello, I need help with my order');
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat feature will be available soon. Please use email or phone for immediate assistance.',
      [{ text: 'OK' }]
    );
  };

  const supportOptions: SupportOption[] = [
    {
      id: 'phone',
      title: 'Call Us',
      description: '+971 50 123 4567',
      icon: 'phone',
      action: handleCall
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@grocerydelivery.com',
      icon: 'email',
      action: handleEmail
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      icon: 'chat',
      action: handleWhatsApp
    },
    {
      id: 'live-chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'support-agent',
      action: handleLiveChat
    }
  ];

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderSupportOption = (option: SupportOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.supportCard}
      onPress={option.action}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${option.title}: ${option.description}`}
      accessibilityHint="Tap to contact support"
    >
      <View style={styles.supportIconContainer}>
        <Icon name={option.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportDescription}>{option.description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const renderFAQ = (faq: FAQ) => (
    <View key={faq.id} style={styles.faqCard}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => toggleFAQ(faq.id)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={faq.question}
        accessibilityHint={expandedFAQ === faq.id ? "Tap to collapse answer" : "Tap to expand answer"}
        accessibilityState={{ expanded: expandedFAQ === faq.id }}
      >
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Icon
          name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expandedFAQ === faq.id && (
        <View 
          style={styles.faqAnswer}
          accessible={true}
          accessibilityRole="text"
        >
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView 
      style={styles.container}
      accessible={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to previous screen"
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text 
          style={styles.headerTitle}
          accessible={true}
          accessibilityRole="header"
        >
          Support Center
        </Text>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        accessible={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Welcome Section */}
        <View 
          style={styles.welcomeSection}
          accessible={true}
          accessibilityRole="text"
        >
          <Icon name="headset-mic" size={48} color={colors.primary} />
          <Text 
            style={styles.welcomeTitle}
            accessible={true}
            accessibilityRole="header"
          >
            How can we help you?
          </Text>
          <Text 
            style={styles.welcomeSubtitle}
            accessible={true}
            accessibilityRole="text"
          >
            We're here to assist you 24/7. Choose your preferred way to get in touch.
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Contact Us
          </Text>
          {supportOptions.map(renderSupportOption)}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Frequently Asked Questions
          </Text>
          {FAQS.map(renderFAQ)}
        </View>

        {/* Additional Help */}
        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Need More Help?
          </Text>
          
          <TouchableOpacity
            style={styles.helpCard}
            onPress={() => router.push('/(tabs)/orders')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Order Issues"
            accessibilityHint="Check your order status or report problems"
          >
            <Icon name="receipt-long" size={24} color={colors.info} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Order Issues</Text>
              <Text style={styles.helpDescription}>
                Check your order status or report problems
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpCard}
            onPress={() => router.push('/(tabs)/profile')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Account Settings"
            accessibilityHint="Update your profile and preferences"
          >
            <Icon name="account-circle" size={24} color={colors.warning} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Account Settings</Text>
              <Text style={styles.helpDescription}>
                Update your profile and preferences
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpCard}
            onPress={handleEmail}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Send Feedback"
            accessibilityHint="Share your thoughts and suggestions"
          >
            <Icon name="feedback" size={24} color={colors.accent} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Send Feedback</Text>
              <Text style={styles.helpDescription}>
                Share your thoughts and suggestions
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Business Hours */}
        <View style={[styles.section, styles.businessHours]}>
          <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Business Hours
          </Text>
          <View 
            style={styles.hoursContainer}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel="Business hours information"
          >
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Monday - Friday</Text>
              <Text style={styles.timeText}>8:00 AM - 10:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Saturday - Sunday</Text>
              <Text style={styles.timeText}>9:00 AM - 9:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Customer Support</Text>
              <Text style={styles.timeText}>24/7 Available</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingTop: 12,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helpContent: {
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  businessHours: {
    marginBottom: 32,
  },
  hoursContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});