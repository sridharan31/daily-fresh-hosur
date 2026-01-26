import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Coupon, couponService } from '../../../lib/services/business/couponService';
import Button from '../../components/common/Button';

const CouponManagementScreen: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
        discount_type: 'percentage',
        is_active: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await couponService.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            Alert.alert('Error', 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentCoupon.code || !currentCoupon.discount_value) {
            Alert.alert('Validation Error', 'Code and Discount Value are required');
            return;
        }

        try {
            setLoading(true);
            const couponData = {
                code: currentCoupon.code,
                title_en: currentCoupon.title_en || '',
                description_en: currentCoupon.description_en || '',
                discount_type: currentCoupon.discount_type || 'percentage',
                discount_value: Number(currentCoupon.discount_value),
                min_order_amount: Number(currentCoupon.min_order_amount || 0),
                max_discount_amount: currentCoupon.max_discount_amount ? Number(currentCoupon.max_discount_amount) : null,
                valid_from: currentCoupon.valid_from || new Date().toISOString(),
                valid_until: currentCoupon.valid_until || null,
                usage_limit: currentCoupon.usage_limit ? Number(currentCoupon.usage_limit) : null,
                is_active: currentCoupon.is_active !== false,
                show_in_list: currentCoupon.show_in_list !== false,
            };

            if (modalMode === 'create') {
                await couponService.createCoupon(couponData as any);
                Alert.alert('Success', 'Coupon created successfully');
            } else {
                await couponService.updateCoupon(currentCoupon.id!, couponData);
                Alert.alert('Success', 'Coupon updated successfully');
            }
            setShowModal(false);
            fetchCoupons();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            Alert.alert('Error', error.message || 'Failed to save coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this coupon?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await couponService.deleteCoupon(id);
                        fetchCoupons();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete coupon');
                    }
                },
            },
        ]);
    };

    const openModal = (coupon?: Coupon) => {
        if (coupon) {
            setModalMode('edit');
            setCurrentCoupon(coupon);
        } else {
            setModalMode('create');
            setCurrentCoupon({
                discount_type: 'percentage',
                is_active: true,
                show_in_list: true,
            });
        }
        setShowModal(true);
    };

    const renderItem = ({ item }: { item: Coupon }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.code}>{item.code}</Text>
                    <Text style={styles.description}>{item.description_en || item.title_en || 'No description'}</Text>
                </View>
                <Switch
                    value={item.is_active}
                    onValueChange={async (value) => {
                        try {
                            await couponService.updateCoupon(item.id, { is_active: value });
                            // Optimistic update
                            setCoupons(coupons.map(c => c.id === item.id ? { ...c, is_active: value } : c));
                        } catch (error) {
                            fetchCoupons(); // Revert on failure
                        }
                    }}
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.detailText}>
                    {item.discount_type === 'percentage'
                        ? `${item.discount_value}% OFF`
                        : `₹${item.discount_value} OFF`}
                </Text>
                <Text style={styles.detailText}>
                    Min Order: ₹{item.min_order_amount}
                </Text>
                {item.usage_limit && (
                    <Text style={styles.detailText}>
                        Used: {item.used_count} / {item.usage_limit}
                    </Text>
                )}
                <Text style={[styles.detailText, { color: item.show_in_list ? '#4CAF50' : '#FF9800' }]}>
                    {item.show_in_list ? 'Visible to Customers' : 'Hidden from Customers'}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openModal(item)}>
                    <Icon name="edit" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                    <Icon name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Coupon Management</Text>
                <Button title="+ Add Coupon" onPress={() => openModal()} style={styles.addButton} />
            </View>

            {loading && coupons.length === 0 ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={coupons}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No coupons found</Text>}
                />
            )}

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalMode === 'create' ? 'Create Coupon' : 'Edit Coupon'}</Text>
                        <ScrollView>
                            <Text style={styles.label}>Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.code}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, code: text.toUpperCase() })}
                                placeholder="PROMO10"
                            />

                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.title_en}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, title_en: text })}
                                placeholder="Summer Sale"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.description_en}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, description_en: text })}
                                placeholder="10% off on all orders"
                            />

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Type</Text>
                                    <View style={styles.typeSelector}>
                                        <TouchableOpacity
                                            style={[styles.typeButton, currentCoupon.discount_type === 'percentage' && styles.activeType]}
                                            onPress={() => setCurrentCoupon({ ...currentCoupon, discount_type: 'percentage' })}
                                        >
                                            <Text style={[styles.typeText, currentCoupon.discount_type === 'percentage' && styles.activeTypeText]}>%</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.typeButton, currentCoupon.discount_type === 'fixed' && styles.activeType]}
                                            onPress={() => setCurrentCoupon({ ...currentCoupon, discount_type: 'fixed' })}
                                        >
                                            <Text style={[styles.typeText, currentCoupon.discount_type === 'fixed' && styles.activeTypeText]}>₹</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Value *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={currentCoupon.discount_value?.toString()}
                                        onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, discount_value: Number(text) })}
                                        placeholder="10"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Min Order Amount</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.min_order_amount?.toString()}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, min_order_amount: Number(text) })}
                                placeholder="0"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Valid Until (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.valid_until}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, valid_until: text })}
                                placeholder="2026-12-31"
                            />

                            <Text style={styles.label}>Usage Limit</Text>
                            <TextInput
                                style={styles.input}
                                value={currentCoupon.usage_limit?.toString()}
                                onChangeText={(text: string) => setCurrentCoupon({ ...currentCoupon, usage_limit: text ? Number(text) : null })}
                                placeholder="Unlimited"
                                keyboardType="numeric"
                            />

                            <View style={styles.activeSwitch}>
                                <Text style={styles.label}>Active</Text>
                                <Switch
                                    value={currentCoupon.is_active}
                                    onValueChange={(val) => setCurrentCoupon({ ...currentCoupon, is_active: val })}
                                />
                            </View>

                            <View style={styles.activeSwitch}>
                                <Text style={styles.label}>Display to Customers List</Text>
                                <Switch
                                    value={currentCoupon.show_in_list}
                                    onValueChange={(val) => setCurrentCoupon({ ...currentCoupon, show_in_list: val })}
                                />
                            </View>

                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Button title="Cancel" onPress={() => setShowModal(false)} variant="outline" style={styles.modalBtn} />
                            <Button title="Save" onPress={handleSave} style={styles.modalBtn} disabled={loading} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        paddingHorizontal: 16,
        height: 40,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    code: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 12,
    },
    detailText: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        color: '#444',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
    },
    editButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfInput: {
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    modalBtn: {
        flex: 1,
    },
    activeSwitch: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden'
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    activeType: {
        backgroundColor: '#4CAF50',
    },
    typeText: {
        fontWeight: 'bold',
        color: '#333'
    },
    activeTypeText: {
        color: 'white'
    }
});

export default CouponManagementScreen;
