
import { Button } from "@/components/ui/button"
import { NavLink } from 'react-router-dom';


export default function home() {
  return (
    <div className='flex justify-center w-full h-full p-4'>
        <div className='grid grid-cols-1 gap-2 p-4 items-center w-96 h-52'>
            <NavLink to="/req" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-36 aspect-auto">درخواست ورود</Button>
            </NavLink>
           
            <NavLink to="/taj" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-36 aspect-auto">سفارشات خروجی</Button>
            </NavLink>

            <NavLink to="/qr" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-36 aspect-auto">کنترل خروج</Button>
            </NavLink>
            
        </div>
    </div>
  )
}
