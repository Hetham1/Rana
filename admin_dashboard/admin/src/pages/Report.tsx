"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ReportData {
  [key: string]: string | number | null;
}

interface Workplace {
  wpId: string;
  wpName: string;
}

export default function Component() {
  const [wpId, setWpId] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("wsp");
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [workPlaceName, setWorkPlaceName] = useState<string>("");
  const [comboBoxData, setComboBoxData] = useState<{ value: string; label: string }[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);

  const headerMappings: { [key: string]: { [key: string]: string } } = {
    wsp: {
      wspId: "شناسه قرقره",
      wspDirection: "جهت",
      wspMaterial: "مواد",
      wspType: "نوع",
      wspPp: "برنامه تولید",
      wspState: "وضعیت",
      wspDate: "تاریخ",
      wspIn: "قرقره ورودی",
      wspOut: "قرقره خروجی",
      wspLength: "طول",
      wspWempty: "وزن خالی",
      wspWfull: "وزن پر",
      wspWpure: "وزن خالص",
      wspQC: "کنترل کیفیت",
      wpId: "شناسه محل کار",
      wspLL: "موقعیت",
      wspSector: "بخش",
      wspBj: "بیج",
    },
    ins: {
      insId: "شناسه عایق",
      insType: "نوع عایق",
      insCode: "کد عایق",
      manfId: "تامین کننده",
      insEntryDate: "تاریخ ورود",
      insRecNum: "شماره رسید",
      insState: "وضعیت",
      insEXP: "تاریخ انقضا",
      insLoc: "محل",
      insColor: "رنگ",
      insCount: "تعداد",
      insQC: "کنترل کیفیت",
      wpId: "شناسه محل کار",
      insLL: "موقعیت",
      insSector: "بخش",
    },
    car: {
      cartId: "شناسه سبد",
      cartType: "نوع سبد",
      cartDevice: "دستگاه",
      cartIn: "ورودی",
      cartOut: "خروجی",
      cartShift: "شیفت",
      cartLenght: "طول",
      prodName: "نام محصول",
      ppId: "شناسه تامین کننده",
      cartMFG: "تاریخ تولید",
      userId: "کاربر",
      cartColor: "رنگ",
      insulId: "شناسه عایق",
      wireSpId: "شناسه سیم پیچ",
      wpId: "شناسه محل کار",
      cartLL: "موقعیت",
      cartQc: "کنترل کیفیت",
    },
    fip: {
      fpId: "شناسه محصول نهایی",
      fpType: "نوع محصول",
      fpCart: "سبد محصول",
      uesrId: "کاربر",
      fpEndUserCode: "کد کاربر نهایی",
      fpLoc: "محل",
      fpSituation: "وضعیت",
      wpId: "شناسه محل کار",
      fpLL: "موقعیت",
      fpSector: "بخش",
      fpWrapped: "بسته‌بندی شده",
    },
  };

  const excludeFields: { [key: string]: string[] } = {
    wsp: [],
    ins: [],
    car: [],
    fip: [],
  };


console.log(workPlaceName)

  useEffect(() => {
    const workPlace = localStorage.getItem("workPlace");
    const token = localStorage.getItem("token");
    const apiUrl = import.meta.env.VITE_API_URL || "https://defaulturl.com";

    if (workPlace && token) {
      axios
        .get(`${apiUrl}/workplace?workPlace=${workPlace}`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((response) => {
          const { data } = response.data;
          if (data.length > 0) {
            setWorkPlaceName(data[0].wpName);
          }
        })
        .catch((error) => {
          console.error("Error fetching workPlace data:", error);
        });

      axios
        .get(`${apiUrl}/workplace`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((response) => {
          const { data } = response.data;
          if (Array.isArray(data)) {
            const frameworks = data.map((item: Workplace) => ({
              value: item.wpId,
              label: item.wpName,
            }));
            setComboBoxData(frameworks);
          }
        })
        .catch((error) => {
          console.error("Error fetching combo box data:", error);
        });
    }
  }, []);

  const handleSubmit = () => {
    if (!wpId) {
      setIsEmpty(true);
      toast.error("لطفا شناسه محل کار را انتخاب کنید");
    } else {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "https://defaulturl.com";
      const queris = `searchType=${searchType}&wpId=${wpId}`;
      const token = localStorage.getItem("token");
      axios
        .get(`${apiUrl}/adminreport?${queris}`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((response) => {
          setData(response.data.data);
          setLoading(false);
          if (response.data.success && response.data.data.length === 0) {
            toast.warning("محصول مورد نظر در مکان انتخاب شده وجود ندارد");
          }
        })
        .catch((error) => {
          console.error("Error fetching report data:", error);
          toast.error(error);
          setLoading(false);
        });
    }
  };

  const getTableHeaders = () => {
    if (data.length === 0) return [];
  
    // Get all fields for the current searchType
    const fields = Object.keys(data[0]);
  
    // Exclude fields based on the searchType
    const filteredFields = fields.filter(
      (field) => !excludeFields[searchType]?.includes(field)
    );
  
    // Map fields to their custom headers or fallback to field name
    return filteredFields.map((key) => headerMappings[searchType]?.[key] || key);
  };
  
  const renderTableRows = () => {
    if (data.length === 0) return null;
  
    // Get all fields for the current searchType
    const fields = Object.keys(data[0]);
  
    // Exclude fields based on the searchType
    const filteredFields = fields.filter(
      (field) => !excludeFields[searchType]?.includes(field)
    );
  
    return data.map((item, index) => (
      <TableRow key={index}>
        {filteredFields.map((key, idx) => (
          <TableCell key={idx}>{item[key] ?? "N/A"}</TableCell>
        ))}
      </TableRow>
    ));
  };

  const handleSelectTriggerClick = () => {
    setIsEmpty(false);
  };

  return (
    <div className="p-4">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">باز کردن فیلترهای گزارش کلی</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">فیلترهای گزارش</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            <Select onValueChange={(value) => setWpId(value)} value={wpId}>
              <SelectTrigger
                className={`text-center ${isEmpty ? "border-red-500" : ""}`}
                onClick={handleSelectTriggerClick}
              >
                <SelectValue placeholder="شناسه محل کار را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="text-center" position="popper">
                {comboBoxData.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setSearchType(value)} defaultValue="wsp">
              <SelectTrigger className="text-center">
                <SelectValue placeholder="نوع را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="text-center">
                <SelectItem value="wsp">قرقره</SelectItem>
                <SelectItem value="ins">عایق</SelectItem>
                <SelectItem value="car">سبد</SelectItem>
                <SelectItem value="fip">محصول نهایی</SelectItem>
              </SelectContent>
            </Select>
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
  );
}
