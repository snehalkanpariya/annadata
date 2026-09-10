import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function LoadingSpinner({ message = "Loading machinery..." }) {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerBox}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  spinnerBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderColor: colors.primaryLight,
    borderWidth: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
