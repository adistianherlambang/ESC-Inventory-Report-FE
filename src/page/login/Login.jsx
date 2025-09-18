import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userStore } from '../../state/state'

import styles from "./style.module.css"

export default function Login() {

  const [unique, setUnique] = useState("")
  const navigate = useNavigate()
  const setCurrentUser = userStore((state) => state.setCurrentUser)

  const handleLogin = async (e) => {
    e.preventDefault();
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
    <div className={styles.container}>
      <div className={styles.top}>
        SuperApp
      </div>
      <div className={styles.bottom}>
        <p className={styles.title}>
          Selamat <span className={styles.span}>Datang</span>👋
          di SuperApp TES 123
        </p>
        <form onSubmit={handleLogin} className={styles.form}>
          <input 
            className={styles.input}
            type='text'
            placeholder='Kode Login'
            value={unique}
            onChange={(e) => setUnique(e.target.value)}
          />
          <button className={styles.button} type='submit'>Login</button>
        </form>
        <p className={styles.text}>
          Dengan menggunakan aplikasi Eldorado, Anda setuju untuk menjaga keamanan akun, mengelola data dengan benar, tidak menyalahgunakan fitur, menjaga kerahasiaan informasi perusahaan, serta mematuhi seluruh ketentuan dan pembaruan resmi yang berlaku.
        </p>
      </div>
    </div>
  )
}
