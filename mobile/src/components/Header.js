import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function Header({ title }) {
  const { activeRole, toggleUserRole } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.row}>
        <View style={styles.leftBrand}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={22} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.brandName}>Annadata</Text>
            <Text style={styles.subTitle}>{title || "Equipment Rental Platform"}</Text>
          </View>
        </View>

        {/* Mode Switcher Pill */}
        <TouchableOpacity
          onPress={() => toggleUserRole()}
          activeOpacity={0.8}
          style={styles.roleBtn}
        >
          <Ionicons
            name={activeRole === "RENTER" ? "person-outline" : "construct-outline"}
            size={14}
            color={colors.secondary}
          />
          <Text style={styles.roleText}>
            {activeRole === "RENTER" ? "Renter Mode" : "Provider Mode"}
          </Text>
          <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primaryDark,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#22C55E",
    borderWidth: 1,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 11,
    color: "#BBF7D0",
    fontWeight: "600",
  },
  roleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14532D",
    borderColor: "#22C55E",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
