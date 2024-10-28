import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlignJustify, } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Import for modal
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

const apiUrl = import.meta.env.VITE_API_URL

interface TableDataItem {
  column1: string;
  column2: string;
  column3: string;
}

export default function Gozaresh() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parameter1, setParameter1] = useState('');
  const [parameter2, setParameter2] = useState('');
  const [parameter3, setParameter3] = useState('');
  const [parameter4, setParameter4] = useState('');
  const [parameter5, setParameter5] = useState('');
  const [parameter6, setParameter6] = useState('');
  const [tableData, setTableData] = useState<any[]>([]); // Stores the entire API data
  const [filteredData, setFilteredData] = useState<any[]>([]); // Stores the filtered data
  const [selectedItem, setSelectedItem] = useState<any>(null); // Stores the selected item for the popup
  const [isDialogOpen, setDialogOpen] = useState(false); // Controls the visibility of the dialog

  const handleSubmit = async () => {
    try {
      
      const token = localStorage.getItem('token');
      const queries = `wpId=${parameter1}&date=${parameter2}&sector=${parameter3}&material=${parameter4}&color=${parameter5}&type=${parameter6}`;
      console.log(parameter4)
      const response = await axios.get(`${apiUrl}/report/query?${queries}`, {
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

  const handleFilter = (section: 'wsp' | 'insul' | 'fp') => {
    switch (section) {
      case 'wsp':
        setFilteredData(tableData[0]);
        break;
      case 'insul':
        setFilteredData(tableData[1]);
        break;
      case 'fp':
        setFilteredData(tableData[2]);
        break;
      default:
        setFilteredData([]);
    }
  };

  const openDialog = (item: any) => {
    setSelectedItem(item); // Set the selected item for the popup
    setDialogOpen(true); // Open the dialog
  };
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  return (
    <div className="p-4">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="default" size='icon' className='bg-suppink w-12 p-0'>
            <AlignJustify/>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <h2 className="text-lg text-center font-semibold mb-4">پارامتر ها</h2>
          <div className="space-y-4">
            <Input
              className='text-center'
              placeholder="شناسه مکان"
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
                    <Button variant="outline" className="w-full font-extralight">
                      {parameter3 || 'سکتور '}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="جستجو" className="h-9" />
                      <CommandList>
                        <CommandEmpty>سکتور یافت نشد</CommandEmpty>
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
              placeholder="جنس قرقره"
              value={parameter4}
              onChange={(e) => setParameter4(e.target.value)}
            />
            <Input
              className='text-center'
              placeholder="رنگ عایق"
              value={parameter5}
              onChange={(e) => setParameter5(e.target.value)}
            />
            <Input
              className='text-center'
              placeholder="نوع محصول"
              value={parameter6}
              onChange={(e) => setParameter6(e.target.value)}
            />
            <Button className="w-full bg-sec" onClick={handleSubmit}>جستجو</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-8">
        {tableData.length > 0 && (
          <div className='flex flex-row gap-2 justify-center'>
          <Button onClick={() => handleFilter('wsp')} className='bg-sec'>
            قرقره ({tableData[0]?.length || 0})
          </Button>
    
          <Button onClick={() => handleFilter('insul')} className='bg-sec'>
            عایق ({tableData[1]?.length || 0})
          </Button>
    
          <Button onClick={() => handleFilter('fp')} className='bg-sec'>
            محصول نهایی ({tableData[2]?.length || 0})
          </Button>
        </div>
        )}

        <Table className='mt-8'>
          <TableHeader>
            <TableRow>
              <TableHead className='text-center'>شناسه</TableHead>
              <TableHead className='text-center'>سکتور</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='text-center'>
            {filteredData.map((row: any, index: number) => (
              <TableRow key={index} onClick={() => openDialog(row)}>
                <TableCell>{row.wspId || row.insId || row.fpId}</TableCell>
                <TableCell>{row.wspSector || row.insSector || row.fpSector}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Dialog for full details */}
        {selectedItem && (
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>جزییات</DialogTitle>
              </DialogHeader>
              <div>
  {selectedItem.wspId && (
    <div className="grid grid-cols-2 gap-4">
    <div>
      <p><strong>شناسه:</strong> {selectedItem.wspId}</p>
      <p><strong>جهت:</strong> {selectedItem.wspDirection}</p>
      <p><strong>مواد:</strong> {selectedItem.wspMaterial}</p>
      <p><strong>نوع:</strong> {selectedItem.wspType}</p>
      <p><strong>پ پ:</strong> {selectedItem.wspPp}</p>
      <p><strong>وضعیت:</strong> {selectedItem.wspState}</p>
      <p><strong>تاریخ:</strong> {selectedItem.wspDate}</p>
    </div>
    <div>
      <p><strong>ورودی:</strong> {selectedItem.wspIn}</p>
      <p><strong>خروجی:</strong> {selectedItem.wspOut}</p>
      <p><strong>طول:</strong> {selectedItem.wspLength}</p>
      <p><strong>وزن خالی:</strong> {selectedItem.wspWempty}</p>
      <p><strong>وزن پر:</strong> {selectedItem.wspWfull}</p>
      <p><strong>وزن خالص:</strong> {selectedItem.wspWpure}</p>
      <p><strong>کنترل کیفیت:</strong> {selectedItem.wspQC}</p>
      <p><strong>بخش:</strong> {selectedItem.wspSector}</p>
    </div>
  </div>
  )}

  {selectedItem.insId && (
    <div className="grid grid-cols-2 gap-4">
    <p><strong>شناسه:</strong> {selectedItem.insId}</p>
    <p><strong>نوع:</strong> {selectedItem.insType}</p>
    <p><strong>کد:</strong> {selectedItem.insCode}</p>
    <p><strong>شناسه سازنده:</strong> {selectedItem.manfId}</p>
    <p><strong>تاریخ ورود:</strong> {selectedItem.insEntryDate}</p>
    <p><strong>شماره رسید:</strong> {selectedItem.insRecNum}</p>
    <p><strong>وضعیت:</strong> {selectedItem.insState}</p>
    <p><strong>انقضا:</strong> {selectedItem.insEXP}</p>
    <p><strong>مکان:</strong> {selectedItem.insLoc}</p>
    <p><strong>رنگ:</strong> {selectedItem.insColor}</p>
    <p><strong>تعداد:</strong> {selectedItem.insCount}</p>
    <p><strong>کنترل کیفیت:</strong> {selectedItem.insQC}</p>
    <p><strong>بخش:</strong> {selectedItem.insSector}</p>
  </div>
  )}

  {selectedItem.fpId && (
    <div className="grid grid-cols-2 gap-4">
    <p><strong>شناسه:</strong> {selectedItem.fpId}</p>
    <p><strong>نوع:</strong> {selectedItem.fpType}</p>
    <p><strong>کارت:</strong> {selectedItem.fpCart}</p>
    <p><strong>شناسه کاربر:</strong> {selectedItem.uesrId}</p>
    <p><strong>کد کاربر نهایی:</strong> {selectedItem.fpEndUserCode}</p>
    <p><strong>مکان:</strong> {selectedItem.fpLoc}</p>
    <p><strong>بسته بندی:</strong> {selectedItem.fpWrapped}</p>
    <p><strong>وضعیت:</strong> {selectedItem.fpSituation}</p>
    <p><strong>بخش:</strong> {selectedItem.fpSector}</p>
  </div>
  )}
</div>

            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}