export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
}

export enum PropertyStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  Rejected = 'rejected',
  HIDDEN = 'hidden',
}

export enum VehicleCondition {
  NEW = 'new',
  USED = 'used',
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
  UNDERFLOOR = 'Underfloor',
  WOOD = 'Wood',
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
  ONE_WEEK = '7_days',
  TWO_WEEKS = '14_days',
  ONE_MONTH = '1_month',
  THREE_MONTHS = '3_months',
  SIX_MONTHS = '6_months',
  TEEN_MONTHS = '10_months',
  OTHER = 'Other',
}

export enum PlanType {
  TRIAL = 'Trial',
  BASIC = 'Basic',
  Platinum = 'Platinum',
  VIP = 'Vip',
}
