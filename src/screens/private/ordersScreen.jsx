import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colours from '../../assets/colours';
import GradientBackground from '../../components/gradientBackground';
import ScreenHeader from '../../components/screenHeader';
import { SectionLoader } from '../../components/loadingSpinner';
import { useOrders } from '../../context/ordersContext';
import { dash } from '../../lib/text';

function formatPrice(val) {
  if (val == null || val === '') return '₹0';
  if (typeof val === 'number') {
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const s = String(val).trim();
  if (s.startsWith('₹') || s.startsWith('Rs')) return s;
  const num = Number(s.replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(num) && num > 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return s ? `₹${s}` : '₹0';
}

function OrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 375;
  const hPadding = isSmallDevice ? 14 : 18;

  const { orders, refreshOrders } = useOrders();
  const [loadingOrders, setLoadingOrders] = useState(orders.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const trackingSteps = selectedTrackingOrder?.trackingSteps || [];

  const load = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    else if (orders.length === 0) setLoadingOrders(true);
    try {
      await refreshOrders();
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  }, [orders.length, refreshOrders]);

  useFocusEffect(useCallback(() => {
    load(false);
  }, [load]));

  useEffect(() => {
    if (!selectedTrackingOrder) return;
    const fresh = orders.find((order) => order.id === selectedTrackingOrder.id);
    if (fresh && fresh.status !== selectedTrackingOrder.status) setSelectedTrackingOrder(fresh);
  }, [orders, selectedTrackingOrder]);

  return (
    <GradientBackground className="flex-1">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Screen Header */}
      <ScreenHeader
        title="My Orders"
        titleStyle={{ fontFamily: 'Manrope-Bold' }}
        onBackPress={() => navigation.goBack()}
      />

      {loadingOrders && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <SectionLoader message="Retrieving your orders..." minHeight={260} />
        </View>
      ) : orders.length === 0 ? (
        /* =====================================================================
           EMPTY ORDERS STATE
           ===================================================================== */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon
              name="receipt-outline"
              size={38}
              color={colours.saffron || '#BF5B21'}
            />
          </View>

          <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place an order, it will appear here.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              try {
                navigation?.navigate?.('MainTabs', {
                  screen: 'CollectionsTab',
                  params: { category: 'all' },
                });
              } catch {
                navigation?.navigate?.('CollectionsTab');
              }
            }}
            style={styles.discoverBtn}>
            <Text style={styles.discoverBtnText}>Explore Collections</Text>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* =====================================================================
           ORDERS LIST FEED
           ===================================================================== */
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colours.saffron || '#BF5B21'}
              colors={[colours.saffron || '#BF5B21']}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: hPadding,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.ordersCol}>
            {orders.map((order) => {
              const isCod = order.paymentMethod === 'COD';

              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Card Header: Order Number, Date, Status Pill */}
                  <View style={styles.orderHeaderRow}>
                    <View>
                      <Text style={styles.orderNumberText}>
                        Order #{order.orderNumber}
                      </Text>
                      <Text style={styles.orderDateText}>{order.dateFormatted}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {order.statusLabel || 'Confirmed'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Order Items */}
                  <View style={styles.itemsCol}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemThumbContainer}>
                          {item.image ? (
                            <Image
                              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                              style={styles.itemThumb}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.itemThumbPlaceholder}>
                              <Icon name="image-outline" size={16} color="#A89F91" />
                            </View>
                          )}
                        </View>

                        <View style={styles.itemDetailsCol}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {dash(item.title)}
                          </Text>
                          {item.productCode ? (
                            <Text style={styles.itemCode}>Code: {item.productCode}</Text>
                          ) : null}
                          <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                        </View>

                        <Text style={styles.itemPrice}>
                          {formatPrice(
                            (Number(String(item.price).replace(/[^0-9.]/g, '')) || 0) *
                            item.quantity,
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.divider} />

                  {/* Payment & Shipping Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Icon
                        name={isCod ? 'cash-outline' : 'card-outline'}
                        size={14}
                        color="#7D756A"
                      />
                      <Text style={styles.metaText}>
                        {order.paymentStatus === 'PAY_ON_DELIVERY'
                          ? 'Cash on Delivery'
                          : order.paymentStatus === 'PAID'
                            ? 'Paid'
                            : 'Payment pending'}
                      </Text>
                    </View>

                    {order.shippingAddress?.city ? (
                      <View style={styles.metaItem}>
                        <Icon name="location-outline" size={14} color="#7D756A" />
                        <Text style={styles.metaText}>
                          {order.shippingAddress.city} ({order.shippingAddress.postalCode})
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.divider} />

                  {/* Footer: Total Amount & Track Order Button */}
                  <View style={styles.orderFooterRow}>
                    <View>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalValue}>
                        {formatPrice(order.totalAmount)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedTrackingOrder(order)}
                      style={styles.trackOrderBtn}>
                      <Icon
                        name="navigate-outline"
                        size={14}
                        color={colours.saffron || '#BF5B21'}
                      />
                      <Text style={styles.trackOrderBtnText}>Track Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* =====================================================================
          ORDER TRACKING STATUS MODAL
         ===================================================================== */}
      <Modal
        visible={!!selectedTrackingOrder}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedTrackingOrder(null)}>
        <View style={styles.modalOverlay}>
          {/* Tapping dark backdrop immediately closes modal */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setSelectedTrackingOrder(null)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close tracking modal"
          />
          <View style={styles.trackingModalCard}>
            <View style={styles.trackingHeaderRow}>
              <View>
                <Text style={styles.trackingModalTitle}>Order Tracking</Text>
                <Text style={styles.trackingOrderNumber}>
                  #{selectedTrackingOrder?.orderNumber}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedTrackingOrder(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={20} color="#161413" />
              </TouchableOpacity>
            </View>

            {/* Stepper Timeline */}
            <View style={styles.stepperContainer}>
              {trackingSteps.map((step, idx) => {
                const isLast = idx === trackingSteps.length - 1;

                return (
                  <View key={idx} style={styles.stepItemRow}>
                    <View style={styles.stepDotCol}>
                      <View
                        style={[
                          styles.stepDot,
                          step.completed && styles.stepDotCompleted,
                          step.current && styles.stepDotCurrent,
                        ]}>
                        {step.completed ? (
                          <Icon name="checkmark" size={11} color="#FFFFFF" />
                        ) : step.current ? (
                          <View style={styles.currentDotInner} />
                        ) : null}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.stepLine,
                            step.completed && styles.stepLineCompleted,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepTextCol}>
                      <Text
                        style={[
                          styles.stepTitle,
                          (step.completed || step.current) && styles.stepTitleActive,
                        ]}>
                        {step.title}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setSelectedTrackingOrder(null)}
              style={styles.closeTrackingBtn}>
              <Text style={styles.closeTrackingBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7EFE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE3CE',
  },
  emptyTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 17,
    color: '#161413',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12.5,
    color: '#6E675D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  discoverBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 22,
    gap: 8,
    shadowColor: colours.saffron || '#BF5B21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  discoverBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  ordersCol: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0ECE4',
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumberText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13.5,
    color: '#161413',
  },
  orderDateText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#8A8277',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#FDF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 10.5,
    color: colours.saffron || '#BF5B21',
  },
  divider: {
    height: 1,
    backgroundColor: '#F4EFE6',
    marginVertical: 10,
  },
  itemsCol: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumbContainer: {
    width: 44,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#ECE7DE',
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  itemThumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailsCol: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: 'Comfortaa-Bold',
    fontSize: 12.5,
    color: '#161413',
  },
  itemCode: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10.5,
    color: '#7D756A',
    marginTop: 1,
  },
  itemQty: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10.5,
    color: '#8A8277',
    marginTop: 1,
  },
  itemPrice: {
    fontFamily: 'Manrope-Bold',
    fontSize: 13,
    color: '#161413',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 11,
    color: '#7D756A',
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 9.5,
    color: '#8A8277',
  },
  totalValue: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15,
    color: '#161413',
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FDF7F2',
    borderWidth: 1,
    borderColor: '#F3E4D6',
  },
  trackOrderBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 11.5,
    color: colours.saffron || '#BF5B21',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  trackingModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    zIndex: 2,
    elevation: 8,
  },
  trackingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingModalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 15.5,
    color: '#161413',
  },
  trackingOrderNumber: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: colours.saffron || '#BF5B21',
    marginTop: 2,
  },
  stepperContainer: {
    paddingLeft: 4,
    marginBottom: 16,
  },
  stepItemRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  stepDotCol: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ECE7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colours.saffron || '#BF5B21',
  },
  stepDotCurrent: {
    borderWidth: 1.5,
    borderColor: colours.saffron || '#BF5B21',
    backgroundColor: colours.saffron || '#BF5B21',
  },
  currentDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ECE7DE',
    marginVertical: 2,
  },
  stepLineCompleted: {
    backgroundColor: colours.saffron || '#BF5B21',
  },
  stepTextCol: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 1,
  },
  stepTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12,
    color: '#8A8277',
  },
  stepTitleActive: {
    color: '#161413',
  },
  stepDesc: {
    fontFamily: 'Manrope-Medium',
    fontSize: 10.5,
    color: '#7D756A',
    marginTop: 1,
  },
  closeTrackingBtn: {
    backgroundColor: colours.saffron || '#BF5B21',
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeTrackingBtnText: {
    fontFamily: 'Manrope-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
