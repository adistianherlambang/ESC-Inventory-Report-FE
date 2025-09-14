import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userStore } from '../../state/state'

export default function Login() {

  const [unique, setUnique] = useState("")
  const navigate = useNavigate()
  const setCurrentUser = userStore((state) => state.setCurrentUser)

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({unique})
      })
      const data = await res.json()
      const string = JSON.stringify(data)
      
      if(res.ok) {
        alert(`Login Sukes : ${string}`)
        setCurrentUser(data)
        navigate("/")
      } else {
        alert(data.message || "login gagal")
      }

    } catch (err) {
      alert(`Server Error ${err}`)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Kode login"
        value={unique}
        onChange={(e) => setUnique(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
