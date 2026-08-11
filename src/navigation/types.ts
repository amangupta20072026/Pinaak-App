// src/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BookingId, QuotationId, TripId, VehicleId, DriverId, VendorId, EnquiryId } from '@app-types/ids';
import type { UserRole } from '@rbac/roles';

/* ---------------------- Root ---------------------- */
export type RootStackParamList = {
  OnboardingFlow: NavigatorScreenParams<OnboardingParamList>;
  AuthFlow: NavigatorScreenParams<AuthParamList>;
  CustomerFlow: NavigatorScreenParams<CustomerStackParamList>;
  VendorFlow: NavigatorScreenParams<VendorStackParamList>;
  DriverFlow: NavigatorScreenParams<DriverStackParamList>;
  UcFlow: NavigatorScreenParams<UcStackParamList>;
};

/* -------------------- Onboarding -------------------- */
export type OnboardingParamList = {
  Onboarding: undefined;
};

/* --------------------- Auth ------------------------- */
export type AuthParamList = {
  Login: { role: UserRole };
  OtpVerify: { role: UserRole; phone: string };
};

/* ------------------ Customer stack ------------------ */
export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  QuotationDetail: { quotationId: QuotationId };
  BookingDetail: { bookingId: BookingId };
  PassengerList: { bookingId: BookingId };
  TripLive: { tripId: TripId };
  ModificationRequest: { bookingId: BookingId };  // modal
  AddRemark: { quotationId: QuotationId };        // modal
  PayBalance: { bookingId: BookingId };           // modal
  GstInvoice: { bookingId: BookingId };
  Feedback: { bookingId: BookingId };
  NotificationCentre: undefined;
  Support: undefined;
};

/* ------------------ Customer tabs ------------------- */
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
  AcceptAssignment: { bookingId: BookingId };     // modal
  RejectAssignment: { bookingId: BookingId };     // modal
  VehicleDetail: { vehicleId: VehicleId };
  AddVehicle: undefined;                          // modal
  VehicleAvailability: { vehicleId: VehicleId };
  DriverDetail: { driverId: DriverId };
  AddDriver: undefined;                           // modal
  TripDetail: { tripId: TripId };
  ChangeVehicleRequest: { tripId: TripId };       // modal
  PaymentDetail: { entryId: string };
  NotificationCentre: undefined;
  Support: undefined;
};

/* ------------------- Vendor tabs -------------------- */
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
  DeclineTrip: { tripId: TripId };                // modal
  OtpEntry: { tripId: TripId };                   // modal
  StartLegKm: { tripId: TripId; leg: number };
  EndLegKm: { tripId: TripId; leg: number };
  Briefing: { tripId: TripId };
  CollectPayment: { tripId: TripId };             // modal
  DriverRegistration: undefined;
  NotificationCentre: undefined;
  Support: undefined;
};

/* ------------------- Driver tabs -------------------- */
export type DriverTabParamList = {
  Home: undefined;
  MyTrips: undefined;
  Emergency: undefined
  Earnings: undefined;
  Profile: undefined;
};

/* --------------------- UC stack --------------------- */
export type UcStackParamList = {
  UcTabs: NavigatorScreenParams<UcTabParamList>;
  EnquiryDetail: { enquiryId: EnquiryId };
  CreateEnquiry: undefined;                       // modal
  QuotationBuilder: { enquiryId: EnquiryId };
  QuotationRevision: { quotationId: QuotationId };// modal
  CustomerDetail: { customerId: string };
  VendorDetail: { vendorId: VendorId };
  VendorApprovalQueue: undefined;
  AssignVendor: { bookingId: BookingId };         // modal
  TripMonitor: { tripId: TripId };
  ChangeVehicleApproval: { tripId: TripId };      // modal
  PayinDetail: { entryId: string };
  PayoutDetail: { entryId: string };
  NotificationCentre: undefined;
  Support: undefined;
};

/* --------------------- UC tabs ---------------------- */
export type UcTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  AddBooking: undefined;
  Customers: undefined;
  Reports: undefined;
};

/* ================================================================
 * React Navigation global typing
 * ================================================================ */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}