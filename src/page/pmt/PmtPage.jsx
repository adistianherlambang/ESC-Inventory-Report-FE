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

  const formatRupiah = (value) => {
    if(typeof value !== "number") return value
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

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
  }, [currentUser?.name])

  useEffect(() => {
    const filtered = pmtData.map((item) => ({
      ...item,
      report: item.report.filter(r => {
        const reportDate = r.createAt?.toDate()?.toLocaleDateString("en-CA")
        return reportDate === date
      })
    })).filter(item => item.report.length > 0)
    setDateFiltered(filtered)
    console.log("ppp",filtered)
  }, [pmtData, date])

  return (
    <div className={styles.container}>
      <h2>PmtPage</h2>
      <button onClick={logout}>Logout</button>
      {date}
      {loading && <Loader/>}
      <div className={styles.activityContainer}>
        <div className={styles.activityTitleWrapper}>
          <p className={styles.activityTitle}>Activity</p>
          <ActivityIcon/>
        </div>
        {dateFiltered.map((item) => (
          <div key={item.id} className={styles.activity}>
            {item.report.map((i) => {
              const totalAmount = i.price.reduce((sum, item) => sum + item.amount, 0)
              return (
              <div key={i.product}>
                <div className={styles.productContainer}>
                  <p className={styles.productName}>{i.product}</p>
                  <div className={styles.productDetail}>
                    <p>warna : {i.color}</p>
                    <p>ukuran: {i.capacity}</p>
                  </div>
                </div>
                {i.price.map((r) => (
                  <div key={r.amount}>
                    <p>{formatRupiah(r.amount)}</p>
                    <p>{r.type}</p>
                  </div>
                ))}
                <p>{formatRupiah(totalAmount)}</p>
              </div>
            )})}
          </div>
        ))}
      </div>
    </div>
  )
}