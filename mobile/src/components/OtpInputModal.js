import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function OtpInputModal({ visible, onClose, onSubmit, bookingTitle, loading }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newPin = [...pin];

    if (cleanText.length > 0) {
      newPin[index] = cleanText[cleanText.length - 1];
      setPin(newPin);
      setErrorMsg("");

      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    } else {
      newPin[index] = "";
      setPin(newPin);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && pin[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = pin.join("");
    if (fullCode.length !== 4) {
      setErrorMsg("Please enter the complete 4-digit PIN.");
      return;
    }
    setErrorMsg("");
    onSubmit(fullCode);
  };

  const resetAndClose = () => {
    setPin(["", "", "", ""]);
    setErrorMsg("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.backdrop}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.title}>Complete Job</Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} disabled={loading}>
              <Ionicons name="close-circle-outline" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Enter the 4-digit completion OTP provided by the renter for:
          </Text>

          {bookingTitle ? (
            <View style={styles.equipmentBanner}>
              <Text style={styles.equipmentTitle}>{bookingTitle}</Text>
            </View>
          ) : null}

          {/* 4-Digit Input Boxes */}
          <View style={styles.pinRow}>
            {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.pinInput,
                  digit ? styles.pinInputActive : null,
                ]}
              />
            ))}
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={resetAndClose}
              disabled={loading}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Verify OTP</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  equipmentBanner: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  equipmentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
  },
  pinInput: {
    width: 56,
    height: 64,
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderWidth: 2,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: colors.textDark,
  },
  pinInputActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
    color: colors.primaryDark,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: "600",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelBtnText: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 14,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
