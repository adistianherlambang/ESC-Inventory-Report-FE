import React, { useEffect, useState } from 'react'
import { userStore } from '../../state/state'

export default function PmtPage() {
  const { currentUser } = userStore()
  const [pmtData, setPmtData] = useState([])
  const [error, setError] = useState(null)

  const fetchPmtByName = async (name) => {
    try {
      const res = await fetch(`http://localhost:3000/pmt/get/${name}`)
      const data = await res.json()
      console.log("fetch berhasil:", data)

      if (res.ok) {
        if (Array.isArray(data)) {
          setPmtData(data) // kalau backend return find
        } else {
          setPmtData([data]) // kalau backend return findOne
        }
      } else {
        setError(data.message || "data gaada")
      }
    } catch (err) {
      console.error(`server error ${err}`)
      setError("Server error, coba lagi")
    }
  }

  useEffect(() => {
    console.log("Current user in PmtPage:", currentUser)
    if (currentUser?.name) {
      fetchPmtByName(currentUser.name)
    }
  }, [currentUser?.name])

  return (
    <div>
      <h2>PmtPage</h2>
      {error && <p style={{color: "red"}}>{error}</p>}
      {pmtData.length === 0 && <p>Tidak ada data</p>}
      <ul>
        {pmtData.map((item) => (
          <li key={item._id}>
            <strong>{item.name}</strong>
            <ul>
              {item.report.map((r) => (
                <li key={r._id}>
                  {r.product} ({r.capacity}) - Rp{r.price.amount} [{r.price.paymentType}]
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}