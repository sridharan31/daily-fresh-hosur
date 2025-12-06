// src/components/orders/OrderStatusTimeline.tsx
// Visual timeline component for order status progression

import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    StyleSheet,
    Text,
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

interface StatusStep {
    key: OrderStatus;
    label: string;
    icon: string;
    timestamp?: string;
}

interface OrderStatusTimelineProps {
    currentStatus: OrderStatus;
    statusHistory?: Array<{
        status: OrderStatus;
        created_at: string;
        notes?: string;
    }>;
    orientation?: 'horizontal' | 'vertical';
    showTimestamps?: boolean;
    compact?: boolean;
}

const ORDER_FLOW: StatusStep[] = [
    { key: 'pending', label: 'Order Placed', icon: 'receipt' },
    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { key: 'preparing', label: 'Preparing', icon: 'kitchen' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'local-shipping' },
    { key: 'delivered', label: 'Delivered', icon: 'where-to-vote' },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
    currentStatus,
    statusHistory = [],
    orientation = 'horizontal',
    showTimestamps = false,
    compact = false,
}) => {
    // Handle cancelled/refunded separately
    if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
        return (
            <View style={[styles.container, styles.cancelledContainer]}>
                <View style={styles.cancelledBadge}>
                    <Icon
                        name={currentStatus === 'cancelled' ? 'cancel' : 'money-off'}
                        size={32}
                        color="#fff"
                    />
                </View>
                <Text style={styles.cancelledText}>
                    {currentStatus === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}
                </Text>
                {statusHistory.length > 0 && (
                    <Text style={styles.cancelledTimestamp}>
                        {formatDate(statusHistory[statusHistory.length - 1]?.created_at)}
                    </Text>
                )}
            </View>
        );
    }

    const currentIndex = ORDER_FLOW.findIndex(step => step.key === currentStatus);

    const getStepTimestamp = (status: OrderStatus): string | undefined => {
        const historyItem = statusHistory.find(h => h.status === status);
        return historyItem?.created_at;
    };

    if (orientation === 'vertical') {
        return (
            <View style={styles.verticalContainer}>
                {ORDER_FLOW.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;
                    const timestamp = getStepTimestamp(step.key);

                    return (
                        <View key={step.key} style={styles.verticalStep}>
                            {index > 0 && (
                                <View
                                    style={[
                                        styles.verticalConnector,
                                        isCompleted && styles.connectorCompleted,
                                        isCurrent && styles.connectorCurrent,
                                    ]}
                                />
                            )}

                            <View style={styles.verticalStepContent}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        isCompleted && styles.stepCompleted,
                                        isCurrent && styles.stepCurrent,
                                        isUpcoming && styles.stepUpcoming,
                                    ]}
                                >
                                    <Icon
                                        name={isCompleted ? 'check' : step.icon}
                                        size={compact ? 16 : 20}
                                        color={isUpcoming ? '#999' : '#fff'}
                                    />
                                </View>

                                <View style={styles.verticalStepInfo}>
                                    <Text
                                        style={[
                                            styles.stepLabel,
                                            isUpcoming && styles.stepLabelUpcoming,
                                            isCurrent && styles.stepLabelCurrent,
                                        ]}
                                    >
                                        {step.label}
                                    </Text>
                                    {showTimestamps && timestamp && (
                                        <Text style={styles.stepTimestamp}>
                                            {formatDate(timestamp)}
                                        </Text>
                                    )}
                                    {isCurrent && (
                                        <View style={styles.currentIndicator}>
                                            <Text style={styles.currentIndicatorText}>Current</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    }

    // Horizontal layout
    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            {ORDER_FLOW.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;
                const timestamp = getStepTimestamp(step.key);

                return (
                    <React.Fragment key={step.key}>
                        {index > 0 && (
                            <View
                                style={[
                                    styles.connector,
                                    isCompleted && styles.connectorCompleted,
                                    isCurrent && styles.connectorCurrent,
                                ]}
                            />
                        )}

                        <View style={styles.step}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    compact && styles.stepCircleCompact,
                                    isCompleted && styles.stepCompleted,
                                    isCurrent && styles.stepCurrent,
                                    isUpcoming && styles.stepUpcoming,
                                ]}
                            >
                                {isCompleted ? (
                                    <Icon name="check" size={compact ? 12 : 16} color="#fff" />
                                ) : (
                                    <Icon
                                        name={step.icon}
                                        size={compact ? 12 : 16}
                                        color={isUpcoming ? '#999' : '#fff'}
                                    />
                                )}
                            </View>

                            {!compact && (
                                <>
                                    <Text
                                        style={[
                                            styles.stepLabel,
                                            styles.stepLabelHorizontal,
                                            isUpcoming && styles.stepLabelUpcoming,
                                            isCurrent && styles.stepLabelCurrent,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {step.label}
                                    </Text>
                                    {showTimestamps && timestamp && (
                                        <Text style={styles.stepTimestamp}>
                                            {formatTime(timestamp)}
                                        </Text>
                                    )}
                                </>
                            )}
                        </View>
                    </React.Fragment>
                );
            })}
        </View>
    );
};

