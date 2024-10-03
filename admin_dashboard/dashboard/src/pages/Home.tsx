import React from 'react'
import Chart from '../components/ui/longchart'
import Pie from '../components/ui/piechart'
import Bar from '../components/ui/barchart'
import Line from '../components/ui/line'

export default function Home() {
  return (
    <div className='flex flex-col flex-wrap gap-6 p-8 overflow-auto'>
      <div>
        <div>
          <Chart/>
        </div>
      </div>
      <div className='flex flex-row gap-2 justify-start content-stretch'>
        <div className='w-auto'>
          <Pie/>
        </div>

        <div className='w-auto flex flex-row'>
          <Bar/>
        </div>

        <div className='w-auto flex-grow'>
          <Line/>
        </div>
        
      </div>
      
      
    </div>
  )
}
