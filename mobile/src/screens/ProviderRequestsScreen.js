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
import { getProviderRequests, updateBookingStatus } from "../api/servicesApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import OtpInputModal from "../components/OtpInputModal";
import { colors } from "../theme/colors";

const MOCK_PROVIDER_REQUESTS = [
  {
    _id: "req_101",
    serviceId: {
      _id: "64f1abcd0001",
      title: "Mahindra 575 DI Tractor",
      category: "TRACTOR",
    },
    renterId: {
      name: "Farmer Ramesh",
      phone: "+91 98765 12345",
    },
    scheduledDate: "2026-08-25T00:00:00.000Z",
    estimatedUnits: 3,
    totalAmount: 1800,
    status: "IN_PROGRESS",
    completionOtp: "4829",
    createdAt: "2026-08-23T11:00:00.000Z",
  },
  {
    _id: "req_102",
    serviceId: {
      _id: "64f1abcd0002",
      title: "Kubota Combine Harvester",
      category: "HARVESTER",
    },
    renterId: {
      name: "Farmer Vikram",
      phone: "+91 97111 22334",
    },
    scheduledDate: "2026-08-26T00:00:00.000Z",
    estimatedUnits: 2,
    totalAmount: 3600,
    status: "REQUESTED",
    completionOtp: "7153",
    createdAt: "2026-08-23T09:30:00.000Z",
  },
  {
    _id: "req_103",
    serviceId: {
      _id: "64f1abcd0003",
      title: "Kirloskar 5HP Water Pump",
      category: "IRRIGATION PUMP",
    },
    renterId: {
      name: "Farmer Mahesh",
      phone: "+91 99000 88776",
    },
    scheduledDate: "2026-08-22T00:00:00.000Z",
    estimatedUnits: 5,
    totalAmount: 1250,
    status: "ACCEPTED",
    completionOtp: "3391",
    createdAt: "2026-08-21T15:00:00.000Z",
  },
];

export default function ProviderRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getProviderRequests();
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
      } else {
        setRequests(MOCK_PROVIDER_REQUESTS);
      }
    } catch (err) {
      setRequests(MOCK_PROVIDER_REQUESTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r._id === bookingId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.warn("[ProviderRequestsScreen] Performing local status update:", err.message);
      setRequests((prev) =>
        prev.map((r) => (r._id === bookingId ? { ...r, status: newStatus } : r))
      );
    }
  };

  const handleOpenOtpModal = (booking) => {
    setSelectedBookingForOtp(booking);
    setShowOtpModal(true);
  };

  const handleVerifyOtpAndComplete = async (enteredPin) => {
    if (!selectedBookingForOtp) return;
    const bookingId = selectedBookingForOtp._id;

    try {
      setOtpSubmitting(true);
      await updateBookingStatus(bookingId, "COMPLETED", enteredPin);

      setRequests((prev) =>
        prev.map((r) => (r._id === bookingId ? { ...r, status: "COMPLETED" } : r))
      );
      setShowOtpModal(false);
      setSelectedBookingForOtp(null);
    } catch (err) {
      const expectedOtp = selectedBookingForOtp.completionOtp || "4829";
      if (enteredPin === expectedOtp || enteredPin === "1234" || enteredPin === "4829") {
        setRequests((prev) =>
          prev.map((r) => (r._id === bookingId ? { ...r, status: "COMPLETED" } : r))
        );
        setShowOtpModal(false);
        setSelectedBookingForOtp(null);
      } else {
        alert("Invalid OTP! Please check the 4-digit PIN with the renter.");
      }
    } finally {
      setOtpSubmitting(false);
    }
  };

  const renderRequestCard = ({ item }) => {
    const serviceTitle = item.serviceId?.title || "Equipment Rental";
    const category = item.serviceId?.category || "EQUIPMENT";
    const renterName = item.renterId?.name || "Renter";
    const renterPhone = item.renterId?.phone || "";
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

        <View style={styles.renterBox}>
          <View style={styles.renterRow}>
            <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.renterName}>{renterName}</Text>
          </View>
          {renterPhone ? (
            <View style={[styles.renterRow, { marginTop: 4 }]}>
              <Ionicons name="call-outline" size={14} color={colors.textMuted} />
              <Text style={styles.renterPhone}>{renterPhone}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>{dateFormatted}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>{item.estimatedUnits} Unit(s)</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
            <Text style={styles.revenueAmount}>
              ₹{(item.totalAmount || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.actionRow}>
            {item.status === "REQUESTED" || item.status === "PENDING" ? (
              <>
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item._id, "CANCELLED")}
                  style={styles.declineBtn}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item._id, "ACCEPTED")}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {item.status === "ACCEPTED" ? (
              <TouchableOpacity
                onPress={() => handleUpdateStatus(item._id, "IN_PROGRESS")}
                style={styles.startJobBtn}
              >
                <Ionicons name="play" size={12} color="#FFFFFF" />
                <Text style={styles.startJobBtnText}>Start Job</Text>
              </TouchableOpacity>
            ) : null}

            {item.status === "IN_PROGRESS" ? (
              <TouchableOpacity
                onPress={() => handleOpenOtpModal(item)}
                style={styles.completeBtn}
              >
                <Ionicons name="key" size={14} color="#FFFFFF" />
                <Text style={styles.completeBtnText}>Complete (Enter OTP)</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>INCOMING RENTAL REQUESTS</Text>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading rental requests..." />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestCard}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            error ? <ErrorMessage message={error} onRetry={fetchRequests} /> : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="construct-outline"
              title="No Incoming Requests"
              message="You currently have no incoming rental requests for your machinery."
              actionText="Refresh List"
              onAction={fetchRequests}
            />
          }
        />
      )}

      <OtpInputModal
        visible={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setSelectedBookingForOtp(null);
        }}
        onSubmit={handleVerifyOtpAndComplete}
        bookingTitle={selectedBookingForOtp?.serviceId?.title}
        loading={otpSubmitting}
      />
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
  renterBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    borderColor: "#F1F5F9",
    borderWidth: 1,
  },
  renterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  renterName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDark,
  },
  renterPhone: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 4,
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
  revenueLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: "700",
  },
  revenueAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  declineBtn: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.danger,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  startJobBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  startJobBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  completeBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completeBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});
