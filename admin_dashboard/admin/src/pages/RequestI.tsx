import { useEffect, useState } from "react";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Request {
  reqId: string;
  reqDate: string;
  reqType: string;
  reqDetail: string;
  reqOk: string;
  reqSender: string;
  reqReciever: string;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRequests = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    axios
      .get(`${apiUrl}/adminrequest/received?userId=${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setRequests(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (reqId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token')
    axios
      .put(`${apiUrl}/adminrequest/received/approve/${reqId}`, {}, {
        headers: {
          Authorization: `${token}`
        },
      })
      .then((response) => {
        console.log("Request approved:", response.data);
        fetchRequests(); 
      })
      .catch((error) => {
        console.error("Error approving request", error);
      });
  };

  const handleDeny = (reqId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token')
    axios
      .put(`${apiUrl}/adminrequest/received/deny/${reqId}`, {}, {
        headers: {
          Authorization: `${token}`
        },
      })
      .then((response) => {
        console.log("Request denied:", response.data);
        fetchRequests(); 
      })
      .catch((error) => {
        console.error("Error denying request", error);
      });
  };

  if (loading) {
    return <div className="text-center">درحال بارگذاری...</div>;
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>درخواست‌های دریافتی</CardTitle>
        <CardDescription>
          مدیریت درخواست‌های دریافتی و مشاهده وضعیت آن‌ها.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>تاریخ</TableHead>
              <TableHead>نوع درخواست</TableHead>
              <TableHead>جزئیات</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>فرستنده</TableHead>
              <TableHead>گیرنده</TableHead>
              <TableHead>
                <span className="sr-only">عملیات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.reqId}>
                <TableCell>{new Date(request.reqDate).toLocaleString()}</TableCell>
                <TableCell>{request.reqType}</TableCell>
                <TableCell>{request.reqDetail || "بدون جزئیات"}</TableCell>
                <TableCell>
                  <Badge variant={request.reqOk === "1" ? "outline" : "secondary"}>
                    {request.reqOk}
                  </Badge>
                </TableCell>
                <TableCell>{request.reqSender}</TableCell>
                <TableCell>{request.reqReciever}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" className="bg-supblue hover:bg-suppink text-white">
                        <MoreHorizontal className="h-4 w-4" />
                        =
                        <span className="sr-only">تنظیمات منو</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel className="text-right">عملیات</DropdownMenuLabel>
                      <DropdownMenuItem className=" bg-green-200 hover:bg-green-400 text-text hover:text-white" onClick={() => handleApprove(request.reqId)}>
                        تایید
                      </DropdownMenuItem>
                      <DropdownMenuItem className=" bg-red-200 hover:bg-red-500 text-text hover:text-white" onClick={() => handleDeny(request.reqId)}>
                        رد
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter style={{ textAlign: "right" }}>
        <div className="text-xs text-muted-foreground">
          نمایش داده شده از<strong> 1-{requests.length}</strong> از<strong> {requests.length}</strong> درخواست
        </div>
      </CardFooter>
    </Card>
  );
}
