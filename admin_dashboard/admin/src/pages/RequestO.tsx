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

// Define the type for the request data
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

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const userId = localStorage.getItem("userId");
    axios
      .get(`${apiUrl}/adminrequest/sent?userId=${userId}`, {
        headers: {
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiaWF0IjoxNzI4Mzc5NTY0fQ.H0OZY653a-Of1Jmfq30T3dsh-TVeaH40HJyLJdTdimY",
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
  }, []);

  // Handle request deletion
  const handleDelete = (reqId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .delete(`${apiUrl}/adminrequest/sent/delete/${reqId}`, {
        headers: {
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiaWF0IjoxNzI4Mzc5NTY0fQ.H0OZY653a-Of1Jmfq30T3dsh-TVeaH40HJyLJdTdimY",
        },
      })
      .then(() => {
        // Remove the deleted request from the list
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.reqId !== reqId)
        );
      })
      .catch((error) => {
        console.error("Error deleting request", error);
      });
  };

  if (loading) {
    return <div className="text-center">درحال بارگذاری...</div>;
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>درخواست‌ها</CardTitle>
        <CardDescription>مدیریت درخواست‌ها و مشاهده وضعیت آن‌ها.</CardDescription>
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
                <TableCell>
                  {new Date(request.reqDate).toLocaleString()}
                </TableCell>
                <TableCell>{request.reqType}</TableCell>
                <TableCell>{request.reqDetail || "بدون جزئیات"}</TableCell>
                <TableCell>
                  <Badge
                    variant={request.reqOk === "1" ? "outline" : "secondary"}
                  >
                    {request.reqOk}
                  </Badge>
                </TableCell>
                <TableCell>{request.reqSender}</TableCell>
                <TableCell>{request.reqReciever}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">تنظیمات منو</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDelete(request.reqId)}
                      >
                        حذف
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
          نمایش داده شده از<strong> 1-{requests.length}</strong> از<strong>
            {" "}
            {requests.length}
          </strong>{" "}
          درخواست
        </div>
      </CardFooter>
    </Card>
  );
}
