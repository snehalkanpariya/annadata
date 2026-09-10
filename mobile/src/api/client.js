import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Auto-detect computer IP address when scanning via Expo Go on physical device or emulator
const getDynamicBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip) {
      return `http://${ip}:5000/api`;
    }
  }
  return Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api";
};

export const API_BASE_URL = getDynamicBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Ignore token fetch error
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred. Please try again.";
    
    if (error.response) {
      const data = error.response.data;
      errorMessage = data?.message || data?.error || `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "Unable to connect to server. Please check your network or server status.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
