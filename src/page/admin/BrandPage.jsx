import React, {useState, useEffect} from 'react'
import { useParams } from "react-router-dom"

export default function BrandPage() {

  const { label } = useParams()
  
  const [product, setProduct] = useState([])

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:3000/product/getbybrand?brand=${label.toLowerCase()}`)
      const data = await res.json()
      setProduct(data)
    } catch(err) {
      console.error(err.message)
    }
  }
  fetchData()
}, [])

  return (
    <div>
      <h1>Brand: {label}</h1>
      {product.map((item, index) => (
        <div key={index}>
          {item.IMEI.join(", ")}
          {item.product}
        </div>
      ))}
    </div>
  )
}
