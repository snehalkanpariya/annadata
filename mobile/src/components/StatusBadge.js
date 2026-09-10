import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function StatusBadge({ status }) {
  let badgeBg = "#F1F5F9";
  let badgeText = "#475569";
  let badgeBorder = "#CBD5E1";
  let statusLabel = status || "UNKNOWN";

  switch (status) {
    case "REQUESTED":
    case "PENDING":
      badgeBg = "#FEF3C7";
      badgeText = "#92400E";
      badgeBorder = "#FCD34D";
      statusLabel = "Requested";
      break;
    case "ACCEPTED":
    case "CONFIRMED":
      badgeBg = "#EFF6FF";
      badgeText = "#1E40AF";
      badgeBorder = "#93C5FD";
      statusLabel = "Accepted";
      break;
    case "IN_PROGRESS":
      badgeBg = "#F3E8FF";
      badgeText = "#6B21A8";
      badgeBorder = "#D8B4FE";
      statusLabel = "In Progress";
      break;
    case "COMPLETED":
      badgeBg = "#DCFCE7";
      badgeText = "#166534";
      badgeBorder = "#86EFAC";
      statusLabel = "Completed";
      break;
    case "CANCELLED":
    case "DECLINED":
      badgeBg = "#FEF2F2";
      badgeText = "#991B1B";
      badgeBorder = "#FCA5A5";
      statusLabel = "Cancelled";
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
      <Text style={[styles.text, { color: badgeText }]}>{statusLabel.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
