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

import { BASE_URL } from '../hooks/apiconfig';

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

    console.log('Token:', token);
    console.log('Radio Option:', radioOption);
    console.log('Combo Box Value:', comboBoxValue);
    console.log('Scan Result (UID):', uid);

    if (radioOption && comboBoxValue && token) {
      const endpoint = radioOption === '1' 
        ? 'entry' 
        : radioOption === '2' 
        ? 'exit' 
        : 'reject';

      axios.put(`${BASE_URL}/${endpoint}/${uid}`, {
        wpId: comboBoxValue,
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
      const response = await axios.get(`${BASE_URL}/uidDetails/${uid}`, {
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
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
  <div className="bg-gray-200 w-full max-w-md h-64 relative">
    <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" />
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
      <Button variant="outline" onClick={() => scanResult && fetchUidDetails(scanResult)} disabled={!scanResult}>
        مشخصات سبد
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>UID Details</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>
        {loading && <p>Loading UID details...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {uidDetails && uidDetails.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <p><strong>شناسه سبد:</strong> {uidDetails[0].cartId}</p>
            <p><strong>نوع سبد:</strong> {uidDetails[0].cartType}</p>
            <p><strong>دستگاه سبد:</strong> {uidDetails[0].cartDevice}</p>
            <p><strong>ورود سبد:</strong> {uidDetails[0].cartIn}</p>
            <p><strong>خروج سبد:</strong> {uidDetails[0].cartOut}</p>
            <p><strong>شیفت:</strong> {uidDetails[0].cartShift}</p>
            <p><strong>طول:</strong> {uidDetails[0].cartLenght}</p>
            <p><strong>نام محصول:</strong> {uidDetails[0].prodName}</p>
            <p><strong>شناسه PP:</strong> {uidDetails[0].ppId}</p>
            <p><strong>تاریخ تولید:</strong> {new Date(uidDetails[0].cartMFG).toLocaleDateString()}</p>
            <p><strong>شناسه کاربر:</strong> {uidDetails[0].userId}</p>
            <p><strong>رنگ سبد:</strong> {uidDetails[0].cartColor}</p>
            <p><strong>شناسه عایق:</strong> {uidDetails[0].insulId}</p>
            <p><strong>شناسه قرقره سیم:</strong> {uidDetails[0].wireSpId}</p>
            <p><strong>شناسه محل کار:</strong> {uidDetails[0].wpId}</p>
            <p><strong>LL سبد:</strong> {uidDetails[0].cartLL}</p>
            <p><strong>کنترل کیفیت:</strong> {uidDetails[0].cartQC}</p>
          </div>
        )}
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogAction onClick={() => setUidDetails(null)}>Close</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
  );
}
