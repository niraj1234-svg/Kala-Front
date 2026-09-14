// Central KALA Configuration

export const KALA_CONFIG = {
  brandName: "KALA",
  tagline: "Originals Studio",
  currency: "INR",
  currencySymbol: "₹",

  // Contact Information
  whatsapp: "919406030116",
  phone: "+91 94060 30116",
  email: "KalaOriginals@gmail.com",

  // Social Links
  social: {
    instagram: "https://www.instagram.com/kala_originals/",
  },

  // Payment Configuration
  payment: {
    enabled: true,
    methods: [
      {
        id: "cod",
        name: "Cash on Delivery (COD)",
        description: "Pay with cash or UPI at the time of delivery across India.",
        enabled: true,
      },
      {
        id: "online",
        name: "Online Payment (UPI, Cards, Net Banking)",
        description: "Direct payment via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking.",
        enabled: true,
      },
    ],
  },

  // Shipping & Delivery Configuration
  shipping: {
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    estimatedDays: "5–7 business days",
  },
};

export default KALA_CONFIG;