// Helper functions
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get status display info
export const getStatusInfo = (status: OrderStatus): { label: string; color: string; icon: string } => {
    const statusMap: Record<OrderStatus, { label: string; color: string; icon: string }> = {
        pending: { label: 'Order Placed', color: '#FF9800', icon: 'receipt' },
        confirmed: { label: 'Confirmed', color: '#2196F3', icon: 'check-circle' },
        preparing: { label: 'Preparing', color: '#9C27B0', icon: 'kitchen' },
        out_for_delivery: { label: 'Out for Delivery', color: '#00BCD4', icon: 'local-shipping' },
        delivered: { label: 'Delivered', color: '#4CAF50', icon: 'where-to-vote' },
        cancelled: { label: 'Cancelled', color: '#F44336', icon: 'cancel' },
        refunded: { label: 'Refunded', color: '#757575', icon: 'money-off' },
    };

    return statusMap[status] || { label: status, color: '#666', icon: 'help' };
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    containerCompact: {
        paddingVertical: 8,
    },
    verticalContainer: {
        paddingVertical: 8,
        paddingLeft: 16,
    },
    step: {
        alignItems: 'center',
        flex: 1,
        maxWidth: 80,
    },
    verticalStep: {
        position: 'relative',
        marginBottom: 8,
    },
    verticalStepContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    verticalStepInfo: {
        marginLeft: 16,
        flex: 1,
        paddingBottom: 24,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    stepCircleCompact: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    stepCompleted: {
        backgroundColor: '#4CAF50',
    },
    stepCurrent: {
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: '#A5D6A7',
    },
    stepUpcoming: {
        backgroundColor: '#E0E0E0',
        borderWidth: 2,
        borderColor: '#BDBDBD',
    },
    connector: {
        flex: 1,
        height: 3,
        backgroundColor: '#E0E0E0',
        marginTop: 16,
        marginHorizontal: -8,
    },
    connectorCompleted: {
        backgroundColor: '#4CAF50',
    },
    connectorCurrent: {
        backgroundColor: '#A5D6A7',
    },
    verticalConnector: {
        position: 'absolute',
        left: 17,
        top: -24,
        width: 3,
        height: 24,
        backgroundColor: '#E0E0E0',
    },
    stepLabel: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    stepLabelHorizontal: {
        marginTop: 8,
        textAlign: 'center',
    },
    stepLabelUpcoming: {
        color: '#999',
    },
    stepLabelCurrent: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    stepTimestamp: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
    },
    currentIndicator: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    currentIndicatorText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    cancelledContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        paddingVertical: 24,
    },
    cancelledBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F44336',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cancelledText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F44336',
        marginBottom: 4,
    },
    cancelledTimestamp: {
        fontSize: 12,
        color: '#999',
    },
});

export default OrderStatusTimeline;
