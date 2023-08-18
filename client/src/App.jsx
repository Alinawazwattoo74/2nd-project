import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './Home'
import Dashboard from './Dashboard'
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/admin" element={<Dashboard/>}/>

    </Routes>
  )
}

export default App