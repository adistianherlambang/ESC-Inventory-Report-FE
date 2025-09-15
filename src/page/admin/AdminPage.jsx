import React, {useState, useEffect} from 'react'

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
      {product && product.map((item, index) => (
        <div key={item._id}>
          <p>{item.brand} - {item.product} {item.IMEI.join(", ")} ==== {item.IMEI.length}</p>
        </div>
      ))}
    </div>
  )
}
