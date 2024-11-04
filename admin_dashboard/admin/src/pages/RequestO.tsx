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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Importing Select components
import { toast } from "sonner"
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

interface User {
  userId: string;
  fullName: string;
  username: string;
}

export default function Component() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newRequest, setNewRequest] = useState({
    reqType: "",
    reqDetail: "",
    reqReciever: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comboOptions, setComboOptions] = useState<User[]>([]);

  const fetchRequests = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    setLoading(true); // Set loading state to true while fetching data
    axios
      .get(`${apiUrl}/adminrequest/sent?userId=${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setRequests(response.data.data);
        setLoading(false); // Set loading state to false after fetching data
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setLoading(false); // Set loading state to false on error
      });
  };

  const fetchComboBoxOptions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.success) {
        setComboOptions(response.data.data); // Assuming users data is in 'data' field
      } else {
        console.warn('Failed to fetch combo box options');
      }
    } catch (error) {
      console.error('Error fetching combo box options:', error);
    }
  };

  useEffect(() => {
    fetchComboBoxOptions(); // Fetch users on component mount
    fetchRequests(); // Fetch requests on component mount
  }, []);

  // Handle request deletion
  const handleDelete = (reqId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token"); // Fetch the token from localStorage

    axios
      .delete(`${apiUrl}/adminrequest/sent/delete/${reqId}`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then(() => {
        toast.error("درخواست ارسالی حذف شد")
        // Remove the deleted request from the list
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.reqId !== reqId)
        );
      })
      .catch((error) => {
        console.error("Error deleting request", error);
      });
  };

  // Handle new request submission
  const handleSubmitNewRequest = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    setIsSubmitting(true);

    axios
      .post(
        `${apiUrl}/request/new`,
        {
          reqType: newRequest.reqType,
          reqDetail: newRequest.reqDetail,
          userId, // Send userId as reqSender
          reqReciever: newRequest.reqReciever, // Add receiver (selected userId)
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      .then(() => {
        fetchRequests(); // Refresh the list of requests after submission
        setNewRequest({ reqType: "", reqDetail: "", reqReciever: "" }); // Clear the form fields
        toast.success("درخواست ایجاد شد")
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error("Error submitting new request", error);
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <Card dir="rtl">
        <CardHeader>
          <CardTitle>درخواست‌های ارسالی</CardTitle>
          <CardDescription>
            مدیریت درخواست‌های ارسالی و مشاهده وضعیت آن‌ها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? ( // Show loading indicator if loading
            <div>در حال بارگذاری...</div> // You can replace this with a spinner component if you have one
          ) : (
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
                        <Button aria-haspopup="true" size="icon" variant="ghost" className="bg-supblue hover:bg-suppink text-white">
                        <MoreHorizontal className="h-4 w-4" />
                        =
                        <span className="sr-only">تنظیمات منو</span>
                      </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>عملیات</DropdownMenuLabel> 
                          <DropdownMenuItem className="bg-red-200 hover:bg-red-500 text-text hover:text-white" onClick={() => handleDelete(request.reqId)}>
                        حذف
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter style={{ textAlign: "right" }}>
          <div className="text-xs text-muted-foreground">
            نمایش داده شده از<strong> 1-{requests.length}</strong> از<strong>
              {" "}
              {requests.length}
            </strong>{" "}
            درخواست
          </div>
          {/* New Request Button */}
        </CardFooter>
      </Card>
      <div className="fixed bottom-0 right-0 m-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-supblue hover:bg-suppink border-none">درخواست جدید</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">درخواست جدید</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="نوع درخواست"
                value={newRequest.reqType}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, reqType: e.target.value })
                }
              />
              <Textarea
                placeholder="جزئیات"
                value={newRequest.reqDetail}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, reqDetail: e.target.value })
                }
              />

              {/* ComboBox for reqReciever */}
              <Select
                onValueChange={(value) =>
                  setNewRequest({ ...newRequest, reqReciever: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="گیرنده را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {comboOptions.map((user) => (
                    <SelectItem key={user.userId} value={user.userId}>
                      {user.fullName} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmitNewRequest}
                disabled={isSubmitting}
                className="bg-supblue hover:bg-suppink border-none"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
