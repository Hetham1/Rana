import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import jsQR from 'jsqr';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

interface ComboBoxItem {
  value: string;
  label: string;
}

interface APIResponse {
  success: boolean;
  data: { ppId: string }[];
  error?: string;
}

const QRScannerComponent: React.FC = () => {
  const [comboBoxOpen, setComboBoxOpen] = useState(false);
  const [staticComboBoxOpen, setStaticComboBoxOpen] = useState(false);
  const [value, setValue] = useState("");
  const [staticppValue, setStaticppValue] = useState("");
  const [comboBoxItems, setComboBoxItems] = useState<ComboBoxItem[]>([]);
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
  
    startVideoStream();
    startScanning();  // Start scanning automatically
  
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (comboBoxOpen) {
      fetchComboBoxItems();
    }
  }, [comboBoxOpen]);

  const fetchComboBoxItems = async () => {
    try {
      const token = localStorage.getItem('token');  
      const response = await axios.get<APIResponse>(`${apiUrl}/pp`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (response.data.success) {
        const items: ComboBoxItem[] = response.data.data.map(item => ({
          value: item.ppId,
          label: item.ppId
        }));
        setComboBoxItems(items);
      } else {
        console.error('Error fetching combobox items:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching combobox items:', error);
    }
  };

  const startScanning = () => {
    if (!isScanning) {
      setIsScanning(true);
      scanIntervalRef.current = window.setInterval(() => {
        scanQRCode();
      }, 500);
    }
  };

  const stopScanning = () => {
    if (isScanning) {
      setIsScanning(false);
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }
  };

  const scanQRCode = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const uid = code.data;
          setScanResult(uid);
          stopScanning();
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!value || !scanResult || !staticppValue) {
      console.error('Production plan ID, scan result, or static value is missing');
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.put(`${apiUrl}/pp/assign/${value}`, {
        uid: scanResult,
        ppDevice: staticppValue 
      },{
        headers: {
          Authorization: `${token}`,
        },
      });
      
      console.log('API response:', response.data);
      if (response.data.success) {
        alert("شناسه به برنامه تولید تخصیص داده شد"); 
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert("خطا در تخصیص شناسه به برنامه تولید");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      <div className="w-full max-w-md">
        <Popover open={comboBoxOpen} onOpenChange={setComboBoxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboBoxOpen}
              className="w-full justify-between"
            >
              {value
                ? comboBoxItems.find((item) => item.value === value)?.label
                : "برنامه ساخت را انتخاب کنید"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="جستجو" />
              <CommandList>
                <CommandEmpty>یرنامه ساختی یافت نشد</CommandEmpty>
                <CommandGroup>
                  {comboBoxItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setComboBoxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-full max-w-md">
        <Popover open={staticComboBoxOpen} onOpenChange={setStaticComboBoxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={staticComboBoxOpen}
              className="w-full justify-between"
            >
              {staticppValue ? staticppValue : " لاین تولید را انتخاب کنید"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="جستجو" />
              <CommandList>
                <CommandGroup>
                  {["1", "2", "3"].map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={(currentValue) => {
                        setStaticppValue(currentValue);
                        setStaticComboBoxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          staticppValue === item ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="bg-gray-200 w-full max-w-md h-64 relative">
        <video ref={videoRef} className="absolute top-0 left-0 w-full h-full rounded-xl object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="w-full max-w-md text-center p-4 bg-blue-200 rounded-md">
        <h2 className="text-lg font-semibold">نتیجه اسکن:</h2>
        <p>{scanResult}</p>
      </div>

      <Button onClick={handleSubmit} className="px-4 py-2 bg-sec">
        تولید
      </Button>
    </div>
  );
};

export default QRScannerComponent;