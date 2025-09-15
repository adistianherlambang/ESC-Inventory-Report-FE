import React, {useState, useEffect} from 'react'
import BrandButton from '../../components/brandButton/brandButton'


export default function AdminPage() {

  const [product, setProduct] = useState([])

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
      <BrandButton label="Samsung" onClick/>
      <BrandButton label="Xiaomi" onClick/>
      <BrandButton label="Vivo" onClick/>
      <BrandButton label="Oppo" onClick/>
      <BrandButton label="Realme" onClick/>
      <BrandButton label="Tecno" onClick/>
      <BrandButton label="Infinix" onClick/>
      <BrandButton label="Itel" onClick/>
      <BrandButton label="Iphone" onClick/>
      <BrandButton label="Nokia" onClick/>
      {product && product.map((item, index) => (
        <div key={item._id}>
          <p>{item.brand} - {item.product} {item.IMEI.join(", ")} ==== {item.IMEI.length}</p>
        </div>
      ))}
    </div>
  )
}
