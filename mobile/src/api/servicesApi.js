import apiClient from "./client";

/**
 * 1. GET /api/services
 * Fetches all available equipment listings with optional category filter
 */
export const getServices = async (category = null) => {
  try {
    const params = {};
    if (category && category !== "ALL") {
      params.category = category;
    }
    const response = await apiClient.get("/services", { params });
    return response.data?.data || response.data || [];
  } catch (error) {
    // Re-throw without noisy terminal stack dumps
    throw error;
  }
};

/**
 * Proximity fetch: GET /api/services/nearby
 */
export const getNearbyServices = async (latitude, longitude, radius = 25, category = null) => {
  try {
    const params = { latitude, longitude, radius };
    if (category && category !== "ALL") {
      params.category = category;
    }
    const response = await apiClient.get("/services/nearby", { params });
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * 2. POST /api/booking/createbooking
 * Body: { serviceId, scheduledDate, estimatedUnits }
 */
export const createBooking = async ({ serviceId, scheduledDate, estimatedUnits }) => {
  try {
    const response = await apiClient.post("/booking/createbooking", {
      serviceId,
      scheduledDate,
      estimatedUnits: Number(estimatedUnits),
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 3. GET /api/booking/my-bookings
 * Returns user's bookings with populated serviceId and providerId
 */
export const getMyBookings = async () => {
  try {
    const response = await apiClient.get("/booking/my-bookings");
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * 4. GET /api/booking/provider-requests
 * Returns incoming requests for the owner's equipment
 */
export const getProviderRequests = async () => {
  try {
    const response = await apiClient.get("/booking/provider-requests");
    return response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * 5. PATCH /api/booking/:id/status
 * Body: { status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED", completionOtp?: string }
 */
export const updateBookingStatus = async (bookingId, status, completionOtp = null) => {
  try {
    const payload = { status };
    if (completionOtp) {
      payload.completionOtp = completionOtp;
    }
    const response = await apiClient.patch(`/booking/${bookingId}/status`, payload);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};
