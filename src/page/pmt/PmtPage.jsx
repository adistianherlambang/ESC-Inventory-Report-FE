import React, { useEffect } from 'react'

export default function PmtPage() {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/")
      } catch(err) {
        console.error({err})
      }
    }
  })

  return (
    <div>PmtPage</div>
  )
}
