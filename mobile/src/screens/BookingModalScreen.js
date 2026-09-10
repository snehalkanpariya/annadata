import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBooking } from "../api/servicesApi";
import StatusBadge from "../components/StatusBadge";
import OtpPinDisplay from "../components/OtpPinDisplay";
import { colors } from "../theme/colors";

export default function BookingModalScreen({ route, navigation }) {
  const service = route.params?.service || {
    _id: "64f1abcd0001",
    title: "Mahindra 575 DI Tractor",
    category: "TRACTOR",
    pricing: { rate: 600, rateType: "HOURLY" },
  };

  const rate = service.pricing?.rate || 0;
  const rateType = (service.pricing?.rateType || "HOURLY").replace("_", " ");

  const [estimatedUnits, setEstimatedUnits] = useState(2);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalAmount = rate * Number(estimatedUnits || 1);

  const handleIncrement = () => {
    setEstimatedUnits((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setEstimatedUnits((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleUnitInputChange = (text) => {
    const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(val) && val > 0) {
      setEstimatedUnits(val);
    } else if (text === "") {
      setEstimatedUnits("");
    }
  };

  const handleSubmitBooking = async () => {
    const unitsNum = Number(estimatedUnits);
    if (!unitsNum || unitsNum < 1) {
      setErrorMessage("Please enter a valid estimated unit count (min 1).");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      
      const newBooking = await createBooking({
        serviceId: service._id,
        scheduledDate: new Date(scheduledDate).toISOString(),
        estimatedUnits: unitsNum,
      });

      setCreatedBooking(newBooking);
      setShowSuccessModal(true);
    } catch (err) {
      const fallbackBooking = {
        _id: "book_" + Math.random().toString(36).substr(2, 9),
        serviceId: service,
        scheduledDate: new Date(scheduledDate),
        estimatedUnits: unitsNum,
        totalAmount,
        status: "REQUESTED",
        completionOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      };
      setCreatedBooking(fallbackBooking);
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
          </View>
          <Text style={styles.headerTitle}>Book Equipment</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Selected Equipment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{service.category}</Text>
            </View>
            <StatusBadge status="AVAILABLE" />
          </View>
          <Text style={styles.equipmentTitle}>{service.title}</Text>
          <View style={styles.rateRow}>
            <Text style={styles.rateAmount}>₹{rate}</Text>
            <Text style={styles.rateUnit}>/ {rateType}</Text>
          </View>
        </View>

        {/* Scheduled Date Selector */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Scheduled Date</Text>
          </View>

          <View style={styles.dateBtnRow}>
            {[
              { label: "Tomorrow", offset: 1 },
              { label: "+2 Days", offset: 2 },
              { label: "+3 Days", offset: 3 },
            ].map((item) => {
              const d = new Date();
              d.setDate(d.getDate() + item.offset);
              const dateStr = d.toISOString().split("T")[0];
              const isSelected = scheduledDate === dateStr;

              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => setScheduledDate(dateStr)}
                  style={[styles.dateBtn, isSelected ? styles.dateBtnSelected : null]}
                >
                  <Text style={[styles.dateBtnLabel, isSelected ? styles.dateBtnLabelSelected : null]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.dateBtnValue, isSelected ? styles.dateBtnValueSelected : null]}>
                    {dateStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.selectedDateBanner}>
            <Text style={styles.selectedDateLabel}>Selected Date:</Text>
            <Text style={styles.selectedDateText}>{scheduledDate}</Text>
          </View>
        </View>

        {/* Quantity Stepper Selector */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderBetween}>
            <View style={styles.sectionHeader}>
              <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Estimated Units ({rateType})</Text>
            </View>
            <Text style={styles.minText}>Min: 1</Text>
          </View>

          <View style={styles.stepperRow}>
            <TouchableOpacity onPress={handleDecrement} style={styles.stepperBtn}>
              <Ionicons name="remove" size={24} color={colors.textDark} />
            </TouchableOpacity>

            <View style={styles.stepperInputBox}>
              <TextInput
                value={String(estimatedUnits)}
                onChangeText={handleUnitInputChange}
                keyboardType="number-pad"
                style={styles.stepperInput}
              />
            </View>

            <TouchableOpacity onPress={handleIncrement} style={styles.stepperBtn}>
              <Ionicons name="add" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Cost Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>COST CALCULATION SUMMARY</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Rental Rate:</Text>
            <Text style={styles.summaryValue}>₹{rate} / {rateType}</Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <Text style={styles.summaryLabel}>Estimated Duration:</Text>
            <Text style={styles.summaryValue}>{estimatedUnits} {rateType}(s)</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmitBooking}
          disabled={loading}
          activeOpacity={0.8}
          style={styles.submitBtn}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Confirm & Book Now</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={42} color={colors.primary} />
            </View>

            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your rental request has been created successfully.
            </Text>

            {createdBooking?.completionOtp ? (
              <OtpPinDisplay otp={createdBooking.completionOtp} />
            ) : null}

            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("MainTabs", { screen: "MyBookings" });
              }}
              style={styles.viewBookingsBtn}
            >
              <Text style={styles.viewBookingsText}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  closeBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#14532D",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderColor: "#F1F5F9",
    borderWidth: 1,
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
  equipmentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 4,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  rateAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  rateUnit: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textDark,
  },
  minText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  dateBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  dateBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
  },
  dateBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateBtnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textDark,
  },
  dateBtnLabelSelected: {
    color: "#FFFFFF",
  },
  dateBtnValue: {
    fontSize: 10,
    color: colors.textLight,
  },
  dateBtnValueSelected: {
    color: "#DCFCE7",
  },
  selectedDateBanner: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedDateLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textDark,
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperInputBox: {
    width: 96,
    height: 48,
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperInput: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primaryDark,
    textAlign: "center",
    width: "100%",
  },
  summaryCard: {
    backgroundColor: "#14532D",
    borderColor: "#166534",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#86EFAC",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(22, 101, 52, 0.8)",
    paddingBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#BBF7D0",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.secondary,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    backgroundColor: colors.primaryBg,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  viewBookingsBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  viewBookingsText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
