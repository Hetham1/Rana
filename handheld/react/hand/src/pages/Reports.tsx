import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MenuIcon } from 'lucide-react';
import axios from 'axios';
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
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { BASE_URL } from '../hooks/apiconfig';

// Define a flexible structure for table data
interface TableDataItem {
  [key: string]: any;
}

export default function Gozaresh() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comboBoxValue, setComboBoxValue] = useState<string>('');
  const [parameter1, setParameter1] = useState('');
  const [parameter2, setParameter2] = useState('');
  const [parameter3, setParameter3] = useState('');
  const [parameter4, setParameter4] = useState('');
  const [parameter5, setParameter5] = useState('');
  const [parameter6, setParameter6] = useState('');
  const [tableData, setTableData] = useState<TableDataItem[][]>([]); // Nested array to hold all the types of data

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const queries = `wpId=${parameter1}&date=${parameter2}&sector=${parameter3}&material=${parameter4}&color=${parameter5}&type=${parameter6}`;
      const response = await axios.get(`${BASE_URL}/report/query?${queries}`, {
        headers: {
          'Authorization': `${token}`,
        },
      });
  
      const data: TableDataItem[][] = response.data.data;
      setTableData(data);
      setSidebarOpen(false);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        alert(errorMessage);
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="p-4">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="default" size="icon">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-lg text-left font-semibold mb-4">Parameters</h2>
          <div className="space-y-4">
            <Input
              className='text-center'
              placeholder="wpid"
              value={parameter1}
              onChange={(e) => setParameter1(e.target.value)}
            />
            <Input
              className='text-center'
              value={parameter2}
              onChange={(e) => setParameter2(e.target.value)}
              type='date'
            />
            <div>
              <div className="w-full flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      {parameter3 || 'سکتور را انتخاب کنید'}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="جستجو" className="h-9" />
                      <CommandList>
                        <CommandEmpty>No letter found.</CommandEmpty>
                        <CommandGroup>
                          {letters.map((letter) => (
                            <CommandItem
                              key={letter}
                              value={letter}
                              onSelect={(currentValue) => {
                                setParameter3(currentValue);
                              }}
                            >
                              {letter}
                              <CheckIcon
                                className={`ml-auto h-4 w-4 ${parameter3 === letter ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Input
              className='text-center'
              placeholder="material"
              value={parameter4}
              onChange={(e) => setParameter4(e.target.value)}
            />
            <Input
              className='text-center'
              placeholder="color"
              value={parameter5}
              onChange={(e) => setParameter5(e.target.value)}
            />
            <Input
              className='text-center'
              placeholder="type"
              value={parameter6}
              onChange={(e) => setParameter6(e.target.value)}
            />
            <Button className="w-full" onClick={handleSubmit}>Submit</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-8">
        {tableData.map((dataGroup, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">uid {groupIndex + 1}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(dataGroup[0] || {}).map((column, index) => (
                    <TableHead key={index}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataGroup.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
}
