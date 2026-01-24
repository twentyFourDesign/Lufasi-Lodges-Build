import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    infants: number;
  };
  numberOfNights?: number;
  basePrice?: number;
  availablePods?: Pod[];
  numberOfPods?: number;
  availableMealPlans?: BoardOption[];
  mealPlan?: BoardOption;
  subTotal?: number;
  availableExtras?: Extras[];
  extras?: Extras[];
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
