import { Column } from 'typeorm';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  AGENCY = 'agency',
  Owner = 'owner', //Owner === NORMAL_USER
  //  NORMAL_USER = 'normal_user',
  PENDING = 'pending',
  Financial = 'financial',
}

//ساويهن احرف كبيرة اول حرف
export enum PropertyStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  Rejected = 'Rejected',
  HIDDEN = 'Hidden',
}

export enum OrderDir {
  DESC = 'DESC',
  ASC = 'ASC',
}

export enum PropertyType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  VILLA = 'Villa',
  STUDIO = 'Studio',
  PENTHOUSE = 'Penthouse',
  FARM = 'Farm',
  LAND = 'Land',
  COMMERCIAL = 'Commercial',
  OTHER = 'other',
}

export enum HeatingType {
  CENTRAL = 'Central',
  GAS = 'Gas',
  ELECTRIC = 'Electric',
  SOLAR = 'Solar',
  NONE = 'None',
}

export enum FlooringType {
  CERAMIC = 'Ceramic',
  WOOD = 'Wood',
  MARBLE = 'Marble',
  TILE = 'Tile',
  CARPET = 'Carpet',
  VINYL = 'Vinyl',
  LAMINATE = 'Laminate',
  CONCRETE = 'Concrete',
  OTHER = 'other',
}

export enum PlanDuration {
  ONE_DAY = '1_day',
  ONE_WEEK = '7_day',
  TWO_WEEKS = '14_day',
  ONE_MONTH = '1_month',
  THREE_MONTHS = '3_month',
  SIX_MONTHS = '6_month',
  TEEN_MONTHS = '10_month',
  OTHER = 'Other',
}

export enum PlanType {
  TRIAL = 'Trial',
  BASIC = 'Basic',
  Platinum = 'Platinum',
  VIP = 'Vip',
}

export enum ReportTitle {
  T1 = 'Unauthorized deletion of property by admin',
  T2 = 'Disable notifications for a specific property',
  T3 = 'Request a refund of the subscription fee',
  Other = 'Other',
}

export enum Reason {
  T1R1 = 'Too many notifications about this property',
  T1R2 = 'No longer interested in this property',
  T3R1 = 'Didn’t receive the advertised features',
  T3R2 = 'Unintended auto-renewal of subscription',
  T3R3 = 'Payment error (e.g., double charge)',
  Other = 'Other',
}

export enum OrderStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
}

export enum ReportStatus {
  PENDING = 'Pending',
  FIXED = 'Fixed',
  Rejected = 'rejected',
}

// الله يكسرن لاديك لا تترك فراغات بالاسماء
export enum GeoEnum {
  STREET = 'street',
  QUARTER = 'quarter',
  CITY = 'city',
  GOVERNORATE = 'governorate',
  COUNTRY = 'country',
}

export enum Language {
  ARABIC = 'ar',
  ENGLISH = 'en',
  Germany = 'de'
}
