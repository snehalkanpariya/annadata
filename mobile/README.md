# Annadata Rentals - React Native Mobile App (Expo)

A complete React Native mobile frontend for the **Annadata Equipment Rental Platform** built with **Expo**, **React Navigation**, and **Axios**.

---

## 🎨 Features & Design System
- **Theme Palette**:
  - Primary: Forest Green (`#16A34A` / `#15803D`)
  - Secondary: Harvest Gold / Amber (`#F59E0B`)
  - Background: Off-white (`#F8FAFC`) with elevated white cards (`#FFFFFF`)
  - Typography: Bold pricing and rate display (`font-weight: 900`)
- **ExploreScreen**: Search machinery, category filter bar (`TRACTOR`, `HARVESTER`, `IRRIGATION PUMP`, `SPRAYER`, `THRESHER`), distance snippet, and "Book Now" trigger.
- **BookingModalScreen**: Quantity stepper, date selection, live price calculator (`rate * units`), confirmation with 4-digit PIN overlay.
- **RenterBookingsScreen**: Booking list with filter tabs (`All`, `Active`, `Completed`, `Cancelled`) and **prominent 4-box PIN layout** (`[ 4 ] [ 8 ] [ 2 ] [ 9 ]`) for active jobs.
- **ProviderRequestsScreen**: Incoming request cards with Accept/Decline actions, Start Job action, and **4-digit OTP Verification Modal** to complete ongoing jobs.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```

Scan the QR code with **Expo Go** on Android or iOS camera to view the app!

### 3. Run Automated Tests
```bash
npm test
```

---

## 📁 Directory Structure
```
mobile/
├── App.js                      # Root component with Tab & Stack Navigators
├── index.js                    # Expo root entry point
├── app.json                    # Expo project configuration
├── package.json                # Project dependencies & scripts
├── __tests__/                  # Jest unit test suite
│   ├── api.test.js             # API integration unit tests
│   └── theme.test.js           # Design palette unit tests
└── src/
    ├── api/
    │   ├── client.js           # Axios client with AsyncStorage token & IP auto-detection
    │   └── servicesApi.js      # Service & Booking API methods
    ├── context/
    │   └── AuthContext.js      # Auth & Role Switcher (Renter vs Provider)
    ├── theme/
    │   └── colors.js           # Design system palette constants
    ├── components/
    │   ├── Header.js           # Top navigation banner & mode switcher pill
    │   ├── StatusBadge.js      # Booking status badges
    │   ├── OtpPinDisplay.js    # Prominent 4-box OTP PIN layout
    │   ├── OtpInputModal.js    # Provider 4-digit PIN verification modal
    │   ├── LoadingSpinner.js   # Loading indicator
    │   ├── ErrorMessage.js     # Error alert banner
    │   └── EmptyState.js       # Empty state display
    └── screens/
        ├── ExploreScreen.js        # Equipment search & listing cards
        ├── BookingModalScreen.js    # Interactive booking modal & cost calculator
        ├── RenterBookingsScreen.js  # Renter bookings with 4-box OTP PIN
        └── ProviderRequestsScreen.js# Owner incoming requests & OTP verification
```
