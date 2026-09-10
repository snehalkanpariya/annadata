import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="alert-circle" size={20} color={colors.danger} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.errorLabel}>Error</Text>
          <Text style={styles.errorText} numberOfLines={2}>
            {message || "Failed to connect to backend server."}
          </Text>
        </View>
      </View>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
          <Ionicons name="refresh" size={14} color="#FFFFFF" />
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
  },
  errorLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.danger,
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "600",
  },
  retryBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
