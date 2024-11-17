"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_en"
import gregorian from "react-date-object/calendars/gregorian"

interface ReportData {
  [key: string]: string | number | null
}

export default function Component() {
  const [data, setData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)
  const [selectedDays, setSelectedDays] = useState<number>(180)

  const headerMappings: { [key: string]: { [key: string]: string } } = {
    pp: {
      ppId: "شماره تولید",
      ppMFG: "تاریخ تولید",
      ppDevice: "خط تولید",
      ppProductAmount: "مقدار محصول تولیدی",
      ppLinearVel: "سرعت خطی",
      ppOverlap: "اورلپ",
      insId: "کد عایق مصرفی", 
      ppProdState: "وضعیت محصول",
      ppLength: "طول تولیدی",
      ppGauge: "ضخامت تولیدی",
      ppAnnealing: "درصد آنیل",
      insType: "نوع عایق مصرفی",
      insColor: "رنگ عایق مصرفی",
      ppSize: "سایز نولید",
      prodId: "محصول تولیدی", 
      ppOutGauge: "قطر خروجی",
      ppArcLength: "طول تاب",
      ppMaterialAmount: "مقدار مواد",
      ppInSp: "سرعت ورودی",
      ppOutSp: "سرعت خروجی",
      ppUserId: "شناسه کاربر",
      ppSituation: "وضعیت",
      ppDetail: "جزئیات",
      wspId: "رسانه مصرفی",
    },
  }
 
  const excludeFields: { [key: string]: string[] } = {
    pp: [],
  }

  useEffect(() => {
    fetchDefaultData(selectedDays)
  }, [])

  const fetchDefaultData = (days: number) => {
    setLoading(true)
    setSelectedDays(days)
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
    const url = `${baseUrl}/adminreport/pp/default?daysBefore=${days}`
    const token = localStorage.getItem("token") || ""

    axios
      .get(url, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data)
        setLoading(false)
        if (response.data.success && response.data.data.length === 0) {
          toast.warning("داده‌ای برای نمایش وجود ندارد")
        }
      })
      .catch((error) => {
        console.error("Error fetching default data:", error)
        setLoading(false)
        toast.error("خطا در دریافت اطلاعات")
      })
  }

  const convertToGregorian = (date: any): string => {
    if (!date) return ""
    const gregorianDate = date.convert(gregorian).format("YYYY-MM-DD")
    const [year, month, day] = gregorianDate.split("-")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("لطفا تاریخ پایان را وارد کنید")
      return
    }

    setLoading(true)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
    const formattedStartDate = convertToGregorian(startDate)
    const formattedEndDate = convertToGregorian(endDate)
    
    const url = `${baseUrl}/adminreport/pp?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    const token = localStorage.getItem("token") || ""

    axios
      .get(url, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data)
        setLoading(false)
        if (response.data.success && response.data.data.length === 0) {
          toast.warning("برنامه تولیدی در بازه انتخابی وجود ندارد")
        }
      })
      .catch((error) => {
        console.error("Error fetching report data:", error)
        setLoading(false)
        toast.error("برنامه تولیدی در بازه انتخابی وجود ندارد")
      })
  }

  const getTableHeaders = (): string[] => {
    if (data.length === 0) return []
    
    const fields = Object.keys(data[0])
    const filteredFields = fields.filter(
      (field) => !excludeFields.pp?.includes(field)
    )
    
    return filteredFields.map((key) => headerMappings.pp[key] || key)
  }

  const renderTableRows = () => {
    if (data.length === 0) return null

    const fields = Object.keys(data[0])
    const filteredFields = fields.filter(
      (field) => !excludeFields.pp?.includes(field)
    )

    return data.map((item, index) => (
      <TableRow key={index}>
        {filteredFields.map((key, idx) => (
          <TableCell key={idx}>{item[key] ?? "N/A"}</TableCell>
        ))}
      </TableRow>
    ))
  }

  const datePickerStyle = {
    backgroundColor: "var(--background)",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    border: "1px solid var(--border)",
    width: "100vw",
    height: "40px",
    fontSize: "14px",
    display: "flex",
    text: "center",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <Button 
          variant={selectedDays === 7 ? "default" : "outline"}
          onClick={() => fetchDefaultData(7)}
        >
          7 روز اخیر
        </Button>
        <Button 
          variant={selectedDays === 30 ? "default" : "outline"}
          onClick={() => fetchDefaultData(30)}
        >
          30 روز اخیر
        </Button>
        <Button 
          variant={selectedDays === 180 ? "default" : "outline"}
          onClick={() => fetchDefaultData(180)}
        >
          180 روز اخیر
        </Button>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">باز کردن فیلتر تاریخ</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">تاریخ های شروع و پایان را وارد کنید</DrawerTitle>
            </DrawerHeader>

            <div className="space-y-4 p-4 w-full flex flex-col flex-nowrap gap-4">
              <div className="w-full">
                <DatePicker
                  calendar={persian}
                  locale={persian_en}
                  value={startDate}
                  onChange={setStartDate}
                  format="YYYY/MM/DD"
                  placeholder="تاریخ شروع"
                  style={datePickerStyle}
                  calendarPosition="bottom-right"
                  digits={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                />
              </div>
              <div className="w-full">
                <DatePicker
                  calendar={persian}
                  locale={persian_en}
                  value={endDate}
                  onChange={setEndDate}
                  format="YYYY/MM/DD"
                  placeholder="تاریخ پایان"
                  style={datePickerStyle}
                  calendarPosition="bottom-right"
                  digits={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                />
              </div>
            </div>

            <DrawerFooter>
              <Button onClick={handleSubmit}>تایید</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

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