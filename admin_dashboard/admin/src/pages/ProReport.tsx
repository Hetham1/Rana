"use client"

import { useState } from "react"
import axios from "axios"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
interface ReportData {
  [key: string]: string | number | null
}



export default function Component() {

  const [data, setData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [startDate, setstartDate] = useState<Date>()
  const [endDate, setendDate] = useState<Date>()



  const handleSubmit = () => {
    setLoading(true)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://defaulturl.com'

    const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : ""
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : ""

    const queris = `startDate=${formattedStartDate}&endDate=${formattedEndDate}`

    console.log(startDate, endDate)

    const token = localStorage.getItem('token')
    axios
      .get(`${apiUrl}/adminreport/pp?${queris}`, {
        headers: {
          Authorization: `${token}`
        },
      })
      .then((response) => {
        setData(response.data.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching report data:", error)
        setLoading(false)
      })
  }

  const getTableHeaders = () => {
    if (data.length === 0) return []
    return Object.keys(data[0])
  }

  const renderTableRows = () => {
    return data.map((item, index) => (
      <TableRow key={index}>
        {Object.values(item).map((value, idx) => (
          <TableCell key={idx}>{value ?? "N/A"}</TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">باز کردن فیلترها</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">فیلترهای گذارش</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4 w-full felx flex-row flex-nowrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "yyyy-MM-dd") : <span>تاریخ شروع را وارد کنید</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setstartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "yyyy-MM-dd") : <span>تاریخ  ایران </span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setendDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          </div>

          <DrawerFooter>
            <Button onClick={handleSubmit}>تایید</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {getTableHeaders().map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      )}
    </div>
  )
}