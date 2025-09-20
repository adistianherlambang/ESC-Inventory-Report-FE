import React, {useState, useEffect} from 'react'
import BrandButton from '../../components/brandButton/brandButton'
import { userStore } from '../../state/state'
import axios from 'axios'
import { replace, useNavigate } from 'react-router-dom'

//components

import styles from "./style.module.css"

export default function AdminPage() {

  const [product, setProduct] = useState([])
  const [user, setUser] = useState([])
  const logout = userStore((state) => state.logout)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios("http://localhost:3000/product/getall")
        const data = res.data
        setProduct(data)
        
      } catch (err) {
        console.error("gagal fetch data :", err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios("http://localhost:3000/user/")
        const data = res.data
        setUser(data)
      } catch(errr) {
        console.error("gagal fetch data: ", err)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      <p>Admin Page</p>
      <button onClick={logout}>Logout</button>
      {user.map((item, index))}
      <BrandButton label="Samsung"/>
      {/* <BrandButton label="Xiaomi"/>
      <BrandButton label="Vivo"/>
      <BrandButton label="Oppo"/>
      <BrandButton label="Realme"/>
      <BrandButton label="Tecno"/>
      <BrandButton label="Infinix"/>
      <BrandButton label="Itel"/>
      <BrandButton label="Iphone"/>
      <BrandButton label="Nokia"/> */}
      {product && product.map((item, index) => (
        <div key={item._id}>
          <p>{item.brand} - {item.product} {item.IMEI.join(", ")} ==== {item.IMEI.length}</p>
        </div>
      ))}
    </div>
  )
}
