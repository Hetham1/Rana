import { Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from 'react-router-dom';
import RanaLogo from "../assets/cutt.png";

const Header = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <header className="sticky top-0 z-50 flex flex-row-reverse min-h-16 items-center justify-between gap-4 border-b bg-whitebox rounded-xl px-4 md:px-6 shadow-md">
    
      <div className="flex flex-row items-center gap-2">
     
      <Button variant="outline" className="py-0 hover:bg-red-500 hover:text-white hover:border-white" onClick={onLogout}>
        خروج
      </Button>
      </div>
      
      

      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <img className="w-10"src={RanaLogo}/>
        <Button variant="outline" className="py-0">
          <Link to="/" className="w-full h-full flex items-center justify-center">خانه</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-decoration: none;">
              درخواست ها
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/req-sent">درخواست های ارسالی</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/req-received">درخواست های دریافتی</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="py-0">
          <Link to="/rep" className="w-full h-full flex items-center justify-center">
            گزارش 1
          </Link>
        </Button>
      </nav>

      {/* Right part with menu for mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Button variant="outline" className="py-0">
              <Link to="/" className="w-full h-full flex items-center justify-center">خانه</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  درخواست ها
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/req-sent">درخواست های ارسالی</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/req-received">درخواست های دریافتی</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="py-0">
              <Link to="/rep" className="w-full h-full flex items-center justify-center">
                گذارش 1
              </Link>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
