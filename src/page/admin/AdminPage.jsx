import React, {useState, useEffect} from 'react'
import BrandButton from '../../components/brandButton/brandButton'
import { userStore } from '../../state/state'

import styles from "./style.module.css"

export default function AdminPage() {

  const [product, setProduct] = useState([])
  const logout = userStore((state) => state.logout)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/product/getall')
        const data = await res.json()
        setProduct(data)
        
      } catch (err) {
        console.error("gagal fetch data :", err)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <p>Admin Page</p>
      <button onClick={logout}>Logout</button>
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
