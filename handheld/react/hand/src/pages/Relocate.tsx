import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { BASE_URL } from '../hooks/apiconfig';

// Define the type for the comboBox data
interface LetterOption {
  value: string;
  label: string;
}

export default function Relocate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [okCount, setOkCount] = useState(0);
  const [falseCount, setFalseCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
  const [workPlaceName, setWorkPlaceName] = useState<string>('');
  const [comboBoxValue, setComboBoxValue] = useState<string>('');
  const [uidDetails, setUidDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const workPlace = localStorage.getItem('workPlace'); 

    if (workPlace) {
      const token = localStorage.getItem('token');
      axios.get(`${BASE_URL}/workplace?workPlace=${workPlace}`, {
        headers: {
          'Authorization': `${token}`
        }
      })
        .then((response) => {
          const { data } = response.data;
          if (data.length > 0) {
            setWorkPlaceName(data[0].wpName);
          }
        })
        .catch((error) => {
          console.error('Error fetching workPlace data:', error);
        });
    }

    startVideoStream();
    startScanning();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      stopScanning();
    };
  }, []);

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
          console.log('QR Code Data:', uid);
          sendDataToAPI(uid);
        }
      }
    }
  };

  const sendDataToAPI = (uid: string) => {
    const token = localStorage.getItem('token');
    const wpId = localStorage.getItem('workPlace');

    console.log('Token:', token);
    console.log('Combo Box Value:', comboBoxValue);
    console.log('Scan Result (UID):', uid);
    console.log('Workplace ID:', wpId);

    if (uid && comboBoxValue && token && wpId) {
      axios.put(`${BASE_URL}/placement/${uid}`, {
        sectorNew: comboBoxValue,
        wpId: wpId, 
      }, {
        headers: {
          Authorization: `${token}`,
        }
      })
      .then(response => {
        console.log('API response:', response.data);
        if (response.data.success) {
          setOkCount(prevCount => prevCount + 1);
        } else {
          setFalseCount(prevCount => prevCount + 1);
        }
      })
      .catch(error => {
        console.error('Error sending data to API:', error);
        setFalseCount(prevCount => prevCount + 1);
      });
    } else {
      console.error('UID, comboBoxValue, token, or wpId is missing');
      setFalseCount(prevCount => prevCount + 1);
    }
  };

  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const fetchUidDetails = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/uidDetails/${uid}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (response.data.success) {
        setUidDetails(response.data.data); 
      } else {
        setError(response.data.error); 
      }
    } catch (err) {
      console.error('Error fetching UID details:', err);
      setError('Failed to fetch UID details.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
      <p className="text-xl font-semibold">{workPlaceName || 'Loading workplace name...'}</p>

      <div className="bg-gray-200 w-full max-w-md h-64 relative">
        <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="w-full text-center p-4 bg-blue-200">
        <h2 className="text-lg font-semibold">Scan Result:</h2>
        <p>{scanResult || 'No QR code detected'}</p>
      </div>

      <div className="flex flex-col space-x-4">
        <p>✅: {okCount}</p>
        <p>❌: {falseCount}</p>
      </div>

      <div className="w-full flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px]">
              {comboBoxValue || 'Select letter...'}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search letter..." className="h-9" />
              <CommandList>
                <CommandEmpty>No letter found.</CommandEmpty>
                <CommandGroup>
                  {letters.map((letter) => (
                    <CommandItem
                      key={letter}
                      value={letter}
                      onSelect={(currentValue) => {
                        setComboBoxValue(currentValue);
                      }}
                    >
                      {letter}
                      <CheckIcon
                        className={`ml-auto h-4 w-4 ${comboBoxValue === letter ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" onClick={() => scanResult && fetchUidDetails(scanResult)} disabled={!scanResult}>مشخصات سبد</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>UID Details</AlertDialogTitle>
            <AlertDialogDescription>
              {loading ? 'Loading...' : (error ? error : JSON.stringify(uidDetails))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction >Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
