// src/components/orders/UpdateStatusModal.tsx
// Bottom sheet modal for admin to update order status

import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from '../ui/WebCompatibleComponents';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

interface UpdateStatusModalProps {
    visible: boolean;
    onClose: () => void;
    currentStatus: OrderStatus;
    orderId: string;
    orderNumber: string;
    onUpdateStatus: (newStatus: OrderStatus, notes?: string, options?: StatusUpdateOptions) => Promise<void>;
}

interface StatusUpdateOptions {
    notifyCustomer: boolean;
    sendPushNotification: boolean;
}

interface StatusOption {
    status: OrderStatus;
    label: string;
    description: string;
    icon: string;
    color: string;
    confirmRequired?: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, StatusOption[]> = {
    pending: [
        {
            status: 'confirmed',
            label: 'Confirm Order',
            description: 'Accept and start processing this order',
            icon: 'check-circle',
            color: '#2196F3',
        },
        {
            status: 'cancelled',
            label: 'Cancel Order',
            description: 'Reject and notify customer',
            icon: 'cancel',
            color: '#F44336',
            confirmRequired: true,
        },
    ],
    confirmed: [
        {
            status: 'preparing',
            label: 'Start Preparing',
            description: 'Begin preparing items for delivery',
            icon: 'kitchen',
            color: '#9C27B0',
        },
        {
            status: 'cancelled',
            label: 'Cancel Order',
            description: 'Cancel this order',
            icon: 'cancel',
            color: '#F44336',
            confirmRequired: true,
        },
    ],
    preparing: [
        {
            status: 'out_for_delivery',
            label: 'Out for Delivery',
            description: 'Mark as dispatched for delivery',
            icon: 'local-shipping',
            color: '#00BCD4',
        },
        {
            status: 'cancelled',
            label: 'Cancel Order',
            description: 'Cancel this order',
            icon: 'cancel',
            color: '#F44336',
            confirmRequired: true,
        },
    ],
    out_for_delivery: [
        {
            status: 'delivered',
            label: 'Mark Delivered',
            description: 'Confirm delivery completion',
            icon: 'where-to-vote',
            color: '#4CAF50',
        },
        {
            status: 'cancelled',
            label: 'Delivery Failed',
            description: 'Mark as delivery failed',
            icon: 'error',
            color: '#F44336',
            confirmRequired: true,
        },
    ],
    delivered: [
        {
            status: 'refunded',
            label: 'Process Refund',
            description: 'Initiate refund for this order',
            icon: 'money-off',
            color: '#757575',
            confirmRequired: true,
        },
    ],
    cancelled: [
        {
            status: 'refunded',
            label: 'Process Refund',
            description: 'Refund payment if applicable',
            icon: 'money-off',
            color: '#757575',
            confirmRequired: true,
        },
    ],
    refunded: [],
};

const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
        pending: '#FF9800',
        confirmed: '#2196F3',
        preparing: '#9C27B0',
        out_for_delivery: '#00BCD4',
        delivered: '#4CAF50',
        cancelled: '#F44336',
        refunded: '#757575',
    };
    return colors[status] || '#666';
};

