import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateStayRoomSubtotal } from "@/lib/stayPricing";

export enum BoardType {
  FULL_BOARD = "fullBoard",
  HALF_BOARD = "halfBoard",
}

enum ExtraType {
  DECOR = "decor",
  PICNIC = "picnic",
  DRINKS = "drinks",
  PAINTING = "painting",
}

type Extras = {
  type: ExtraType;
  options: {
    id: string;
    name: string;
    price: number;
  }[];
};

type Pod = {
  id: string;
  title: string;
  desc: string;
  price: number;
  available: boolean;
  tags: string[];
  img: string;
};

type BoardOption = {
  id: string;
  boardType: BoardType;
  title: string;
  subtitle: string;
  items: string[];
  price: number;
  isActive: boolean;
};

type BookingDraft = {
  id?: string;
  reference?: string;
  status?: string;
  dates?: {
    checkIn: Date;
    checkOut: Date;
  };
  guests?: {
    adults: number;
    teenagers: number;
    toddlers?: number;
    children: number;
    infants?: number;
  };
  popUpBeds?: number;
  numberOfNights?: number;
  basePrice?: number;
  pricingConfig?: {
    basePricePerPod: number;
    extraGuestFee: number;
    basePricePerPodPeak?: number;
    basePricePerPodOffPeak?: number;
    extraGuestFeePeak?: number;
    extraGuestFeeOffPeak?: number;
    maxGuestsPerPod: number;
    minGuestsPerPod: number;
    totalPodsAvailable: number;
    twelveGuestDiscountPercent?: number;
    currency: string;
  };
  peakRateInfo?: {
    name: string;
    percentageAdjustment: number;
    type: string;
  } | null;
  weekdayPeakInfo?: {
    peakDaysLabel?: string;
    offPeakDaysLabel?: string;
    peakNights?: number;
    offPeakNights?: number;
    nights?: number;
  } | null;
  seasonalRatePeriods?: Array<{
    startDate: string;
    endDate: string;
    percentageAdjustment: number;
    isActive?: boolean;
  }>;
  bedConfiguration?: string;
  availablePods?: Pod[];
  selectedPodIds?: string[];
  podId?: string;
  podCount?: number;
  domeDetails?: Array<{
    podId?: string;
    podName?: string;
    bedConfig: string;
    guests: string[];
  }>;
  availableMealPlans?: BoardOption[];
  mealPlan?: BoardOption;
  subTotal?: number;
  availableExtras?: Extras[];
  extras?: Extras[];
  welcomeNote?: {
    enabled?: boolean;
    text?: string;
    dates?: string[];
  } | null;
  extraPersonalizations?: Array<{
    extraId: string;
    extraName: string;
    text: string;
    dates?: string[];
  }> | null;
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: "male" | "female";
    dob: Date;
    instruction?: string;
    identification?: File;
    guestNames?: string[];
  };
  payment?: {
    method: "card" | "cash";
  };
};

type BookingStore = {
  draft: BookingDraft;
  updateDraft: (data: Partial<BookingDraft>) => void;
  resetBooking: () => void;
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      draft: {},
      updateDraft: (data) =>
        set((state) => ({
          draft: { ...state.draft, ...data },
        })),
      resetBooking: () => set({ draft: {} }),
    }),
    {
      name: "booking-draft",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      }, // use localStorage if you want long-term
    },
  ),
);

export const calculateDynamicSubTotal = (draft: BookingDraft): number => {
  const guestCounts = draft.guests || {
    adults: 0,
    teenagers: 0,
    toddlers: 0,
    children: 0,
    infants: 0,
  };
  const pricingConfig = draft.pricingConfig || {
    basePricePerPod: 400000,
    extraGuestFee: 100000,
    maxGuestsPerPod: 2,
    minGuestsPerPod: 1,
    totalPodsAvailable: 6,
    currency: "NGN",
  };
  const checkIn = draft.dates?.checkIn;
  const checkOut = draft.dates?.checkOut;
  const pods = draft.podCount || 1;

  const { subtotal: roomSubtotal } = calculateStayRoomSubtotal({
    checkIn,
    checkOut,
    podsCount: pods,
    guestCounts,
    pricingConfig,
    seasonalRates: draft.seasonalRatePeriods ?? [],
  });

  const extrasTotal =
    draft.extras?.reduce(
      (sum, e: any) => sum + (Number(e.price) * (e.quantity || 1)) || 0,
      0,
    ) || 0;

  return roomSubtotal + extrasTotal;
};
