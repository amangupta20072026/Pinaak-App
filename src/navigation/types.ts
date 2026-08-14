// src/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  BookingId,
  QuotationId,
  TripId,
  VehicleId,
  DriverId,
  VendorId,
  EnquiryId,
} from '@app-types/ids';
import type { UserRole } from '@rbac/roles';

/* ---------------------- Root ---------------------- */
export type RootStackParamList = {
  SplashIntro: undefined;
  OnboardingFlow: NavigatorScreenParams<OnboardingParamList>;
  AuthFlow: NavigatorScreenParams<AuthParamList>;
  CustomerFlow: NavigatorScreenParams<CustomerStackParamList>;
  VendorFlow: NavigatorScreenParams<VendorStackParamList>;
  DriverFlow: NavigatorScreenParams<DriverStackParamList>;
  UcFlow: NavigatorScreenParams<UcStackParamList>;
};

/* -------------------- Onboarding -------------------- */
// SplashIntro is now handled at the ROOT level (bootstrap gate),
// not inside OnboardingFlow.
export type OnboardingParamList = {
  Onboarding: undefined;
};

/* --------------------- Auth ------------------------- */
export type AuthParamList = {
  Login: { role: UserRole };
  OtpVerify: { role: UserRole; phone: string };
  Support: undefined;
};

/* ------------------ Customer stack ------------------ */
export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  QuotationDetail: { quotationId: QuotationId };
  BookingDetail: { bookingId: BookingId };
  PassengerList: { bookingId: BookingId };
  TripLive: { tripId: TripId };
  ModificationRequest: { bookingId: BookingId };
  AddRemark: { quotationId: QuotationId };
  PayBalance: { bookingId: BookingId };
  GstInvoice: { bookingId: BookingId };
  Feedback: { bookingId: BookingId };
  NotificationCentre: undefined;
  Support: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Quotations: undefined;
  Bookings: undefined;
  Payments: undefined;
  Profile: undefined;
};

/* ------------------- Vendor stack ------------------- */
export type VendorStackParamList = {
  VendorTabs: NavigatorScreenParams<VendorTabParamList>;
  AssignmentDetail: { bookingId: BookingId };
  AcceptAssignment: { bookingId: BookingId };
  RejectAssignment: { bookingId: BookingId };
  VehicleDetail: { vehicleId: VehicleId };
  AddVehicle: undefined;
  VehicleAvailability: { vehicleId: VehicleId };
  DriverDetail: { driverId: DriverId };
  AddDriver: undefined;
  TripDetail: { tripId: TripId };
  ChangeVehicleRequest: { tripId: TripId };
  PaymentDetail: { entryId: string };
  NotificationCentre: undefined;
  Support: undefined;
};

export type VendorTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Fleet: undefined;
  Drivers: undefined;
  Profile: undefined;
};

/* ------------------- Driver stack ------------------- */
export type DriverStackParamList = {
  DriverTabs: NavigatorScreenParams<DriverTabParamList>;
  TripDetail: { tripId: TripId };
  DeclineTrip: { tripId: TripId };
  OtpEntry: { tripId: TripId };
  StartLegKm: { tripId: TripId; leg: number };
  EndLegKm: { tripId: TripId; leg: number };
  Briefing: { tripId: TripId };
  CollectPayment: { tripId: TripId };
  DriverRegistration: undefined;
  NotificationCentre: undefined;
  Support: undefined;
};

export type DriverTabParamList = {
  Home: undefined;
  MyTrips: undefined;
  Emergency: undefined;
  Earnings: undefined;
  Profile: undefined;
};

/* --------------------- UC stack --------------------- */
export type UcStackParamList = {
  UcTabs: NavigatorScreenParams<UcTabParamList>;
  EnquiryDetail: { enquiryId: EnquiryId };
  CreateEnquiry: undefined;
  QuotationBuilder: { enquiryId: EnquiryId };
  QuotationRevision: { quotationId: QuotationId };
  CustomerDetail: { customerId: string };
  VendorDetail: { vendorId: VendorId };
  VendorApprovalQueue: undefined;
  AssignVendor: { bookingId: BookingId };
  TripMonitor: { tripId: TripId };
  ChangeVehicleApproval: { tripId: TripId };
  PayinDetail: { entryId: string };
  PayoutDetail: { entryId: string };
  NotificationCentre: undefined;
  Support: undefined;
};

export type UcTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  AddBooking: undefined;
  Customers: undefined;
  Profile: undefined;
};

/* ================================================================
 * React Navigation global typing
 * ================================================================ */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}