import { useEffect, useRef, useState } from 'react';
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

const apiUrl = import.meta.env.VITE_API_URL

// Define the type for the comboBox data
// interface LetterOption {
//   value: string;
//   label: string;
// }

export default function Relocate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [okCount, setOkCount] = useState(0);
  const [falseCount, setFalseCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
 
  const [comboBoxValue, setComboBoxValue] = useState<string>('');
  const [uidDetails, setUidDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 

  const workPlace = localStorage.getItem('workPlace');
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (workPlace && token) {
      console.log("Token found:", token);
      axios.get(`${apiUrl}/workplace/reverse/${workPlace}`, {
        headers: {
          'Authorization': `${token}`
        }
      })
        .then((response) => {
          console.log("API response for Workplace:", response);
          const { data } = response.data;
          
            
            localStorage.setItem('wpId', data[0].wpId);
            console.log("Workplace ID set to:", data[0].wpId);
          
        })
        .catch((error) => {
          console.error('Error fetching workplace data:', error);
        });
    } else {
      console.log("Workplace or token missing.");
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
    const wpid = localStorage.getItem('wpId');
    const sector = localStorage.getItem('sector');
    
    console.log('Sending data with values:', {
      token,
      sector,
      uid,
      wpid
    });
      
    if (!sector) {
        alert('لطفا سکتور مورد نظر را وارد کنید');
    } else {
      axios.put(`${apiUrl}/placement/${uid}`, {
        sectorNew: sector,
        wpId: wpid, 
      }, {
        headers: {
          Authorization: `${token}`,
        }
      })
      .then(response => {
        console.log('API response:', response.data);
        if (response.data.success) {
          alert('محصول به سکتور مورد نظر انتقال یافت');
          setOkCount(prevCount => prevCount + 1);
          // Reset comboBoxValue after successful update if needed
          setComboBoxValue('');
          localStorage.removeItem('sector');
        } else {
          setFalseCount(prevCount => prevCount + 1);
        }
      })
      .catch(error => {
        console.error('Error sending data to API:', error);
        setFalseCount(prevCount => prevCount + 1);
      });
      
      
    }
  };

  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const fetchUidDetails = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/uidDetails/${uid}`, {
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

  const renderUidDetails = () => {
    if (!uidDetails || uidDetails.length === 0) return null;
  
    const detail = uidDetails[0]; // Assuming you want to display the first item in the data array
  
    if (detail.wspId) { // Check for WSP details
      return (
        <div>
          <h3>جزئیات WSP</h3>
          <p>شناسه WSP: {detail.wspId}</p>
          <p>جهت: {detail.wspDirection}</p>
          <p>مواد: {detail.wspMaterial}</p>
          <p>نوع: {detail.wspType}</p>
          <p>وضعیت: {detail.wspState}</p>
          <p>تاریخ: {detail.wspDate}</p>
          <p>ورود: {detail.wspIn}</p>
          <p>خروج: {detail.wspOut}</p>
          <p>طول: {detail.wspLength}</p>
          <p>خالی: {detail.wspWempty}</p>
          <p>پر: {detail.wspWfull}</p>
          <p>خالص: {detail.wspWpure}</p>
          <p>QC: {detail.wspQC}</p>
        </div>
      );
    } else if (detail.insId) { // Check for insulation details
      return (
        <div>
          <h3>جزئیات عایق</h3>
          <p>شناسه عایق: {detail.insId}</p>
          <p>نوع: {detail.insType}</p>
          <p>کد: {detail.insCode}</p>
          <p>شناسه سازنده: {detail.manfId}</p>
          <p>تاریخ ورود: {detail.insEntryDate}</p>
          <p>شماره رکورد: {detail.insRecNum}</p>
          <p>وضعیت: {detail.insState}</p>
          <p>EXP: {detail.insEXP}</p>
          <p>محل: {detail.insLoc}</p>
          <p>رنگ: {detail.insColor}</p>
          <p>تعداد: {detail.insCount}</p>
          <p>QC: {detail.insQC}</p>
        </div>
      );
    } else if (detail.fpId) { // Check for FIP details
      return (
        <div>
          <h3>جزئیات FIP</h3>
          <p>شناسه FIP: {detail.fpId}</p>
          <p>نوع: {detail.fpType}</p>
          <p>کارت: {detail.fpCart}</p>
          <p>شناسه کاربر: {detail.uesrId}</p>
          <p>کد کاربر نهایی: {detail.fpEndUserCode}</p>
          <p>محل: {detail.fpLoc}</p>
          <p>پیچیده: {detail.fpWrapped}</p>
          <p>وضعیت: {detail.fpSituation}</p>
          <p>شناسه WP: {detail.wpId}</p>
          <p>LL: {detail.fpLL}</p>
          <p>بخش: {detail.fpSector}</p>
        </div>
      );
    }
  
    return <p>هیچ جزئیاتی برای این UID موجود نیست.</p>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
      <p className="text-xl font-semibold">{"مکان فعلی شما: " + workPlace || 'در حال بارگذاری...'}</p>

      <div className="bg-gray-200 w-full max-w-md h-64 relative">
        <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="w-full text-center p-4 bg-blue-200">
        <h2 className="text-lg font-semibold">نتیجه اسکن:</h2>
        <p>{scanResult}</p>
      </div>

      <div className="flex flex-col space-x-4">
        <p>✅: {okCount}</p>
        <p>❌: {falseCount}</p>
      </div>

      <div className="w-full flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px]">
              {comboBoxValue || 'انتخاب سکتور'}
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
                      setComboBoxValue(currentValue);
                      localStorage.setItem('sector', currentValue);
                      console.log("Selected Combo Box Value:", currentValue); // Add this log
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
            <AlertDialogTitle>مشخصات بارکد</AlertDialogTitle>
            <AlertDialogDescription>
              {loading ? 'Loading...' : (error ? error : renderUidDetails())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>بستن</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
