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

import { toast } from "sonner"


const apiUrl = import.meta.env.VITE_API_URL

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [okCount, setOkCount] = useState(0);
  const [falseCount, setFalseCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [uidDetails, setUidDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  
console.log(alert)
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
    startScanning();
    // Cleanup function to stop scanning and camera
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      stopScanning();
    };
  }, []);

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
    const radioOption = localStorage.getItem('radioOption');
    const comboBoxValue = localStorage.getItem('comboBoxValue');
    const token = localStorage.getItem('token');
  
    if (radioOption && comboBoxValue && token) {
      const endpoint = radioOption === '1' 
        ? 'entry' 
        : radioOption === '2' 
        ? 'exit' 
        : 'reject';
  
      axios.put(`${apiUrl}/${endpoint}/${uid}`, {
        wpId: comboBoxValue,
      }, {
        headers: {
          Authorization: `${token}`,
        }
      })
      .then(response => {
        console.log('API response:', response.data);
  
        if (response.data.success === 'alert') {
          setAlert(response.data.alert);
          
          console.log(response.data)
          
          setOkCount(prevCount => prevCount + 1);
          // Show toast with the main message and alert description
          toast.warning(response.data.data, {
            description: response.data.alert,
            action: {
              label: "بستن",
              onClick: () => setAlert(null),
            },
          });
        } else if (response.data.success) {
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
      console.error('Radio option, combo box value, or token is missing');
    }
  };

  const fetchUidDetails = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token')
      console.log(token)
      console.log(uid)
      const response = await axios.get(`${apiUrl}/uidDetails/${uid}`, {
        headers: {
          'Authorization': `${token}`
        }
      }) 
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
  <div className="bg-gray-200 w-full max-w-md h-64 rounded-xl relative">
    <video ref={videoRef} className="absolute top-0 left-0 w-full h-full rounded-xl object-cover" />
    <canvas ref={canvasRef} className="hidden" />
  </div>

  <div className="w-full text-center p-4 bg-blue-200">
    <h2 className="text-lg font-semibold">نتیجه اسکن:</h2>
    <p>{scanResult || 'بارکدی یافت نشد'}</p>
  </div>

  <div className="flex flex-col space-x-4">
    <p>✅ : {okCount}</p>
    <p>❌ : {falseCount}</p>
  </div>

  <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" onClick={() => scanResult && fetchUidDetails(scanResult)} disabled={!scanResult}>مشخصات سبد</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>UID Details</AlertDialogTitle>
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
