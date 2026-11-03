export const store = {
  whatsapp: (import.meta.env.VITE_WHATSAPP_NUMBER || "").trim(),
  instagram: (import.meta.env.VITE_INSTAGRAM_URL || "").trim(),
};
export const whatsappConfigured = /^57\d{10}$/.test(store.whatsapp);
