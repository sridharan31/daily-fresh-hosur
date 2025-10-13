import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

interface Address {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const AddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '12345',
      country: 'UAE',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      street: '456 Business Bay',
      apartment: 'Floor 15',
      city: 'Dubai',
      state: 'Dubai',
      zipCode: '12346',
      country: 'UAE',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'UAE',
    isDefault: false,
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      label: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'UAE',
      isDefault: false,
    });
    setShowAddModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddModal(true);
  };

  const handleSaveAddress = () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
      return;
    }

    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } as Address : addr
      ));
    } else {
      // Add new address
      const id = Date.now().toString();
      setAddresses(prev => [...prev, { ...newAddress, id } as Address]);
    }

    setShowAddModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <Card style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          {!item.isDefault && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteAddress(item.id)}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.addressContent}>
        <Text style={styles.addressText}>
          {item.street}
          {item.apartment && `, ${item.apartment}`}
        </Text>
        <Text style={styles.addressText}>
          {item.city}, {item.state} {item.zipCode}
        </Text>
        <Text style={styles.addressText}>{item.country}</Text>
      </View>

      {!item.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Delivery Addresses" />
      
      <View style={styles.content}>
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          style={styles.addressList}
          contentContainerStyle={styles.addressListContent}
          showsVerticalScrollIndicator={false}
        />
        
        <Button
          title="Add New Address"
          onPress={handleAddAddress}
          style={styles.addButton}
        />
      </View>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <View style={styles.modalContent}>
          <View style={styles.input}>
            <Input
              label="Address Label *"
              placeholder="e.g., Home, Office"
              value={newAddress.label}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
            />
          </View>
          
          <View style={styles.input}>
            <Input
              label="Street Address *"
              placeholder="Enter street address"
              value={newAddress.street}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, street: text }))}
            />
          </View>
          
          <View style={styles.input}>
            <Input
              label="Apartment/Unit (Optional)"
              placeholder="Apt, Suite, Floor"
              value={newAddress.apartment}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, apartment: text }))}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.input, styles.halfWidth]}>
              <Input
                label="City *"
                placeholder="City"
                value={newAddress.city}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
              />
            </View>
            
            <View style={[styles.input, styles.halfWidth]}>
              <Input
                label="State *"
                placeholder="State"
                value={newAddress.state}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.input, styles.halfWidth]}>
              <Input
                label="ZIP Code *"
                placeholder="12345"
                value={newAddress.zipCode}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, zipCode: text }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.input, styles.halfWidth]}>
              <Input
                label="Country *"
                placeholder="Country"
                value={newAddress.country}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, country: text }))}
              />
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={editingAddress ? 'Update' : 'Save'}
              onPress={handleSaveAddress}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  addressList: {
    flex: 1,
  },
  addressListContent: {
    paddingBottom: 16,
  },
  addressCard: {
    marginBottom: 12,
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  addressContent: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 16,
  },
  modalContent: {
    padding: 0,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});

export default AddressScreen;

