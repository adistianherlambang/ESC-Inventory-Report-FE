import React, { useEffect, useState } from 'react'
import { userStore } from '../../state/state'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from '../../../firebase'

//Component
import Loader from '../../components/item/loader/Loader'
import Empty from '../../components/item/Empty/Empty'
import { ActivityIcon } from '../../components/Icon/Icon'


import styles from "./style.module.css"
import { useStore } from 'zustand'

export default function PmtPage() {
  const { currentUser } = userStore()
  const [pmtData, setPmtData] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dateFiltered, setDateFiltered] = useState([])

  const navigate = useNavigate()

  const logout = userStore((state) => state.logout)
  const now = new Date()
  const date = now.toISOString().split("T")[0]

  // const fetchPmtByName = async (name) => {
  //   try {
  //     const res = await axios.get(`http://localhost:3000/pmt/get/${name}`)
  //     const data = res.data
  //     console.log("fetch berhasil:", data)

  //     if (data.length === 0) {
  //       setError(data.message || "data gaada")
  //     }
  //     setPmtData(data)

  //   } catch (err) {
  //     console.error(`server error ${err}`)
  //     setError("Server error, coba lagi")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const formatRupiah = (value) => {
    if(typeof value !== "number") return value
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // useEffect(() => {
  //   console.log("Current user in PmtPage:", currentUser)
  //   if (currentUser?.name) {
  //     fetchPmtByName()
  //   }
  // }, [currentUser?.name])

  useEffect(() => {
    try {
      const fetchPmtByName = async () => {
        try {
          const q = query(
            collection(db, "pmtdatas"),
            where("name", "==", currentUser?.name)
          )
          
          const querySnapshot = await getDocs(q)
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
          
          console.log("fetch berhasil", data) 

          setPmtData(data)
          if (pmtData.length == 0){
            setError(true)
          }
        } catch (err) {
          console.error(`error: : ${err}`)
        } finally {
          setLoading(false)
        }
      }
      fetchPmtByName()
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (pmtData.length > 0) {
      const filtered = pmtData
        .map((item) => ({
          ...item,
          report: item.report.filter((r) => r.createdAt === date),
        }))
        .filter((item) => item.report.length > 0)
      setDateFiltered(filtered)
    }
  }, [pmtData, date])

  return (
    <div className={styles.container}>
      <h2>PmtPage</h2>
      <button onClick={logout}>Logout</button>
      {date}
      {loading && <Loader/>}
      <div className={styles.activityContainer}>
        <div>
          <div>
            <p>Activity</p>
            <ActivityIcon/>
          </div>
          <p>30/08/2025</p>
        </div>
        {pmtData.map((item) => (
          <div key={item.id}>
            <p>{item.name}</p>
          </div>
        ))}
        {dateFiltered.map((item) => (
          <div key={item._id}>
            {item.report.map((r) => (
              <div key={r._id}>
                <p>{r.product}</p>
                <p>{r.capacity}</p>
                <p>Rp {formatRupiah(r.price.amount)}</p>
                <p>{r.price.paymentType}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}