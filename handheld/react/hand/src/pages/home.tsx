
import { Button } from "@/components/ui/button"
import { NavLink } from 'react-router-dom';


export default function home() {
  return (
    <div className='flex justify-center w-full h-full p-4'>
        <div className='grid grid-cols-2 gap-4 p-4 items-center w-96 h-52'>
            <NavLink to="/entry" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-full aspect-square">ورود</Button>
            </NavLink>
            <NavLink to="/req" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-full aspect-square">درخواست</Button>
            </NavLink>
            <NavLink to="/rep" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-full aspect-square">گزارش</Button>
            </NavLink>
            <NavLink to="/rel" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-full aspect-square">جانمایی</Button>
            </NavLink>
            <NavLink to="/taj" className="w-full">
              <Button variant="default" className="bg-whitebox border-0 text-text hover:text-white w-full h-full aspect-square">تجمیع</Button>
            </NavLink>
            
        </div>
    </div>
  )
}
