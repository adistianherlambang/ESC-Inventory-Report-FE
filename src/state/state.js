import { create } from "zustand";

const getUserFromSession = () => {
  const saved = sessionStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
};

const userStore = create((set) => ({
  currentUser: getUserFromSession(),
  brand: getUserFromSession()?.brand || null,

  setCurrentUser: (user) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    set({
      currentUser: user,
      brand: user.brand || null, // simpan brand juga
    });
  },

  cleanUser: () => set({ currentUser: null, brand: null }),

  logout: () => {
    sessionStorage.removeItem("user");
    set({ currentUser: null, brand: null });
  },
}));

export { userStore };
