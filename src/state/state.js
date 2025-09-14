import { create } from "zustand"

const userStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({currentUser: user}),
  cleanUser: () => set({currentUser: null})
}))

export { userStore }