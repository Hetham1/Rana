import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportData {
  [key: string]: string | number | null; // Data can have different types, adjust as necessary
}

export default function Report() {
  const [wpId, setWpId] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("wsp");
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    const queris = `searchType=${searchType}&wpId=${wpId}`;
    const token = localStorage.getItem('token')
    axios
      .get(`${apiUrl}/adminreport?${queris}`, {
        headers: {
          Authorization: `${token}` // Adjust this based on your token logic
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
  };

  // Extract table headers dynamically from the first data item
  const getTableHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const renderTableRows = () => {
    return data.map((item, index) => (
      <TableRow key={index}>
        {Object.values(item).map((value, idx) => (
          <TableCell key={idx}>{value ?? "N/A"}</TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div>
      {/* Drawer for filter options */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">باز کردن فیلترها</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">فیلترهای گذارش</DrawerTitle>
          </DrawerHeader>

          {/* Filter inputs */}
          <div className="space-y-4 p-4">
            <Input
              className="text-center"
              placeholder="شناسه محل کار را وارد کنید"
              value={wpId}
              onChange={(e) => setWpId(e.target.value)}
            />
            <Select onValueChange={(value) => setSearchType(value)} defaultValue="wsp">
              <SelectTrigger>
                <SelectValue placeholder="نوع را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wsp">قرقره</SelectItem>
                <SelectItem value="ins">عایق</SelectItem>
                <SelectItem value="car">کارت</SelectItem>
                <SelectItem value="fip">محصول نهایی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DrawerFooter>
            <Button onClick={handleSubmit}>تایید</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Table to display data */}
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
