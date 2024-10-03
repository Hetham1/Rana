import Layout from './layout/layout'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Reports from './pages/Rep'
import Requests from './pages/Req'


export default function App() {
  return (
    <div className='w-screen h-full'>
    <Routes>
      <Route element={<Layout />}>
        <Route path='' element={<Home/>}/>
        <Route path='req' element={<Requests/>}/>
        <Route path='rep' element={<Reports/>}/>
      </Route>
    </Routes>
    </div>
    
  )
}