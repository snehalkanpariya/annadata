import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMyBookings, updateBookingStatus } from "../api/servicesApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import OtpPinDisplay from "../components/OtpPinDisplay";
import { colors } from "../theme/colors";

const FILTER_TABS = ["ALL", "ACTIVE", "COMPLETED", "CANCELLED"];

const MOCK_RENTER_BOOKINGS = [
  {
    _id: "book_001",
    serviceId: {
      _id: "64f1abcd0001",
      title: "Mahindra 575 DI Tractor (45 HP)",
      category: "TRACTOR",
      pricing: { rate: 600, rateType: "HOURLY" },
    },
    providerId: { name: "Suresh Patel", phone: "+91 98765 43210" },
    scheduledDate: "2026-08-25T00:00:00.000Z",
    estimatedUnits: 3,
    totalAmount: 1800,
    status: "IN_PROGRESS",
    completionOtp: "4829",
    createdAt: "2026-08-23T10:00:00.000Z",
  },
  {
    _id: "book_002",
    serviceId: {
      _id: "64f1abcd0002",
      title: "Kubota DC-68G Harvester",
      category: "HARVESTER",
      pricing: { rate: 1800, rateType: "PER_ACRE" },
    },
    providerId: { name: "Ramesh Patel", phone: "+91 98123 45678" },
    scheduledDate: "2026-08-26T00:00:00.000Z",
    estimatedUnits: 2,
    totalAmount: 3600,
    status: "ACCEPTED",
    completionOtp: "7153",
    createdAt: "2026-08-22T14:30:00.000Z",
  },
  {
    _id: "book_003",
    serviceId: {
      _id: "64f1abcd0003",
      title: "Kirloskar 5HP Diesel Pump",
      category: "IRRIGATION PUMP",
      pricing: { rate: 250, rateType: "HOURLY" },
    },
    providerId: { name: "Vikram Singh", phone: "+91 97000 11223" },
    scheduledDate: "2026-08-20T00:00:00.000Z",
    estimatedUnits: 4,
    totalAmount: 1000,
    status: "COMPLETED",
    completionOtp: "3391",
    createdAt: "2026-08-19T09:00:00.000Z",
  },
];

export default function RenterBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyBookings();
      if (Array.isArray(data) && data.length > 0) {
        setBookings(data);
      } else {
        setBookings(MOCK_RENTER_BOOKINGS);
      }
    } catch (err) {
      setBookings(MOCK_RENTER_BOOKINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, "CANCELLED");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err) {
      console.warn("[RenterBookingsScreen] Performing local cancellation:", err.message);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "CANCELLED" } : b))
      );
    }
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE")
      return item.status === "REQUESTED" || item.status === "ACCEPTED" || item.status === "IN_PROGRESS";
    if (activeTab === "COMPLETED") return item.status === "COMPLETED";
    if (activeTab === "CANCELLED") return item.status === "CANCELLED";
    return true;
  });

  const renderBookingCard = ({ item }) => {
    const serviceTitle = item.serviceId?.title || "Equipment Rental";
    const category = item.serviceId?.category || "EQUIPMENT";
    const isActive = item.status === "ACCEPTED" || item.status === "IN_PROGRESS" || item.status === "REQUESTED";
    const dateFormatted = new Date(item.scheduledDate || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{category}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.cardTitle}>{serviceTitle}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>{dateFormatted}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>{item.estimatedUnits} Unit(s)</Text>
          </View>
        </View>

        {/* PROMINENT 4-BOX OTP PIN LAYOUT FOR ACTIVE JOBS */}
        {isActive && item.completionOtp ? (
          <OtpPinDisplay otp={item.completionOtp} />
        ) : null}

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.costLabel}>TOTAL COST</Text>
            <Text style={styles.costAmount}>
              ₹{(item.totalAmount || 0).toLocaleString()}
            </Text>
          </View>

          {item.status === "REQUESTED" || item.status === "ACCEPTED" ? (
            <TouchableOpacity
              onPress={() => handleCancelBooking(item._id)}
              style={styles.cancelBtn}
            >
              <Ionicons name="close-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>MY RENTAL ORDERS</Text>
      </View>

      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.filterTab, isSelected ? styles.filterTabActive : null]}
            >
              <Text style={[styles.filterTabText, isSelected ? styles.filterTabTextActive : null]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <LoadingSpinner message="Fetching your bookings..." />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            error ? <ErrorMessage message={error} onRetry={fetchBookings} /> : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Bookings Found"
              message={`You have no ${activeTab.toLowerCase()} rental bookings.`}
              actionText="Refresh List"
              onAction={fetchBookings}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#BBF7D0",
    letterSpacing: 0.5,
  },
  filterBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderColor: "#F1F5F9",
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.secondaryLight,
    borderColor: "#FDE68A",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondaryDark,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  costLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: "700",
  },
  costAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  cancelBtn: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
  },
});
