import { useEffect, useState } from "react"
import {
  
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
  ShoppingCart,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Bar, BarChart,  XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  
} from "@/components/ui/chart"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { Noodle } from "@/components/ui/charts"

interface LastOfUsOrder {
  ordId: string;
  orderDate: string;
  custId: string;
  orderApproval: number;
  userId: string;
  orderSituation: string;
}

interface LastOfUsApiResponse {
  success: boolean;
  data: LastOfUsOrder[];
}
interface OrderApiResponse {
  success: boolean;
  data: Array<{ counted: number }>;
}

interface CartApiResponse {
  success: boolean;
  data: number;
}
interface RadialProps {
  cartLength: number;
}
interface WarehouseApiResponse {
  success: boolean;
  data: Array<{ wireSpoolCount: number; InsulCount: number; cartCount: number }>;
}

interface NoQcApiResponse {
  success: boolean;
  data: Array<{ wireSpoolCount: number; InsulCount: number; cartCount: number }>;
}
export function Home() {

  const [submittedOrders, setSubmittedOrders] = useState(0)
  const [gatheredOrders, setGatheredOrders] = useState(0)
  const [exitedOrders, setExitedOrders] = useState(0)
  const [cartLength, setCartLength] = useState(0)
  const [noQc, setNoQc] = useState({ wireSpoolCount: 0, InsulCount: 0, cartCount: 0 })
  const [warehouseStock, setWarehouseStock] = useState({ wireSpoolCount: 0, InsulCount: 0, cartCount: 0 })
  const [lastOfUsOrders, setLastOfUsOrders] = useState<LastOfUsOrder[]>([])
  const [lastOfUs2Orders, setLastOfUs2Orders] = useState<LastOfUsOrder[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://defaulturl.com";
        const token = localStorage.getItem("token");
        const [submitted, gathered, exited, cart, stock, naQc, lastOfUs, lastOfUs2] = await Promise.all([
          axios.get<OrderApiResponse>(`${apiUrl}/adminreport/order/submitted/counter`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<OrderApiResponse>(`${apiUrl}/adminreport/order/gathered/counter`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<OrderApiResponse>(`${apiUrl}/adminreport/order/exited/counter`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          
          axios.get<CartApiResponse>(`${apiUrl}/adminreport/cart/length`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<WarehouseApiResponse>(`${apiUrl}/adminreport/warehouse/stock`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<NoQcApiResponse>(`${apiUrl}/adminreport/noQC`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<LastOfUsApiResponse>(`${apiUrl}/adminreport/order/lastOfUs`, {
            headers: { Authorization: `${token}` },
          }),
          axios.get<LastOfUsApiResponse>(`${apiUrl}/adminreport/order/lastOfUs2`, {
            headers: { Authorization: `${token}` },
          })
        ])
        console.log("sabt", submitted.data.data[0].counted, "jam",gathered.data.data[0].counted, "ersal", exited.data.data[0].counted, "meqdar sim", cart.data.data)
        console.log("mojudi", stock.data.data)
        setSubmittedOrders(submitted.data.data[0]?.counted ?? 0)
        setGatheredOrders(gathered.data.data[0]?.counted ?? 0)
        setExitedOrders(exited.data.data[0]?.counted ?? 0)
        setCartLength(cart.data.data ?? 0)
        setWarehouseStock({
          wireSpoolCount: stock.data.data[0]?.wireSpoolCount ?? 0,
          InsulCount: stock.data.data[0]?.InsulCount ?? 0,
          cartCount: stock.data.data[0]?.cartCount ?? 0,
        },)
        setNoQc({
          wireSpoolCount: naQc.data.data[0]?.wireSpoolCount ?? 0,
          InsulCount: naQc.data.data[0]?.InsulCount ?? 0,
          cartCount: naQc.data.data[0]?.cartCount ?? 0,
        })
        setLastOfUsOrders(lastOfUs.data.data)
        setLastOfUs2Orders(lastOfUs2.data.data)

      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="flex flex-col w-full">
      <main className="flex-1 overflow-y-auto bg-whiteback">
        <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-prim text-white flex flex-col justify-center gap-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-m font-bold">
                  سفارشات ثبت شده
                </CardTitle>
                <DollarSign className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submittedOrders}</div>
                <p className="text-xs text-white">
                  سفارش در انتظار جمع آوری است
                </p>
              </CardContent>
            </Card>
            <Card className="bg-sec text-white flex flex-col justify-center gap-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-m font-bold">
                  سفارشات جمع آوری شده
                </CardTitle>
                <Users className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gatheredOrders}</div>
                <p className="text-xs text-white">
                  سفارش جمع آوری شده
                </p>
              </CardContent>
            </Card>
            <Card className="bg-suppink text-white flex flex-col justify-center gap-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-m font-bold">سفارشات ارسال شده</CardTitle>
                <CreditCard className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exitedOrders}</div>
                <p className="text-xs text-white">
                   سفارش از کارخانه خارج شده
                </p>
              </CardContent>
            </Card>
            <Card className="bg-supblue text-white flex flex-col justify-center gap-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-m font-bold">محصولات بدون QC</CardTitle>
                <ShoppingCart className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{noQc.wireSpoolCount + noQc.InsulCount + noQc.cartCount}</div>
                <p className="text-xs text-white">
                  محصولاتی که داری تاییدیه کنترل کیفی نیستند
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
                      <TableHead>شماره سفارش</TableHead>
                      <TableHead className="hidden xl:table-cell">وضعیت</TableHead>
                      <TableHead className="hidden xl:table-cell">تاریخ</TableHead>
                      <TableHead className="text-right">شناسه مشتری</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastOfUsOrders.map((order) => (
                      <TableRow key={order.ordId}>
                        <TableCell>
                          <div className="font-medium">{order.ordId}</div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge variant="outline">
                            {order.orderSituation === 'submitted' ? 'ثبت شده' : 
                             order.orderSituation === 'exited' ? 'خارج شده' : order.orderSituation}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {new Date(order.orderDate).toLocaleDateString('fa-IR')}
                        </TableCell>
                        <TableCell className="text-right">{order.custId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>آخرین سفارشات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {lastOfUs2Orders.map((order) => (
                  <div key={order.ordId} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{order.custId.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{order.userId}</p>
                      <p className="text-sm text-muted-foreground">{order.custId}</p>
                    </div>
                    <div className="ml-auto font-medium">
                      {new Date(order.orderDate).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        <Noodle/>
              <div className="flex flex-row gap-4 justify-between content-stretch">
                  <Radial cartLength={cartLength}/>
                  <VertBar warehouseStock={warehouseStock} />
                </div>
          </div>
  </main>
</div>

  )
}


export function VertBar({ warehouseStock }: { warehouseStock: { wireSpoolCount: number; InsulCount: number; cartCount: number } }) {
  const chartData = [
    { item: "Wire Spool", count: warehouseStock.wireSpoolCount, fill: "#4b49ac" },
    { item: "Insul", count: warehouseStock.InsulCount, fill: "var(--color-safari)" },
    { item: "Cart", count: warehouseStock.cartCount, fill: "var(--color-firefox)" },
  ]

  const chartConfig = {
    count: {
      label: "تعداد",
    },
    "Wire Spool": {
      label: "قرقره سیم",
      color: "#4b49ac",
    },
    "Insul": {
      label: "عایق",
      color: "#98bdff",
    },
    "Cart": {
      label: "سبد",
      color: "#7da0fa",
    },
  } satisfies ChartConfig

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>موجودی انبار</CardTitle>
        <CardDescription>وضعیت فعلی</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -10,
            }}
          >
            <YAxis
              dataKey="item"
              type="category"
              tickLine={true}
              tickMargin={30}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="count" type="number" tickLine={true} axisLine={false}/>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          موجودی کل: {warehouseStock.wireSpoolCount + warehouseStock.InsulCount + warehouseStock.cartCount}
        </div>
      </CardFooter>
    </Card>
  )
}



export function Radial({ cartLength }: RadialProps) {
  const chartData = [
    { browser: "safari", visitors: cartLength, fill: "var(--color-safari)" },
  ]
  
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "#f3797e",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col justify-between w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>چارت دایره ایی</CardTitle>
        <CardDescription>ژانویه - ژوئن ۲۰۲۴</CardDescription>
      </CardHeader>
      <CardContent className="flex-2 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 30}
                          className="fill-muted-foreground"
                        >
                          کیلومتر
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          میزان سیم تولید شده (کیلومتر) <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          
        </div>
      </CardFooter>
    </Card>
  )
}