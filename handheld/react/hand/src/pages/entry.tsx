import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const apiUrl = import.meta.env.VITE_API_URL


// Define the type for the workplace data
interface Workplace {
  wpId: string;
  wpName: string;
  wpType: string;
  wpAddress: string;
  wpPhoneNumber: string;
}

// Define the type for the comboBox data
interface Framework {
  value: string;
  label: string;
}

export default function Entry() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [comboBoxData, setComboBoxData] = useState<Framework[]>([]); // Initialize as an empty array
  const [workPlaceName, setWorkPlaceName] = useState(''); // State for workplace name
  const [radioOption, setRadioOption] = useState<string>(''); // State for radio button choice
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const workPlace = localStorage.getItem('workPlace'); 
    const token = localStorage.getItem('token')
    setWorkPlaceName(workPlace || 'درحال بارگذاری...');
    if (workPlace) {
      
      


      axios.get(`${apiUrl}/workplace`, {
        headers: {
          'Authorization': `${token}`
        }
      })
        .then((response) => {
          const { data } = response.data; 
          if (Array.isArray(data)) {
            const frameworks = data.map((item: Workplace) => ({
              value: item.wpId,
              label: item.wpName
            }));
            setComboBoxData(frameworks); 
          } else {
            console.error('Unexpected response data:', data);
          }
        })
        .catch((error) => {
          console.error('Error fetching combo box data:', error);
        });
    }
  }, []);


  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadioOption(e.target.value);
  };


  const handleSubmit = () => {
    localStorage.setItem('radioOption', radioOption);
    localStorage.setItem('comboBoxValue', value);
    navigate('/qr'); 
  };


  const isSubmitDisabled = !radioOption || !value;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 space-y-6 ">
      <p className="text-xl font-semibold">{"مکان فعلی شما: " + workPlaceName || 'درحال بارگذاری...'}</p>

      <div className="p-4 flex flex-col-reverse gap-6 rounded-md bg-whitebox">
        <div className="flex flex-row justify-center items-right gap-2 bg-whitebox p-4 rounded-md">
        <label
        className={`px-4 py-2 rounded-lg cursor-pointer text-center text-white font-semibold transition ${
          radioOption === '1' ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <input
          type="radio"
          name="option"
          value="1"
          className="hidden text-center"
          onChange={handleRadioChange}
          checked={radioOption === '1'}
        />
        ورود
      </label>

      <label
        className={`px-4 py-2 rounded-lg cursor-pointer text-center text-white font-semibold transition ${
          radioOption === '2' ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <input
          type="radio"
          name="option"
          value="2"
          className="hidden text-center"
          onChange={handleRadioChange}
          checked={radioOption === '2'}
        />
        خروج
      </label>

      <label
        className={`px-4 py-2 rounded-lg cursor-pointer text-center text-white font-semibold transition ${
          radioOption === '3' ? 'bg-blue-500' : 'bg-red-100'
        }`}
      >
        <input
          type="radio"
          name="option"
          value="3"
          className="hidden"
          onChange={handleRadioChange}
          checked={radioOption === '3'}
          disabled={true}
        />
        ریجکت
      </label>
      </div>

        <div className="flex justify-center items-center bg-whitebox p-4 rounded-md">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {value
                  ? comboBoxData.find((item) => item.value === value)?.label
                  : "مقصد را مشخص کنید"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="جستجو" className="h-9" />
                <CommandList>
                  <CommandEmpty>مکانی یافت نشد</CommandEmpty>
                  <CommandGroup>
                    {Array.isArray(comboBoxData) && comboBoxData.length > 0 ? (
                      comboBoxData.map((framework: Framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          {framework.label}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              value === framework.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))
                    ) : (
                      <div>مکانی یافت نشد</div> // Display a fallback if there's no data
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Button variant="outline" onClick={handleSubmit} disabled={isSubmitDisabled}>
          انتقال به صفحه اسکن
        </Button>
      </div>
    </div>
  );
}
