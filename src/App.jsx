import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

//pages
import FLPage from './page/fl/FLPage'
import Login from './page/login/Login'
import AdminPage from './page/admin/AdminPage'
import PmtPage from './page/pmt/PmtPage'

export default function App() {

  const [currentUser, setCurrentUser] = useState(null)

  return (
    <>
    <Router>
      <Routes>
        <Route
          path='/'
          element={
            currentUser ? (
             (() => {
                switch(currentUser.role) {
                  case "admin" :
                  return <AdminPage/>
                  case "fl" :
                  return <FLPage/>
                  case "pmt" :
                  return <PmtPage/>
                  default :
                  return <Navigate to="/login"/>
                }
              })()
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path='/login' element={<Login setCurrentUser={setCurrentUser}/>}/>
      </Routes>
    </Router>
    </>
  )
}
