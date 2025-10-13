import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';

interface DeliveryInstructionsProps {
  route?: {
    params?: {
      notes?: string;
      onNotesChange?: (notes: string) => void;
    };
  };
}

const DeliveryInstructionsScreen: React.FC<DeliveryInstructionsProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const initialNotes = (route.params as any)?.notes || '';
  const onNotesChange = (route.params as any)?.onNotesChange;
  
  const [notes, setNotes] = useState(initialNotes);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const instructionTemplates = [
    {
      id: '1',
      title: 'Leave at Door',
      description: 'Leave packages at the front door',
      template: 'Please leave the delivery at my front door. No signature required.',
    },
    {
      id: '2',
      title: 'Ring Doorbell',
      description: 'Ring doorbell when you arrive',
      template: 'Please ring the doorbell when you arrive. I will come to collect the delivery.',
    },
    {
      id: '3',
      title: 'Call on Arrival',
      description: 'Call me when you arrive',
      template: 'Please call me when you arrive. I will come down to collect the delivery.',
    },
    {
      id: '4',
      title: 'Security Guard',
      description: 'Leave with building security',
      template: 'Please leave the delivery with the security guard at the main reception. They will notify me.',
    },
    {
      id: '5',
      title: 'Neighbor',
      description: 'Leave with neighbor if not home',
      template: 'If I am not home, please leave the delivery with my neighbor in apartment [neighbor unit].',
    },
    {
      id: '6',
      title: 'Specific Time',
      description: 'Deliver only at specific time',
      template: 'Please deliver only between [time range]. If I am not available during this time, please reschedule.',
    },
    {
      id: '7',
      title: 'Fragile Items',
      description: 'Handle with extra care',
      template: 'Please handle all items with extra care as they contain fragile products. Thank you!',
    },
    {
      id: '8',
      title: 'Contactless Delivery',
      description: 'Leave at door, no contact needed',
      template: 'Please leave the delivery at my door and maintain contactless delivery. Thank you for your service!',
    },
  ];

  const handleTemplateSelect = (template: typeof instructionTemplates[0]) => {
    setSelectedTemplate(template.id);
    setNotes(template.template);
  };

  const handleSave = () => {
    if (onNotesChange) {
      onNotesChange(notes);
    }
    navigation.goBack();
  };

  const handleClear = () => {
    setNotes('');
    setSelectedTemplate(null);
  };

  const characterLimit = 500;
  const remainingChars = characterLimit - notes.length;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Delivery Instructions" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Instructions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <Text style={styles.sectionDescription}>
            Add specific instructions for the delivery person to ensure smooth delivery.
          </Text>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your delivery instructions here..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              maxLength={characterLimit}
              textAlignVertical="top"
            />
            <View style={styles.characterCount}>
              <Text style={[
                styles.characterCountText,
                remainingChars < 50 && styles.characterCountWarning
              ]}>
                {remainingChars} characters remaining
              </Text>
            </View>
          </View>

          {notes.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear Instructions</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Template Instructions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <Text style={styles.sectionDescription}>
            Choose from common delivery instructions or customize your own.
          </Text>
          
          <View style={styles.templatesContainer}>
            {instructionTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.selectedTemplate,
                ]}
                onPress={() => handleTemplateSelect(template)}
              >
                <View style={styles.templateHeader}>
                  <Text style={[
                    styles.templateTitle,
                    selectedTemplate === template.id && styles.selectedTemplateText,
                  ]}>
                    {template.title}
                  </Text>
                  {selectedTemplate === template.id && (
                    <Text style={styles.selectedIcon}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.templateDescription,
                  selectedTemplate === template.id && styles.selectedTemplateText,
                ]}>
                  {template.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Delivery Tips */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Helpful Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🏠</Text>
              <Text style={styles.tipText}>
                Include your apartment/unit number for easier delivery
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>📞</Text>
              <Text style={styles.tipText}>
                Provide your phone number for delivery coordination
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🕐</Text>
              <Text style={styles.tipText}>
                Mention your preferred delivery time if you have one
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🚪</Text>
              <Text style={styles.tipText}>
                Specify a safe location if you won't be home
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomSection}>
        <Button
          title="Save Instructions"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
    color: '#999',
  },
  characterCountWarning: {
    color: '#ff9800',
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  templatesContainer: {
    gap: 8,
  },
  templateCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  selectedTemplate: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedTemplateText: {
    color: '#4CAF50',
  },
  selectedIcon: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
  },
  tipsContainer: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    marginBottom: 0,
  },
});

export default DeliveryInstructionsScreen;

