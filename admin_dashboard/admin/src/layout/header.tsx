
import {
  Menu,
  Package2,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
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
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <a
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </a>
              <a href="#" className="hover:text-foreground">
                Dashboard
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Customers
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
  );
};

export default Header;