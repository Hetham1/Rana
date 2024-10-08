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

import { BASE_URL } from '../hooks/apiconfig';

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

    if (workPlace) {
      
      axios.get(`${BASE_URL}/workplace?workPlace=${workPlace}`)
        .then((response) => {
          const { data } = response.data; // Extract data from response
          if (data.length > 0) {
            setWorkPlaceName(data[0].wpName); // Set workplace name
          }
        })
        .catch((error) => {
          console.error('Error fetching workPlace data:', error);
        });

      // Fetch all workplace data for the combo box
      axios.get(`${BASE_URL}/workplace`)
        .then((response) => {
          const { data } = response.data; // Extract data from response
          if (Array.isArray(data)) {
            const frameworks = data.map((item: Workplace) => ({
              value: item.wpId,
              label: item.wpName
            }));
            setComboBoxData(frameworks); // Set data for the combo box options
          } else {
            console.error('Unexpected response data:', data);
          }
        })
        .catch((error) => {
          console.error('Error fetching combo box data:', error);
        });
    }
  }, []);

  // Function to handle radio button change
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadioOption(e.target.value);
  };

  // Function to handle navigation
  const handleSubmit = () => {
    localStorage.setItem('radioOption', radioOption);
    localStorage.setItem('comboBoxValue', value);
    navigate('/qr'); // Navigate to the QR page
  };

  // Check if both radioOption and comboBox value are selected
  const isSubmitDisabled = !radioOption || !value;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 space-y-6 ">
      <p className="text-xl font-semibold">{workPlaceName || 'Loading workplace name...'}</p>

      <div className="p-4 flex flex-row gap-6 rounded-md bg-whitebox">
        <div className="flex flex-col justify-center items-right gap-2 bg-whitebox p-4 rounded-md">
          <label>
            <input type="radio" name="option" value="1" className="mr-2" onChange={handleRadioChange} />
            ورود
          </label>
          <label>
            <input type="radio" name="option" value="2" className="mr-2" onChange={handleRadioChange} />
            خروج
          </label>
          <label>
            <input type="radio" name="option" value="3" className="mr-2" onChange={handleRadioChange} />
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
                  <CommandEmpty>No framework found.</CommandEmpty>
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
                      <div>No data available</div> // Display a fallback if there's no data
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
          Submit
        </Button>
      </div>
    </div>
  );
}
