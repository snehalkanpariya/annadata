import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getServices } from "../api/servicesApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { colors } from "../theme/colors";

const CATEGORIES = [
  "ALL",
  "TRACTOR",
  "HARVESTER",
  "IRRIGATION PUMP",
  "SPRAYER",
  "THRESHER",
  "OTHER",
];

const MOCK_SEED_SERVICES = [
  {
    _id: "64f1abcd0001",
    title: "Mahindra 575 DI Tractor (45 HP)",
    category: "TRACTOR",
    pricing: { rate: 600, rateType: "HOURLY" },
    location: { type: "Point", coordinates: [72.8777, 19.076] },
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80"],
    description: "Well maintained tractor with heavy-duty rotavator attachment.",
  },
  {
    _id: "64f1abcd0002",
    title: "Kubota DC-68G Harvester",
    category: "HARVESTER",
    pricing: { rate: 1800, rateType: "PER_ACRE" },
    location: { type: "Point", coordinates: [72.88, 19.08] },
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1595838788647-75896a2f7c0a?auto=format&fit=crop&w=600&q=80"],
    description: "High performance paddy & wheat combine harvester.",
  },
  {
    _id: "64f1abcd0003",
    title: "Kirloskar 5HP Diesel Irrigation Pump",
    category: "IRRIGATION PUMP",
    pricing: { rate: 250, rateType: "HOURLY" },
    location: { type: "Point", coordinates: [72.865, 19.07] },
    isAvailable: true,
    images: [],
    description: "High suction power water pump for agricultural fields.",
  },
  {
    _id: "64f1abcd0004",
    title: "ASPEE Battery Operated Sprayer",
    category: "SPRAYER",
    pricing: { rate: 150, rateType: "HOURLY" },
    location: { type: "Point", coordinates: [72.89, 19.09] },
    isAvailable: false,
    images: [],
    description: "16-Liter backpack sprayer for quick crop treatment.",
  },
];

export default function ExploreScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setError(null);
      const data = await getServices(selectedCategory);
      if (Array.isArray(data) && data.length > 0) {
        setServices(data);
      } else {
        const filteredMock = selectedCategory === "ALL" 
          ? MOCK_SEED_SERVICES 
          : MOCK_SEED_SERVICES.filter(s => s.category === selectedCategory);
        setServices(filteredMock);
      }
    } catch (err) {
      const filteredMock = selectedCategory === "ALL" 
        ? MOCK_SEED_SERVICES 
        : MOCK_SEED_SERVICES.filter(s => s.category === selectedCategory);
      setServices(filteredMock);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchListings();
  }, [fetchListings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const filteredServices = services.filter((item) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(query);
    const categoryMatch = item.category?.toLowerCase().includes(query);
    return titleMatch || categoryMatch;
  });

  const renderCategoryChip = (cat) => {
    const isSelected = selectedCategory === cat;
    return (
      <TouchableOpacity
        key={cat}
        onPress={() => setSelectedCategory(cat)}
        style={[
          styles.chip,
          isSelected ? styles.chipSelected : styles.chipUnselected,
        ]}
      >
        <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
          {cat}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEquipmentCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;
    const rateFormatted = `₹${item.pricing?.rate || 0}`;
    const rateTypeFormatted = (item.pricing?.rateType || "HOURLY").replace("_", " ");

    return (
      <View style={styles.card}>
        <View style={styles.cardBanner}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="construct-outline" size={44} color="#94A3B8" />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}

          <View style={styles.availabilityBadge}>
            <View style={[styles.statusDot, { backgroundColor: item.isAvailable ? colors.primary : "#94A3B8" }]} />
            <Text style={[styles.statusText, { color: item.isAvailable ? "#14532D" : "#475569" }]}>
              {item.isAvailable ? "AVAILABLE NOW" : "IN USE"}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
            <Text style={styles.locationText}>
              Location: {item.location?.coordinates ? `${item.location.coordinates[1]?.toFixed(2)}, ${item.location.coordinates[0]?.toFixed(2)} (2.4 km away)` : "Nearby Farm"}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.rateLabel}>RENTAL RATE</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>{rateFormatted}</Text>
                <Text style={styles.priceUnit}>/ {rateTypeFormatted}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("BookingModal", { service: item })}
              disabled={!item.isAvailable}
              activeOpacity={0.8}
              style={[styles.bookBtn, !item.isAvailable ? styles.bookBtnDisabled : null]}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.searchHeader}>
        <View style={styles.searchInputBox}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tractor, harvester, pump..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderCategoryChip(item)}
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Searching available machinery..." />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={renderEquipmentCard}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            error ? <ErrorMessage message={error} onRetry={fetchListings} /> : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No Equipment Found"
              message={`No machinery matches category "${selectedCategory}" or query "${searchQuery}".`}
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    backgroundColor: colors.primaryDark,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  searchInputBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: "#166534",
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
  },
  categoryBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  chipTextUnselected: {
    color: "#334155",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    borderColor: "#F1F5F9",
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardBanner: {
    height: 170,
    backgroundColor: "#F1F5F9",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
  },
  availabilityBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
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
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rateLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
