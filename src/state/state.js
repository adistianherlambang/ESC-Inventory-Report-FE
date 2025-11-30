import { create } from "zustand";

const getUserFromSession = () => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
};

const userStore = create((set) => ({
  currentUser: getUserFromSession(),
  brand: getUserFromSession()?.brand || null,
  role: getUserFromSession()?.role || null,

  setCurrentUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({
      currentUser: user,
      brand: user.brand || null, // simpan brand juga
    });
  },

  cleanUser: () => set({ currentUser: null, brand: null }),

  logout: () => {
    localStorage.removeItem("user");
    set({ currentUser: null, brand: null });
  },
}));

const pmtReport = create((set) => ({
  active: false,
  stock: false,
  //////
  setStockActive: (value) => set({ stock: value }),
  toogleStockActive: () => set(() => ({ stock: true })),
  toogleStockDeact: () => set(() => ({ stock: false })),
  //////
  setActive: (value) => set({ active: value }),
  toogleActive: () => set(() => ({ active: true })),
  toogleDeact: () => set(() => ({ active: false })),
}));

export { userStore, pmtReport };
