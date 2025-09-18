import { create } from "zustand"

const getUserFromSession = () => {
  const saved = sessionStorage.getItem("user")
  return saved ? JSON.parse(saved) : null
}

const userStore = create((set) => ({
  currentUser: getUserFromSession(),
  setCurrentUser: (user) => {
    sessionStorage.setItem("user", JSON.stringify(user))
    set({currentUser: user})
  },
  cleanUser: () => set({currentUser: null}),
  logout: () => {
    sessionStorage.removeItem("user")
    set({currentUser: null})
  }
}))

export { userStore }