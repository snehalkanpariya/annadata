import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Header from "./src/components/Header";
import ExploreScreen from "./src/screens/ExploreScreen";
import BookingModalScreen from "./src/screens/BookingModalScreen";
import RenterBookingsScreen from "./src/screens/RenterBookingsScreen";
import ProviderRequestsScreen from "./src/screens/ProviderRequestsScreen";
import { colors } from "./src/theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const { activeRole } = useAuth();

  return (
    <View style={styles.tabContainer}>
      <Header title="Equipment Rental Hub" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = "leaf";
            if (route.name === "Explore") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "MyBookings") {
              iconName = focused ? "calendar" : "calendar-outline";
            } else if (route.name === "ProviderRequests") {
              iconName = focused ? "construct" : "construct-outline";
            }
            return <Ionicons name={iconName} size={size || 22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ title: "Explore" }}
        />
        <Tab.Screen
          name="MyBookings"
          component={RenterBookingsScreen}
          options={{
            title: "My Bookings",
          }}
        />
        <Tab.Screen
          name="ProviderRequests"
          component={ProviderRequestsScreen}
          options={{
            title: "Owner Requests",
            tabBarBadge: activeRole === "PROVIDER" ? "New" : null,
            tabBarBadgeStyle: styles.badgeStyle,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.primaryDark} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="BookingModal"
              component={BookingModalScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeStyle: {
    backgroundColor: colors.secondary,
    color: "#FFFFFF",
    fontSize: 10,
  },
});
