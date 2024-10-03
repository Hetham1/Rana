import React from 'react'
import { Outlet } from 'react-router-dom'
// import Nav from '../components/header'
import Sidebar from '../components/sidebar'


export default function layout() {
  return (
    
  <div className="flex flex-col w-screen h-screen bg-whiteback gap-3 overflow-x-hidden p-2">
        <header className='bg-whitebox text-text rounded-lg p-3'>
          hello
        </header>
        <div className='flex flex-row grow gap-3 '>
          <div className='bg-whitebox text-text basis-1/5 rounded-lg h-full'>
            <Sidebar />
          </div>
          <div className='bg-whitebox text-text basis-4/5 rounded-lg h-full'>
            <Outlet />
          </div>
        </div>
  </div>

  )
}

