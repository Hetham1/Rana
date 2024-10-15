
import {
  Activity,
  ArrowUpRight,

  CreditCard,
  DollarSign,
 
  Users,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Bars, Waves, Noodle, Radial, DotChart, VertBar } from "@/components/ui/charts"

export function Home() {
  return (
    <div className="flex flex-col w-full">
      <main className="flex-1 overflow-y-auto bg-whiteback">
        <div className="container mx-auto p-4 md:p-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-prim text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  تراکنش های جاری
                </CardTitle>
                <DollarSign className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-white">
                  +20.1% از ماه پیش
                </p>
              </CardContent>
            </Card>
            <Card className="bg-sec text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  سفارشات
                </CardTitle>
                <Users className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-white">
                  +180.1% از ماه پیش
                </p>
              </CardContent>
            </Card>
            <Card className="bg-suppink text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">خروج ها</CardTitle>
                <CreditCard className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-white">
                  +19% از ماه پیش
                </p>
              </CardContent>
            </Card>
            <Card className="bg-supblue text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ظرفیت انبار</CardTitle>
                <Activity className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-white">
                  از 1000
                </p>
              </CardContent>
            </Card>
            </div>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card className="col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>تراکنش‌ها</CardTitle>
            <CardDescription>
              تراکنش‌های اخیر فروشگاه شما.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="bg-prim hover:bg-sec">
            <a href="#" className="flex items-center gap-1">
              مشاهده همه
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>مشتری</TableHead>
              <TableHead className="hidden xl:table-cell">نوع</TableHead>
              <TableHead className="hidden xl:table-cell">وضعیت</TableHead>
              <TableHead className="hidden xl:table-cell">تاریخ</TableHead>
              <TableHead className="text-right">مبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="font-medium">لیام جانسون</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  liam@example.com
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">فروش</TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant="outline">تأیید شده</Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">2023-06-23</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">اولیویا اسمیت</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  olivia@example.com
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">بازپرداخت</TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant="outline">رد شده</Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">2023-06-24</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">نوح ویلیامز</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  noah@example.com
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">اشتراک</TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant="outline">تأیید شده</Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">2023-06-25</TableCell>
              <TableCell className="text-right">$350.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">اما براون</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  emma@example.com
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">فروش</TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant="outline">تأیید شده</Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">2023-06-26</TableCell>
              <TableCell className="text-right">$450.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">لیام جانسون</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  liam@example.com
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">فروش</TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant="outline">تأیید شده</Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">2023-06-27</TableCell>
              <TableCell className="text-right">$550.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>فروش‌های اخیر</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">اولیویا مارتین</p>
            <p className="text-sm text-muted-foreground">
              olivia.martin@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$1,999.00</div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/02.png" alt="Avatar" />
            <AvatarFallback>JL</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">جکسون لی</p>
            <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
          </div>
          <div className="ml-auto font-medium">+$39.00</div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="Avatar" />
            <AvatarFallback>IN</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">ایزابلا نگوین</p>
            <p className="text-sm text-muted-foreground">
              isabella.nguyen@email.com
            </p>
          </div>
          <div className="ml-auto font-medium">+$299.00</div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/04.png" alt="Avatar" />
            <AvatarFallback>WK</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">ویلیام کیم</p>
            <p className="text-sm text-muted-foreground">will@email.com</p>
          </div>
          <div className="ml-auto font-medium">+$99.00</div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/05.png" alt="Avatar" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">سوفیا دیویس</p>
            <p className="text-sm text-muted-foreground">sofia.davis@email.com</p>
          </div>
          <div className="ml-auto font-medium">+$39.00</div>
        </div>
      </CardContent>
    </Card>
  </div>
  <Bars/>

         <div className="flex flex-row justify-between">

                  

                    <Waves/>
                    <Radial/>
                    <VertBar/>
                    <DotChart/>
                    
                  
 
          </div>
    
    <Noodle/>
    </div>
   
  </main>
</div>

  )
}