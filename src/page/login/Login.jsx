import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ setCurrentUser }) {

  const [unique, setUnique] = useState("")
  const navigate = useNavigate()

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
        setCurrentUser(data)
        alert(`Login Sukes : ${string}`)
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
