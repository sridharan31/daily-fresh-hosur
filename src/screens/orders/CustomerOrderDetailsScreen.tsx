// src/screens/orders/CustomerOrderDetailsScreen.tsx
// Enhanced order details screen for customers

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import orderManagementService, { OrderWithDetails } from '../../../lib/supabase/services/orderManagement';
import OrderStatusTimeline, { getStatusInfo, OrderStatus } from '../../components/orders/OrderStatusTimeline';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from '../../components/ui/WebCompatibleComponents';

interface DeliveryInfo {
    timeRemaining: string;
    isToday: boolean;
    isTomorrow: boolean;
}

// Mock useAuth hook for now
const useAuth = () => ({ user: { id: 'mock-user-id' } });

const CustomerOrderDetailsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: string };
    const { user } = useAuth();

    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderManagementService.getOrderDetails(orderId, user?.id);
            setOrder(data);
        } catch (error) {
            console.error('Error loading order:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOrderDetails();
        setRefreshing(false);
    }, [orderId]);

    const getDeliveryInfo = (): DeliveryInfo | null => {
        if (!order?.delivery_slot?.slot_date) return null;

        const deliveryDate = new Date(order.delivery_slot.slot_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deliveryDate.setHours(0, 0, 0, 0);

        const diffTime = deliveryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeRemaining = '';
        if (diffDays === 0) {
            timeRemaining = 'Today';
        } else if (diffDays === 1) {
            timeRemaining = 'Tomorrow';
        } else if (diffDays > 1) {
            timeRemaining = `In ${diffDays} days`;
        } else {
            timeRemaining = 'Delivered';
        }

        return {
            timeRemaining,
            isToday: diffDays === 0,
            isTomorrow: diffDays === 1,
        };
    };

    const handleCancelOrder = () => {
        if (!order) return;

        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order? This action cannot be undone.',
            [
                { text: 'No, Keep Order', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => cancelOrderWithReason('Customer requested cancellation'),
                },
            ]
        );
    };

    const cancelOrderWithReason = async (reason: string) => {
        if (!order || !user) return;

        try {
            setCancelling(true);
            await orderManagementService.cancelOrder(order.id, user.id, reason);
            Alert.alert('Success', 'Your order has been cancelled');
            loadOrderDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleReorder = () => {
        if (!order) return;

        Alert.alert(
            'Reorder',
            `Add ${order.items?.length || 0} items to your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add to Cart',
                    onPress: () => {
                        Alert.alert('Success', 'Items added to cart!');
                    },
                },
            ]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to reach us?',
            [
                { text: 'Call', onPress: () => Linking.openURL('tel:+919876543210') },
                { text: 'Chat', onPress: () => { } },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleTrackOrder = () => {
        Alert.alert('Track Order', 'Live tracking coming soon!');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="error" size={64} color="#F44336" />
                    <Text style={styles.errorText}>Order not found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusInfo = getStatusInfo(order.status as OrderStatus);
    const deliveryInfo = getDeliveryInfo();
    const canCancel = ['pending', 'confirmed'].includes(order.status);
    const isActiveOrder = !['delivered', 'cancelled', 'refunded'].includes(order.status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Order Details</Text>
                </View>
                <TouchableOpacity style={styles.helpButton} onPress={handleContactSupport}>
                    <Icon name="help-outline" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Order Status Hero */}
                <View style={[styles.statusHero, { backgroundColor: statusInfo.color + '15' }]}>
                    <View style={[styles.statusIconContainer, { backgroundColor: statusInfo.color }]}>
                        <Icon name={statusInfo.icon} size={32} color="#fff" />
                    </View>
                    <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                    <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
                    <Text style={styles.orderDate}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>

                    {isActiveOrder && order.status !== 'pending' && (
                        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
                            <Icon name="my-location" size={20} color="#fff" />
                            <Text style={styles.trackButtonText}>Track Order</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Delivery Time Card */}
                {order.delivery_slot && isActiveOrder && (
                    <View style={styles.deliveryCard}>
                        <View style={styles.deliveryCardHeader}>
                            <Icon name="local-shipping" size={24} color="#4CAF50" />
                            <Text style={styles.deliveryCardTitle}>
                                {deliveryInfo?.isToday ? 'Arriving Today!' :
                                    deliveryInfo?.isTomorrow ? 'Arriving Tomorrow' :
                                        'Scheduled Delivery'}
                            </Text>
                        </View>
                        <View style={styles.deliveryTimeRow}>
                            <View style={styles.deliveryDateContainer}>
                                <Text style={styles.deliveryDay}>
                                    {new Date(order.delivery_slot.slot_date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                </Text>
                                <Text style={styles.deliveryDate}>
                                    {new Date(order.delivery_slot.slot_date).getDate()}
                                </Text>
                                <Text style={styles.deliveryMonth}>
                                    {new Date(order.delivery_slot.slot_date).toLocaleDateString('en-IN', { month: 'short' })}
                                </Text>
                            </View>
                            <View style={styles.deliveryTimeDetails}>
                                <Text style={styles.deliveryTimeSlot}>
                                    {new Date(order.delivery_slot.start_ts).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })} - {new Date(order.delivery_slot.end_ts).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                                <Text style={styles.deliveryAddress} numberOfLines={2}>
                                    {order.delivery_address?.address_line_1}, {order.delivery_address?.city}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Status Timeline */}
                <View style={styles.timelineCard}>
                    <Text style={styles.cardTitle}>Order Progress</Text>
                    <OrderStatusTimeline
                        currentStatus={order.status as OrderStatus}
                        statusHistory={order.status_history}
                        orientation="vertical"
                        showTimestamps
                    />
                </View>

                {/* Order Items */}
                <View style={styles.itemsCard}>
                    <Text style={styles.cardTitle}>
                        {order.items?.length || 0} Items
                    </Text>
                    {order.items?.map((item, index) => (
                        <View key={item.id || index} style={styles.itemRow}>
                            <View style={styles.itemImageContainer}>
                                {item.product_image ? (
                                    <Image source={{ uri: item.product_image }} style={styles.itemImage} />
                                ) : (
                                    <View style={styles.itemImagePlaceholder}>
                                        <Icon name="image" size={24} color="#ccc" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{item.product_name}</Text>
                                <Text style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Bill Details */}
                <View style={styles.billCard}>
                    <Text style={styles.cardTitle}>Bill Details</Text>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{order.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <View style={styles.billLabelContainer}>
                            <Text style={styles.billLabel}>GST</Text>
                            <Text style={styles.billSubLabel}>(CGST 9% + SGST 9%)</Text>
                        </View>
                        <Text style={styles.billValue}>₹{order.gst_amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery</Text>
                        <Text style={[styles.billValue, order.delivery_charge === 0 && styles.freeText]}>
                            {order.delivery_charge > 0 ? `₹${order.delivery_charge.toFixed(2)}` : 'FREE'}
                        </Text>
                    </View>

                    {order.discount_amount > 0 && (
                        <View style={styles.billRow}>
                            <View style={styles.billLabelContainer}>
                                <Text style={[styles.billLabel, styles.discountLabel]}>Discount</Text>
                                <Icon name="local-offer" size={14} color="#4CAF50" />
                            </View>
                            <Text style={[styles.billValue, styles.discountValue]}>
                                -₹{order.discount_amount.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{order.total_amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.paymentInfo}>
                        <Icon name="payment" size={18} color="#666" />
                        <Text style={styles.paymentText}>
                            Paid via {order.payment_method?.toUpperCase()}
                        </Text>
                        {order.payment_status === 'paid' && (
                            <View style={styles.paidBadge}>
                                <Icon name="check-circle" size={14} color="#4CAF50" />
                                <Text style={styles.paidBadgeText}>Paid</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.addressCard}>
                    <Text style={styles.cardTitle}>Delivery Address</Text>
                    <View style={styles.addressContent}>
                        <Icon name="location-on" size={24} color="#4CAF50" />
                        <View style={styles.addressDetails}>
                            <Text style={styles.addressLine}>{order.delivery_address?.address_line_1}</Text>
                            {order.delivery_address?.address_line_2 && (
                                <Text style={styles.addressLine}>{order.delivery_address.address_line_2}</Text>
                            )}
                            <Text style={styles.addressLine}>
                                {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}
                            </Text>
                            {order.delivery_address?.landmark && (
                                <Text style={styles.landmark}>Landmark: {order.delivery_address.landmark}</Text>
                            )}
                        </View>
                    </View>

                    {order.delivery_instructions && (
                        <View style={styles.instructionsBox}>
                            <Icon name="note" size={16} color="#FF9800" />
                            <Text style={styles.instructionsText}>{order.delivery_instructions}</Text>
                        </View>
                    )}
                </View>

                {/* Cancellation Info */}
                {order.status === 'cancelled' && order.cancellation_reason && (
                    <View style={styles.cancellationCard}>
                        <View style={styles.cancellationHeader}>
                            <Icon name="cancel" size={24} color="#F44336" />
                            <Text style={styles.cancellationTitle}>Order Cancelled</Text>
                        </View>
                        <Text style={styles.cancellationReason}>
                            Reason: {order.cancellation_reason}
                        </Text>
                        {order.refund_amount && order.refund_amount > 0 && (
                            <View style={styles.refundInfo}>
                                <Icon name="account-balance-wallet" size={18} color="#4CAF50" />
                                <Text style={styles.refundText}>
                                    Refund of ₹{order.refund_amount.toFixed(2)} has been initiated
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.cancelButton, cancelling && styles.buttonDisabled]}
                            onPress={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator size="small" color="#F44336" />
                            ) : (
                                <>
                                    <Icon name="close" size={20} color="#F44336" />
                                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {order.status === 'delivered' && (
                        <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
                            <Icon name="refresh" size={20} color="#fff" />
                            <Text style={styles.reorderButtonText}>Reorder</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Need Help */}
                <View style={styles.helpCard}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>
                        Having issues with your order? Our support team is here to help.
                    </Text>
                    <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
                        <Icon name="support-agent" size={20} color="#4CAF50" />
                        <Text style={styles.supportButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#666',
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    helpButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    statusHero: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    statusIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 20,
        gap: 8,
    },
    trackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deliveryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: -16,
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    deliveryCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    deliveryCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
    },
    deliveryTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    deliveryDateContainer: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 70,
    },
    deliveryDay: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    deliveryDate: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    deliveryMonth: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    deliveryTimeDetails: {
        flex: 1,
    },
    deliveryTimeSlot: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    deliveryAddress: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    timelineCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 16,
        padding: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    itemsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemImageContainer: {
        marginRight: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    itemImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 13,
        color: '#666',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    billCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    billLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    billLabel: {
        fontSize: 14,
        color: '#666',
    },
    billSubLabel: {
        fontSize: 12,
        color: '#999',
    },
    billValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    freeText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    discountLabel: {
        color: '#4CAF50',
    },
    discountValue: {
        color: '#4CAF50',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#E0E0E0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 8,
    },
    paymentText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    paidBadgeText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    addressCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
    },
    addressContent: {
        flexDirection: 'row',
        gap: 12,
    },
    addressDetails: {
        flex: 1,
    },
    addressLine: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    landmark: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    instructionsBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 16,
        padding: 12,
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        gap: 8,
    },
    instructionsText: {
        flex: 1,
        fontSize: 13,
        color: '#F57C00',
        fontStyle: 'italic',
    },
    cancellationCard: {
        backgroundColor: '#FFEBEE',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
    },
    cancellationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    cancellationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F44336',
    },
    cancellationReason: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    refundInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#FFCDD2',
        gap: 8,
    },
    refundText: {
        fontSize: 14,
        color: '#4CAF50',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F44336',
        gap: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#F44336',
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    reorderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        gap: 8,
    },
    reorderButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    helpCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 24,
        gap: 8,
    },
    supportButtonText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
});

export default CustomerOrderDetailsScreen;
