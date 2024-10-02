import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BASE_URL } from '../hooks/apiconfig';

interface RequestData {
  reqId: string;
  reqDate: string;
  reqType: string;
  reqDetail: string;
  reqSender: string;
}

interface UserOption {
  userId: string;
  fullName: string;
  username: string;
}

export default function Requests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ reqType: '', reqDetail: '', selectedOption: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comboOptions, setComboOptions] = useState<UserOption[]>([]);
  const [comboValue, setComboValue] = useState('');
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, reqType: e.target.value });
  };

  const fetchRequests = async (userId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/secrequest`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
        params: { userId },
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

  const fetchComboBoxOptions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.success) {
        setComboOptions(response.data.data);
      } else {
        console.warn('Failed to fetch combo box options');
      }
    } catch (error) {
      console.error('Error fetching combo box options:', error);
    }
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !formData.reqType || !comboValue) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/request/new`, {
        reqType: formData.reqType,
        reqDetail: formData.description,
        userId: userId,
        reqReciever: comboValue
      }, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        }
      });

      if (response.data.success) {
        alert(response.data.data); // Show success message
        fetchRequests(userId);
        setDialogOpen(false);
        // Reset form data
        setFormData({ reqType: '', reqDetail: '', selectedOption: '', description: '' });
        setComboValue('');
      } else {
        alert(response.data.error || 'An error occurred while creating the request.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error);
    } finally {
      setIsSubmitting(false);
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

  const isFormValid = formData.reqType && comboValue;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full relative p-4">
      <h1 className="text-2xl font-bold mb-4">درخواست ها</h1>
      <div className="flex-grow overflow-auto pb-16">
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center text-gray-500">No requests found</div>
          ) : (
            requests.map((request) => (
              <AlertDialog key={request.reqId}>
                <AlertDialogTrigger asChild>
                  <Alert className="cursor-pointer hover:bg-suppink hover:text-white transition-colors">
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
                    <AlertDialogTitle>{request.reqType} Details</AlertDialogTitle>
                    <AlertDialogDescription>
                      {request.reqDetail}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4"
            onClick={fetchComboBoxOptions}
          >
            درخواست جدید 
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-right'>ایجاد درخواست جدید</AlertDialogTitle>
            <AlertDialogDescription className='text-right'>
              لطفا اطلاعات لازمه را وارد کنید
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex flex-row justify-center items-right gap-2 bg-whitebox py-4 rounded-md">
            <label className={`px-4 py-2 rounded-lg cursor-pointer text-white font-semibold transition ${formData.reqType === '1' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <input
                type="radio"
                name="option"
                value="1"
                className="hidden"
                onChange={handleRadioChange}
                checked={formData.reqType === '1'}
              />
              ورود
            </label>
            
            <label className={`px-4 py-2 rounded-lg cursor-pointer text-white font-semibold transition ${formData.reqType === '2' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <input
                type="radio"
                name="option"
                value="2"
                className="hidden"
                onChange={handleRadioChange}
                checked={formData.reqType === '2'}
              />
              خروج
            </label>
            
            <label className={`px-4 py-2 rounded-lg cursor-pointer text-white font-semibold transition ${formData.reqType === '3' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <input
                type="radio"
                name="option"
                value="3"
                className="hidden"
                onChange={handleRadioChange}
                checked={formData.reqType === '3'}
              />
              ریجکت
            </label>
              <Popover open={isComboOpen} onOpenChange={setIsComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboOpen}
                  className="w-full justify-between"
                >
                  {comboValue
                    ? comboOptions.find((option) => option.userId === comboValue)?.fullName || 'Select an option'
                    : "کاربران"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="جستجو" />
                  <CommandList>
                    <CommandEmpty>کاربری یافت نشد</CommandEmpty>
                    <CommandGroup>
                      {comboOptions.map((option) => (
                        <CommandItem
                          key={option.userId}
                          onSelect={() => {
                            setComboValue(option.userId);
                            setIsComboOpen(false);
                          }}
                        >
                          <Check
                            className={comboValue === option.userId ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0"}
                          />
                          {option.fullName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            </div>

            

            <Textarea
              placeholder="توضیحات"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <AlertDialogFooter className='gap-4'>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>لغو</AlertDialogCancel>
            <Button
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
              className="disabled:opacity-50"
            >
              {isSubmitting ? 'در حال پردازش..' : 'ثبت درخواست'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}