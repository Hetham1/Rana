import { useState, useEffect } from 'react';
import axios from 'axios';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";


interface RequestData {
  reqId: string;
  reqDate: string;
  reqType: string;
  reqDetail: string;
  reqSender: string;
}

export default function Requests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async (userId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/request?userId=${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
        
      });

      if (response.data && response.data.success) {
        setRequests(response.data.data);
      } else {
        console.warn('No data received or success flag is false:', response.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      fetchRequests(userId);
    } else {
      console.warn('No userId found in localStorage');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">در حال بارگذاری</div>;
  }

  return (
    <div className="flex flex-col h-full relative p-4">
      <h1 className="text-2xl font-bold mb-4">درخواست ها</h1>
      <div className="flex-grow overflow-auto pb-16">
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center text-gray-500">درخواستی موجود نیست</div>
          ) : (
            requests.map((request) => (
              <AlertDialog key={request.reqId}>
                <AlertDialogTrigger asChild>
                  <Alert className="cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <AlertTitle>{request.reqType}</AlertTitle>
                        <AlertDescription>
                          ارسال از: {request.reqSender} | تاریخ: {new Date(request.reqDate).toLocaleDateString()}
                        </AlertDescription>
                      </div>

                    </div>
                  </Alert>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='text-right'>{request.reqType} جزییات</AlertDialogTitle>
                    <AlertDialogDescription className='text-right'>
                      {request.reqDetail}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>بستن</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))
          )}
        </div>
      </div>
    </div>
  );
}