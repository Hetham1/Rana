import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const apiUrl = import.meta.env.VITE_API_URL;

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [flag, setFlag] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');

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
          getFlagState(uid);
        }
      }
    }
  };

  const getFlagState = async (uid: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/ordersc/${uid}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      const flagState = response.data.success;
      setFlag(flagState.toString());

      if (flagState === false) {
        setTimeout(() => setFlag(null), 4000);
      }
    } catch (error) {
      console.error('Error fetching flag state:', error);
    }
  };

  const clearFields = async () => {
    if (!driverName || !scanResult) {
      console.error('Both driver name and scan result must be present.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const postData = {
        tpDriverName: driverName,
        ordId: scanResult,
        driverPhone,
        driverLicense
      };

      const response = await axios.post(`${apiUrl}/transports/new`, postData, {
        headers: {
          'Authorization': `${token}`,
        }
      });

      if (response.status === 200) {
        console.log('POST request successful:', response.data);
        setScanResult(null);
        setFlag(null);
        setDriverName('');
        setDriverPhone('');
        setDriverLicense('');
        setIsDriverDialogOpen(false);
      } else {
        console.error('POST request failed:', response.data);
      }
    } catch (error) {
      console.error('Error in POST request:', error);
    }
  };

  const fetchOrderDetails = async () => {
    if (!scanResult) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/orderDetails/${scanResult}`, {
        headers: {
          'Authorization': `${token}`
        }
      });

      if (response.data.success) {
        setOrderDetails(response.data.data);
        setIsOrderDialogOpen(true);
      } else {
        console.error('Failed to fetch order details:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
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

      <Button 
        onClick={() => setIsDriverDialogOpen(true)} 
        disabled={flag !== 'true'}
        className="w-full max-w-md"
      >
        اطلاعات راننده
      </Button>

      {flag === 'true' && (
        <Button onClick={fetchOrderDetails} variant="outline">
          مشاهده جزئیات سفارش
        </Button>
      )}

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات سفارش</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {orderDetails.map((item, index) => (
              <div key={index} className="mb-2">
                <p><strong>نام محصول:</strong> {item.prodName}</p>
                <p><strong>تعداد:</strong> {item.contCount}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اطلاعات راننده</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="نام راننده"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
            <Input
              placeholder="شماره تلفن راننده"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
            />
            <Input
              placeholder="کد ملی راننده"
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={clearFields} disabled={!driverName || !driverPhone || !driverLicense}>
              تایید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}