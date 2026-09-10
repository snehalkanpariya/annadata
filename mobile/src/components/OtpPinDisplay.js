import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function OtpPinDisplay({ otp }) {
  const otpString = String(otp || "----").padStart(4, "0");
  const digits = otpString.split("").slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="key-outline" size={18} color={colors.primary} />
          <Text style={styles.headerTitle}>Job Completion OTP</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>SHARE WITH PROVIDER</Text>
        </View>
      </View>

      {/* Prominent 4-Box PIN Layout */}
      <View style={styles.pinContainer}>
        {digits.map((digit, index) => (
          <View key={index} style={styles.pinBox}>
            <Text style={styles.pinDigit}>{digit}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Provide this 4-digit PIN to the equipment owner once job is complete to verify.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#14532D",
    textTransform: "uppercase",
  },
  tag: {
    backgroundColor: colors.secondaryLight,
    borderColor: "#FDE68A",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondaryDark,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: 6,
  },
  pinBox: {
    width: 48,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinDigit: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  footerNote: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "500",
  },
});