const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
    };
    return labels[status] || status;
};

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
    visible,
    onClose,
    currentStatus,
    orderId,
    orderNumber,
    onUpdateStatus,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const [notes, setNotes] = useState('');
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [sendPushNotification, setSendPushNotification] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const availableStatuses = STATUS_CONFIG[currentStatus] || [];

    const handleStatusSelect = (statusOption: StatusOption) => {
        setSelectedStatus(statusOption.status);
        if (statusOption.confirmRequired) {
            setShowConfirmation(true);
        }
    };

    const handleConfirmUpdate = async () => {
        if (!selectedStatus) return;

        setIsLoading(true);
        try {
            await onUpdateStatus(selectedStatus, notes, {
                notifyCustomer,
                sendPushNotification,
            });
            resetAndClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetAndClose = () => {
        setSelectedStatus(null);
        setNotes('');
        setShowConfirmation(false);
        onClose();
    };

    const renderStatusOption = (option: StatusOption) => {
        const isSelected = selectedStatus === option.status;

        return (
            <TouchableOpacity
                key={option.status}
                style={[
                    styles.statusOption,
                    isSelected && styles.statusOptionSelected,
                    { borderLeftColor: option.color },
                ]}
                onPress={() => handleStatusSelect(option)}
            >
                <View style={[styles.statusIconContainer, { backgroundColor: option.color }]}>
                    <Icon name={option.icon} size={24} color="#fff" />
                </View>
                <View style={styles.statusOptionContent}>
                    <Text style={styles.statusOptionLabel}>{option.label}</Text>
                    <Text style={styles.statusOptionDescription}>{option.description}</Text>
                </View>
                {isSelected && (
                    <Icon name="check-circle" size={24} color={option.color} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={resetAndClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>Update Order Status</Text>
                            <Text style={styles.orderNumber}>#{orderNumber}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Current Status */}
                    <View style={styles.currentStatusContainer}>
                        <Text style={styles.currentStatusLabel}>Current Status</Text>
                        <View style={[styles.currentStatusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
                            <Text style={styles.currentStatusText}>{getStatusLabel(currentStatus)}</Text>
                        </View>
                    </View>

                    {/* Status Options */}
                    <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                        {availableStatuses.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>Select New Status</Text>
                                {availableStatuses.map(renderStatusOption)}
                            </>
                        ) : (
                            <View style={styles.noOptionsContainer}>
                                <Icon name="info" size={48} color="#ccc" />
                                <Text style={styles.noOptionsText}>
                                    No status updates available for this order.
                                </Text>
                            </View>
                        )}

                        {/* Notes Input */}
                        {selectedStatus && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Enter any notes about this status update..."
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        )}

                        {/* Notification Options */}
                        {selectedStatus && (
                            <View style={styles.notificationOptions}>
                                <Text style={styles.sectionTitle}>Notifications</Text>

                                <View style={styles.switchRow}>
                                    <View style={styles.switchLabelContainer}>
                                        <Icon name="email" size={20} color="#666" />
                                        <Text style={styles.switchLabel}>Notify customer via SMS/Email</Text>
                                    </View>
                                    <Switch
                                        value={notifyCustomer}
                                        onValueChange={setNotifyCustomer}
                                    />
                                </View>

                                <View style={styles.switchRow}>
                                    <View style={styles.switchLabelContainer}>
                                        <Icon name="notifications" size={20} color="#666" />
                                        <Text style={styles.switchLabel}>Send push notification</Text>
                                    </View>
                                    <Switch
                                        value={sendPushNotification}
                                        onValueChange={setSendPushNotification}
                                    />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    {selectedStatus && (
                        <View style={styles.actionContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setSelectedStatus(null)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.updateButton,
                                    { backgroundColor: getStatusColor(selectedStatus) },
                                    isLoading && styles.buttonDisabled,
                                ]}
                                onPress={handleConfirmUpdate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="check" size={20} color="#fff" />
                                        <Text style={styles.updateButtonText}>Update Status</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Confirmation Dialog */}
                    {showConfirmation && (
                        <View style={styles.confirmationOverlay}>
                            <View style={styles.confirmationDialog}>
                                <Icon name="warning" size={48} color="#FF9800" />
                                <Text style={styles.confirmationTitle}>Confirm Action</Text>
                                <Text style={styles.confirmationMessage}>
                                    Are you sure you want to {selectedStatus === 'cancelled' ? 'cancel' : 'refund'} this order?
                                    This action cannot be undone.
                                </Text>
                                <View style={styles.confirmationButtons}>
                                    <TouchableOpacity
                                        style={styles.confirmationCancelButton}
                                        onPress={() => {
                                            setShowConfirmation(false);
                                            setSelectedStatus(null);
                                        }}
                                    >
                                        <Text style={styles.confirmationCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.confirmationConfirmButton}
                                        onPress={() => setShowConfirmation(false)}
                                    >
                                        <Text style={styles.confirmationConfirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 34,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    orderNumber: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
    },
    currentStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8F8F8',
    },
    currentStatusLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    currentStatusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    currentStatusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    optionsContainer: {
        padding: 20,
        maxHeight: 400,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderLeftWidth: 4,
    },
    statusOptionSelected: {
        backgroundColor: '#F8F8F8',
        borderColor: '#4CAF50',
    },
    statusIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    statusOptionContent: {
        flex: 1,
    },
    statusOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    statusOptionDescription: {
        fontSize: 14,
        color: '#666',
    },
    noOptionsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    noOptionsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
    notesContainer: {
        marginTop: 16,
    },
    notesInput: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#333',
        minHeight: 80,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    notificationOptions: {
        marginTop: 16,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    switchLabel: {
        fontSize: 14,
        color: '#333',
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    updateButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    confirmationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    confirmationDialog: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 32,
        alignItems: 'center',
    },
    confirmationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    confirmationMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    confirmationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    confirmationCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    confirmationCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    confirmationConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#F44336',
        alignItems: 'center',
    },
    confirmationConfirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

export default UpdateStatusModal;
