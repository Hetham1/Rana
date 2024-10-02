import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MenuIcon } from 'lucide-react';

import { BASE_URL } from '../hooks/apiconfig';

// Define the structure of your table data
interface TableDataItem {
  column1: string;
  column2: string;
  column3: string;
}

export default function Gozaresh() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parameter1, setParameter1] = useState('');
  const [parameter2, setParameter2] = useState('');
  const [tableData, setTableData] = useState<TableDataItem[]>([]);

  const handleSubmit = async () => {
    try {
      // Replace this with your actual API call
      const response = await fetch(`${BASE_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameter1, parameter2 })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: TableDataItem[] = await response.json();
      setTableData(data);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div className="p-4">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-lg font-semibold mb-4">Parameters</h2>
          <div className="space-y-4">
            <Input
              placeholder="Parameter 1"
              value={parameter1}
              onChange={(e) => setParameter1(e.target.value)}
            />
            <Input
              placeholder="Parameter 2"
              value={parameter2}
              onChange={(e) => setParameter2(e.target.value)}
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
              <TableHead>Column 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.column1}</TableCell>
                <TableCell>{row.column2}</TableCell>
                <TableCell>{row.column3}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}