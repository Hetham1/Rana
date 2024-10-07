import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { BASE_URL } from '../hooks/apiconfig';
import { XCircle } from 'lucide-react';

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null); // To store the flag state
  const [comboBoxItems, setComboBoxItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

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
    fetchComboBoxItems();
    startScanning();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      stopScanning();
    };
  }, []);

  const fetchComboBoxItems = () => {
    try {
      const comboBoxItems = [
        { id: 1, name: 'بوگاتی' },
        { id: 2, name: 'بوگاتی قرمز' },
        { id: 3, name: 'بوگاتی سبزم خراب شد😭' }
      ];
      setComboBoxItems(comboBoxItems);
    } catch (error) {
      console.error('Error setting combo box items:', error);
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
          getFlagState(uid);
        }
      }
    }
  };

  const getFlagState = async (uid: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/ordersc/${uid}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      const flagState = response.data.success;
      setFlag(flagState.toString());

      if (flagState === false) {
        // Show red XCircle for 4 seconds
        setTimeout(() => setFlag(null), 4000);
      }
    } catch (error) {
      console.error('Error fetching flag state:', error);
    }
  };

  const clearFields = async () => {
    if (!selectedItem || !scanResult) {
      console.error('Both driver name and scan result must be present.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const postData = {
        tpDriverName: selectedItem,  // Combo box value (driver's name)
        ordId: scanResult            // Scanned QR code result (order ID)
      };

      const response = await axios.post(`${BASE_URL}/transports/new`, postData, {
        headers: {
          'Authorization': `${token}`,
          
        }
      });

      if (response.status === 200) {
        console.log('POST request successful:', response.data);
        setScanResult(null);
        setFlag(null);
        setSelectedItem(null);  // Clear the combo box selection
      } else {
        console.error('POST request failed:', response.data);
      }
    } catch (error) {
      console.error('Error in POST request:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
      <div className="bg-gray-200 w-full max-w-md h-64 relative">
        <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {flag === 'false' && (
          <XCircle className="absolute inset-0 text-red-600 w-full h-full opacity-50" />
        )}
      </div>

      <div className="w-full text-center p-4 bg-blue-200">
        <h2 className="text-lg font-semibold">نتیجه اسکن:</h2>
        {/* Display Scan Result Here */}
        {scanResult && (
          <>
            <p style={{ color: flag === 'true' ? 'green' : 'red' }}>
              {scanResult}
            </p>
            <p style={{ color: flag ? 'green' : 'red' }}>
              {flag ? 'مجاز' : 'غیر مجاز'}
            </p>
          </>
        )}
      </div>

      {/* Shadcn Combo Box */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{selectedItem ? selectedItem : 'انتخاب راننده'}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2">
          <Command>
            <CommandInput placeholder="جستجو" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {comboBoxItems.map((item) => (
                  <CommandItem key={item.id} onSelect={() => setSelectedItem(item.name)}>
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* <div className="flex space-x-4">
        <Button onClick={startScanning} disabled={isScanning} variant="outline">
          Start Scanning
        </Button>
        <Button onClick={stopScanning} disabled={!isScanning} variant="outline">
          Stop Scanning
        </Button>
      </div> */}

      {/* Conditionally render the تایید button */}
      {selectedItem && flag === 'true' && (
        <Button onClick={clearFields} variant="default">
          تایید
        </Button>
      )}
    </div>
  );
}
