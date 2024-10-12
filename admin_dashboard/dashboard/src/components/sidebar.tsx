
import { NavLink } from 'react-router-dom'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

export default function Sidebar() {
  return (
    <div className='h-full flex flex-col items-center p-4 pt-8'>
      <ul className='flex flex-col gap-2 w-full text-center'>
        <li className=' border-4 border-lightstrk hover:border-supblue transition-all shadow-sm  rounded-lg text-right p-3'>
          <NavLink to='' className='w-full h-full block'>خانه</NavLink>
        </li>
        <li className=' border-4  border-lightstrk hover:border-supblue transition-all shadow-card rounded-lg text-right p-3'>
          <NavLink to='req' className='w-full h-full block'>درخواست</NavLink>
        </li>
        <li>
          <Accordion type="single" collapsible className='gap-8'>
            <AccordionItem value="item-1">
              <AccordionTrigger className='block border-2 text-right'>گزارش</AccordionTrigger>
              <AccordionContent>
                <NavLink to='rep' className='w-full h-full block border-2 border-transparent hover:border-supblue transition-all shadow-sm hover:shadow-lg rounded-lg text-center p-3'>
                  Reports1
                </NavLink>
              </AccordionContent>
              <AccordionContent>
                <NavLink to='rep' className='w-full h-full block border-2 border-transparent hover:border-supblue transition-all shadow-sm hover:shadow-lg rounded-lg text-center p-3'>
                  Reports2
                </NavLink>
              </AccordionContent>
              <AccordionContent>
                <NavLink to='rep' className='w-full h-full block border-2 border-transparent hover:border-supblue transition-all shadow-sm hover:shadow-lg rounded-lg text-center p-3'>
                  Reports3
                </NavLink>
              </AccordionContent>
              <AccordionContent>
                <NavLink to='rep' className='w-full h-full block border-2 border-transparent hover:border-supblue transition-all shadow-sm hover:shadow-lg rounded-lg text-center p-3'>
                  Reports4
                </NavLink>
              </AccordionContent>
              <AccordionContent>
                <NavLink to='rep' className='w-full h-full block border-2 border-transparent hover:border-supblue transition-all shadow-sm hover:shadow-lg rounded-lg text-center p-3'>
                  Reports5
                </NavLink>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>
      </ul>
    </div>
  )
}
