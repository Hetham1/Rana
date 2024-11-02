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

import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import gregorian from "react-date-object/calendars/gregorian"

interface ReportData {
  [key: string]: string | number | null
}

export default function Component() {
  const [data, setData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)

 
  const convertToGregorian = (date: any): string => {
    if (!date) return ""
        return date.convert(gregorian).format("YYYY-MM-DD")
  }

  const handleSubmit = () => {
    setLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
  
 
    const formattedStartDate = convertToGregorian(startDate);
    const formattedEndDate = convertToGregorian(endDate);
  

    
    console.log("Formatted Start Date:", formattedStartDate);
    console.log("Formatted End Date:", formattedEndDate);
 
    
    if (!formattedStartDate || !formattedEndDate) {
      console.error("Invalid date(s)");
      setLoading(false);
      return;
    }
  
    const url = `${baseUrl}/adminreport/pp?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    
    const token = localStorage.getItem("token") || "";
  
    axios
      .get(url, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching report data:", error);
        setLoading(false);
      });
  }

  const getTableHeaders = (): string[] => {
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

  const datePickerStyle = {
    backgroundColor: "var(--background)",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    border: "1px solid var(--border)",
    width: "100%",
    height: "40px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  }

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">باز کردن فیلترها</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">فیلترهای گزارش</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4 w-full flex flex-col gap-4">
            <div className="w-full">
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={startDate}
                onChange={setStartDate}
                format="YYYY/MM/DD"
                placeholder="تاریخ شروع را وارد کنید"
                style={datePickerStyle}
                calendarPosition="bottom-right"
              />
            </div>
            <div className="w-full">
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={endDate}
                onChange={setEndDate}
                format="YYYY/MM/DD"
                placeholder="تاریخ پایان را وارد کنید"
                style={datePickerStyle}
                calendarPosition="bottom-right"
              />
            </div>
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