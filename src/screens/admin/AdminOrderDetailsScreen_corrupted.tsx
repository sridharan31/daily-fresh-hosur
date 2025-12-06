// src/screens/admin/AdminOrderDetailsScreen.tsx
// Comprehensive order details screen for admin with status management

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import orderManagementService, { OrderWithDetails } from '../../../lib/supabase/services/orderManagement';
import OrderStatusTimeline, { getStatusInfo, OrderStatus } from '../../components/orders/OrderStatusTimeline';
import UpdateStatusModal from '../../components/orders/UpdateStatusModal';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from '../../components/ui/WebCompatibleComponents';
import { useAuth } from '../../hooks/useAuth';

interface DeliveryCountdown {
    hours: number;
    minutes: number;
    isUrgent: boolean;
    isOverdue: boolean;
}

const AdminOrderDetailsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: string };

    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [countdown, setCountdown] = useState<DeliveryCountdown | null>(null);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (order?.delivery_slot) {
            updateCountdown();
            const interval = setInterval(updateCountdown, 60000);
            return () => clearInterval(interval);
        }
    }, [order?.delivery_slot]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderManagementService.getOrderDetails(orderId);
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

    const updateCountdown = () => {
        if (!order?.delivery_slot?.start_ts) return;

        const deliveryTime = new Date(order.delivery_slot.start_ts).getTime();
        const now = Date.now();
        const diff = deliveryTime - now;

        if (diff <= 0) {
            setCountdown({ hours: 0, minutes: 0, isUrgent: false, isOverdue: true });
        } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const isUrgent = hours < 2;
            setCountdown({ hours, minutes, isUrgent, isOverdue: false });
        }
    };

    const { user } = useAuth(); // Assuming useAuth is available and provides user info

    const handleStatusUpdate = async (
        newStatus: OrderStatus,
        notes?: string,
        options?: { notifyCustomer: boolean; sendPushNotification: boolean }
    ) => {
        try {
            if (!user?.id) {
                Alert.alert('Error', 'You must be logged in to update status');
                return;
            }
            await orderManagementService.updateOrderStatus(orderId, newStatus, user.id, notes);

            Alert.alert('Success', 'Order status updated successfully');
            setShowUpdateModal(false);
            loadOrderDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update status');
            throw error;
        }
    };

    const openURL = (url: string) => {
        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            // For native, we would use Linking but since we're web-focused, just use window
            window.open(url, '_blank');
        }
    };

    <TouchableOpacity style={styles.menuButton}>
        <Icon name="more-vert" size={24} color="#333" />
    </TouchableOpacity>
        </View >

    <ScrollView
        style={styles.scrollView}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
    >
        {/* Status Card */}
        <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Icon name={statusInfo.icon} size={16} color="#fff" />
                    <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
                </View>
                {order.payment_status === 'paid' && (
                    <View style={styles.paidBadge}>
                        <Icon name="check-circle" size={14} color="#4CAF50" />
                        <Text style={styles.paidBadgeText}>Paid</Text>
                    </View>
                )}
            </View>

            <OrderStatusTimeline
                currentStatus={order.status as OrderStatus}
                statusHistory={order.status_history}
                showTimestamps
            />

            {!['delivered', 'cancelled', 'refunded'].includes(order.status) && (
                <TouchableOpacity
                    style={[styles.updateStatusButton, { backgroundColor: statusInfo.color }]}
                    onPress={() => setShowUpdateModal(true)}
                >
                    <Icon name="update" size={20} color="#fff" />
                    <Text style={styles.updateStatusButtonText}>Update Status</Text>
                </TouchableOpacity>
            )}
        </View>

        {/* Delivery Slot Card */}
        {order.delivery_slot && (
            <View style={[
                styles.sectionCard,
                countdown?.isUrgent && !countdown?.isOverdue && styles.urgentCard,
                countdown?.isOverdue && styles.overdueCard,
            ]}>
                <View style={styles.sectionHeader}>
                    <Icon name="schedule" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Delivery Slot</Text>
                    {countdown?.isUrgent && !countdown?.isOverdue && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentBadgeText}>URGENT</Text>
                        </View>
                    )}
                </View>

                <View style={styles.deliverySlotContent}>
                    <Text style={styles.deliveryDate}>
                        {new Date(order.delivery_slot.slot_date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                    <Text style={styles.deliveryTime}>
                        {new Date(order.delivery_slot.start_ts).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })} - {new Date(order.delivery_slot.end_ts).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>

                    {countdown && !countdown.isOverdue && !['delivered', 'cancelled'].includes(order.status) && (
                        <View style={[styles.countdownContainer, countdown.isUrgent && styles.countdownUrgent]}>
                            <Icon name="timer" size={18} color={countdown.isUrgent ? '#F44336' : '#666'} />
                            <Text style={[styles.countdownText, countdown.isUrgent && styles.countdownTextUrgent]}>
                                Delivers in {countdown.hours}h {countdown.minutes}m
                            </Text>
                        </View>
                    )}

                    {countdown?.isOverdue && !['delivered', 'cancelled'].includes(order.status) && (
                        <View style={styles.overdueContainer}>
                            <Icon name="warning" size={18} color="#F44336" />
                            <Text style={styles.overdueText}>Delivery slot has passed</Text>
                        </View>
                    )}
                </View>
            </View>
        )}

        {/* Customer Info Card */}
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Icon name="person" size={20} color="#333" />
                <Text style={styles.sectionTitle}>Customer Information</Text>
            </View>

            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customer?.full_name || 'Unknown'}</Text>

                <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(order.customer?.phone)}>
                    <Icon name="phone" size={18} color="#4CAF50" />
                    <Text style={styles.contactText}>{order.customer?.phone || 'N/A'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactRow} onPress={() => handleEmail(order.customer?.email)}>
                    <Icon name="email" size={18} color="#4CAF50" />
                    <Text style={styles.contactText}>{order.customer?.email || 'N/A'}</Text>
                </TouchableOpacity>
            </View>

            {/* Delivery Address */}
            <View style={styles.addressContainer}>
                <Icon name="location-on" size={20} color="#666" />
                <View style={styles.addressContent}>
                    <Text style={styles.addressLine}>
                        {order.delivery_address?.address_line_1 || order.delivery_address?.address_line1}
                    </Text>
                    {(order.delivery_address?.address_line_2) && (
                        <Text style={styles.addressLine}>{order.delivery_address.address_line_2}</Text>
                    )}
                    <Text style={styles.addressLine}>
                        {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode || order.delivery_address?.postal_code}
                    </Text>
                    {order.delivery_address?.landmark && (
                        <Text style={styles.landmark}>Landmark: {order.delivery_address.landmark}</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
                    <Icon name="map" size={20} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            {order.delivery_instructions && (
                <View style={styles.instructionsContainer}>
                    <Icon name="note" size={18} color="#FF9800" />
                    <Text style={styles.instructionsText}>{order.delivery_instructions}</Text>
                </View>
            )}
        </View>

        {/* Order Items Card */}
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Icon name="shopping-bag" size={20} color="#333" />
                <Text style={styles.sectionTitle}>Order Items ({order.items?.length || 0})</Text>
            </View>

            {order.items?.map((item, index) => (
                <View key={item.id || index} style={styles.orderItem}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.product_name}</Text>
                        <Text style={styles.itemQuantity}>
                            {item.quantity} × ₹{item.price.toFixed(2)}
                        </Text>
                    </View>
                    <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                </View>
            ))}
        </View>

        {/* Payment Summary Card */}
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Icon name="receipt" size={20} color="#333" />
                <Text style={styles.sectionTitle}>Payment Summary</Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>₹{order.subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>CGST (9%)</Text>
                <Text style={styles.paymentValue}>₹{order.cgst_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>SGST (9%)</Text>
                <Text style={styles.paymentValue}>₹{order.sgst_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Charge</Text>
                <Text style={styles.paymentValue}>
                    {order.delivery_charge > 0 ? `₹${order.delivery_charge.toFixed(2)}` : 'FREE'}
                </Text>
            </View>

            {order.discount_amount > 0 && (
                <View style={styles.paymentRow}>
                    <Text style={[styles.paymentLabel, styles.discountLabel]}>Discount</Text>
                    <Text style={[styles.paymentValue, styles.discountValue]}>
                        -₹{order.discount_amount.toFixed(2)}
                    </Text>
                </View>
            )}

            <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{order.total_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentMethodRow}>
                <Icon name="payment" size={18} color="#666" />
                <Text style={styles.paymentMethodText}>
                    {order.payment_method?.toUpperCase()} • {order.payment_status?.toUpperCase()}
                </Text>
            </View>
        </View>

        {/* Order History Card */}
        {order.status_history && order.status_history.length > 0 && (
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Icon name="history" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Order History</Text>
                </View>

                {order.status_history.map((history, index) => {
                    const historyStatusInfo = getStatusInfo(history.status as OrderStatus);
                    return (
                        <View key={history.id || index} style={styles.historyItem}>
                            <View style={[styles.historyDot, { backgroundColor: historyStatusInfo.color }]} />
                            <View style={styles.historyContent}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historyStatus}>{historyStatusInfo.label}</Text>
                                    <Text style={styles.historyTime}>
                                        {new Date(history.created_at).toLocaleString('en-IN')}
                                    </Text>
                                </View>
                                {history.notes && (
                                    <Text style={styles.historyNotes}>{history.notes}</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePrintInvoice}>
                <Icon name="print" size={24} color="#4CAF50" />
                <Text style={styles.actionButtonLabel}>Print Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(order.customer?.phone)}
            >
                <Icon name="phone" size={24} color="#2196F3" />
                <Text style={styles.actionButtonLabel}>Call Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleViewMap}>
                <Icon name="directions" size={24} color="#FF9800" />
                <Text style={styles.actionButtonLabel}>Get Directions</Text>
            </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
    </ScrollView>

{/* Update Status Modal */ }
<UpdateStatusModal
    visible={showUpdateModal}
    onClose={() => setShowUpdateModal(false)}
    currentStatus={order.status as OrderStatus}
    orderId={order.id}
    orderNumber={order.order_number}
    onUpdateStatus={handleStatusUpdate}
/>
    </SafeAreaView >
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
    headerDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    menuButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    statusCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    paidBadgeText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    updateStatusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    updateStatusButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    urgentCard: {
        borderWidth: 2,
        borderColor: '#FF9800',
    },
    overdueCard: {
        borderWidth: 2,
        borderColor: '#F44336',
        backgroundColor: '#FFF8F7',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    urgentBadge: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    urgentBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    deliverySlotContent: {
        marginBottom: 12,
    },
    deliveryDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    deliveryTime: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    countdownUrgent: {
        backgroundColor: '#FFEBEE',
    },
    countdownText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    countdownTextUrgent: {
        color: '#F44336',
        fontWeight: 'bold',
    },
    overdueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    overdueText: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: 'bold',
    },
    customerInfo: {
        marginBottom: 16,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#4CAF50',
    },
    addressContainer: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 12,
    },
    addressContent: {
        flex: 1,
    },
    addressLine: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    landmark: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    mapButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFF8E1',
        marginHorizontal: -20,
        marginBottom: -20,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        gap: 12,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        color: '#FF9800',
        fontStyle: 'italic',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 13,
        color: '#666',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#666',
    },
    paymentValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    discountLabel: {
        color: '#4CAF50',
    },
    discountValue: {
        color: '#4CAF50',
    },
    totalRow: {
        borderTopWidth: 2,
        borderTopColor: '#E0E0E0',
        marginTop: 8,
        paddingTop: 12,
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
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 8,
    },
    paymentMethodText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    historyItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    historyDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    historyStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    historyTime: {
        fontSize: 12,
        color: '#999',
    },
    historyNotes: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
    },
    actionsCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
    },
    actionButtonLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});

export default AdminOrderDetailsScreen;
