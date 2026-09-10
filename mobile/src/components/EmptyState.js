import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function EmptyState({ icon = "file-tray-outline", title, message, actionText, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title || "No items found"}</Text>
      <Text style={styles.message}>
        {message || "There are no listings or requests available at the moment."}
      </Text>
      {onAction && actionText ? (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginVertical: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
