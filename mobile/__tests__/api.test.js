import { getServices, createBooking, getMyBookings, getProviderRequests, updateBookingStatus } from "../src/api/servicesApi";

// Mock the apiClient module
jest.mock("../src/api/client", () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    },
  };
});

import apiClient from "../src/api/client";

describe("Services & Booking API Methods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. getServices should fetch equipment listings", async () => {
    const mockData = [
      { _id: "s1", title: "Tractor Mahindra 575", category: "TRACTOR", pricing: { rate: 600, rateType: "HOURLY" } },
    ];
    apiClient.get.mockResolvedValueOnce({ data: { data: mockData } });

    const result = await getServices("TRACTOR");
    expect(apiClient.get).toHaveBeenCalledWith("/services", { params: { category: "TRACTOR" } });
    expect(result).toEqual(mockData);
  });

  test("2. createBooking should submit booking request and return booking document with completionOtp", async () => {
    const mockPayload = {
      serviceId: "s1",
      scheduledDate: "2026-09-15T00:00:00.000Z",
      estimatedUnits: 3,
    };
    const mockResponse = {
      _id: "b101",
      serviceId: "s1",
      totalAmount: 1800,
      completionOtp: "4829",
      status: "REQUESTED",
    };
    apiClient.post.mockResolvedValueOnce({ data: { data: mockResponse } });

    const result = await createBooking(mockPayload);
    expect(apiClient.post).toHaveBeenCalledWith("/booking/createbooking", {
      serviceId: "s1",
      scheduledDate: "2026-09-15T00:00:00.000Z",
      estimatedUnits: 3,
    });
    expect(result).toEqual(mockResponse);
  });

  test("3. getMyBookings should fetch user bookings", async () => {
    const mockBookings = [
      { _id: "b101", totalAmount: 1800, status: "IN_PROGRESS", completionOtp: "4829" },
    ];
    apiClient.get.mockResolvedValueOnce({ data: { data: mockBookings } });

    const result = await getMyBookings();
    expect(apiClient.get).toHaveBeenCalledWith("/booking/my-bookings");
    expect(result).toEqual(mockBookings);
  });

  test("4. getProviderRequests should fetch incoming requests for owner", async () => {
    const mockRequests = [
      { _id: "req1", totalAmount: 1800, status: "REQUESTED" },
    ];
    apiClient.get.mockResolvedValueOnce({ data: { data: mockRequests } });

    const result = await getProviderRequests();
    expect(apiClient.get).toHaveBeenCalledWith("/booking/provider-requests");
    expect(result).toEqual(mockRequests);
  });

  test("5. updateBookingStatus should send PATCH status and optional completionOtp", async () => {
    const mockUpdated = { _id: "b101", status: "COMPLETED" };
    apiClient.patch.mockResolvedValueOnce({ data: { data: mockUpdated } });

    const result = await updateBookingStatus("b101", "COMPLETED", "4829");
    expect(apiClient.patch).toHaveBeenCalledWith("/booking/b101/status", {
      status: "COMPLETED",
      completionOtp: "4829",
    });
    expect(result).toEqual(mockUpdated);
  });
});
