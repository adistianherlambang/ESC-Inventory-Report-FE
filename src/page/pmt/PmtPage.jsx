import React, { useEffect, useState } from 'react'
import { userStore } from '../../state/state'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

//Component
import Loader from '../../components/item/loader/Loader'

import styles from "./style.module.css"

export default function PmtPage() {
  const { currentUser } = userStore()
  const [pmtData, setPmtData] = useState([])
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const logout = userStore((state) => state.logout)
  const now = new Date()
  const date = now.toISOString().split("T")[0]

  const fetchPmtByName = async (name) => {
    try {
      const res = await axios.get(`http://localhost:3000/pmt/get/${name}`)
      const data = res.data
      console.log("fetch berhasil:", data)

      if (data.length === 0) {
        setError(data.message || "data gaada")
      }
      setPmtData(data)
    } catch (err) {
      console.error(`server error ${err}`)
      setError("Server error, coba lagi")
    }
  }

  const filterByDate = () => {
    const filtered = pmtData
      .map((item) => ({
        ...item,
        report: item.report.filter((r) => r.createdAt === date),
      }))
      .filter((item) => item.report.length > 0)

    setPmtData(filtered)
  }

  useEffect(() => {
    console.log("Current user in PmtPage:", currentUser)
    if (currentUser?.name) {
      fetchPmtByName(currentUser.name)
    }
  }, [currentUser?.name])

  return (
    <div className={styles.container}>
      <h2>PmtPage</h2>
      <button onClick={logout}>Logout</button>
      <Loader/>
      {date}
      {error && <p style={{color: "red"}}>{error}</p>}
      {pmtData.length === 0 && <p>Tidak ada data</p>}
      <ul>
        {pmtData.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong>
            <ul>
              {item.report.map((r) => (
                <li key={r._id}>
                  {r.product} ({r.capacity}) - Rp{r.price.amount} [{r.price.paymentType}]\n {r.createdAt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}