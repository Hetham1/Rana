import { useState, useEffect } from 'react';
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
const apiUrl = import.meta.env.VITE_API_URL

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

interface manfOption {
  manfName: string;
}

interface highOption {
  prodName: string;
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

  // New state for additional comboboxes
  const [combo1Options, setCombo1Options] = useState<highOption[]>([]);
  const [combo1Value, setCombo1Value] = useState('');
  const [isCombo1Open, setIsCombo1Open] = useState(false);
  const [combo2Options, setCombo3Options] = useState<manfOption[]>([]);
  const [combo2Value, setCombo2Value] = useState('');
  const [isCombo2Open, setIsCombo2Open] = useState(false);

  const fetchRequests = async (userId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/secrequest`, {
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
      const response = await axios.get(`${apiUrl}/users`, {
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

  // New functions to fetch options for additional comboboxes
  const fetchCombo1Options = async () => {
    try {
      const response = await axios.get(`${apiUrl}/prod/highdemand`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.success) {
        setCombo1Options(response.data.data);
      } else {
        console.warn('Failed to fetch combo1 options');
      }
    } catch (error) {
      console.error('Error fetching combo1 options:', error);
    }
  };

  const fetchCombo3Options = async () => {
    try {
      const response = await axios.get(`${apiUrl}/manf/name`, {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.success) {
        setCombo3Options(response.data.data);
      } else {
        console.warn('Failed to fetch combo2 options');
      }
    } catch (error) {
      console.error('Error fetching combo2 options:', error);
    }
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !combo1Value || !combo2Value || !comboValue) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${apiUrl}/request/new`, {
        
        userId: userId,
        reqReciever: comboValue,
        reqDetail: combo2Value + " - " + formData.description,
        reqType: combo1Value 
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
        setCombo1Value('');
        setCombo2Value('');
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

  const isFormValid = combo1Value && combo2Value && comboValue;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">در حال بارگذاری...</div>;
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
                    <AlertDialogTitle className='text-right'>{request.reqType} </AlertDialogTitle>
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

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4"
            onClick={() => {
              fetchComboBoxOptions();
              fetchCombo1Options();
              fetchCombo3Options();
            }}
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
            <div className="flex flex-col gap-4 bg-whitebox py-4 rounded-md">
              {/* Combo1 */}
              <Popover open={isCombo1Open} onOpenChange={setIsCombo1Open}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCombo1Open}
                    className="w-full justify-between"
                  >
                    {combo1Value
                      ? combo1Options.find((option) => option.prodName === combo1Value)?.prodName || 'Select an option'
                      : "مواد"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="جستجو" />
                    <CommandList>
                      <CommandEmpty>گزینه ای یافت نشد</CommandEmpty>
                      <CommandGroup>
                        {combo1Options.map((option) => (
                          <CommandItem
                            key={option.prodName}
                            onSelect={() => {
                              setCombo1Value(option.prodName);
                              setIsCombo1Open(false);
                            }}
                          >
                            <Check
                              className={combo1Value === option.prodName ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0"}
                            />
                            {option.prodName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Combo2 */}
              

              <Popover open={isCombo2Open} onOpenChange={setIsCombo2Open}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCombo2Open}
                    className="w-full justify-between"
                  >
                    {combo2Value
                      ? combo2Options.find((option) => option.manfName === combo2Value)?.manfName || 'Select an option'
                      : "ارسال از"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="جستجو" />
                    <CommandList>
                      <CommandEmpty>گزینه ای یافت نشد</CommandEmpty>
                      <CommandGroup>
                        {combo2Options.map((option) => (
                          <CommandItem
                            key={option.manfName}
                            onSelect={() => {
                              setCombo2Value(option.manfName);
                              setIsCombo2Open(false);
                            }}
                          >
                            <Check
                              className={combo2Value === option.manfName ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0"}
                            />
                            {option.manfName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

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
                      : "ارسال به"}
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
              {/* Existing Combobox (unchanged) */}
              
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