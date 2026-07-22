import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface UseQrScannerOptions {
  onScan: (value: string) => void;
  intervalMilliseconds?: number;
}
/**
 * Owns camera lifecycle and guarantees at-most-once delivery for each scan cycle.
 * Call startScanning after the current result has been handled to scan another code.
 */
export function useQrScanner({ onScan, intervalMilliseconds = 400 }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanning = useCallback(() => {
    isScanningRef.current = false;
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(image.data, image.width, image.height);

    if (code?.data) {
      stopScanning();
      onScanRef.current(code.data);
    }
  }, [stopScanning]);

  const startScanning = useCallback(() => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    intervalRef.current = window.setInterval(scanFrame, intervalMilliseconds);
  }, [intervalMilliseconds, scanFrame]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          startScanning();
        }
      } catch {
        setCameraError("دسترسی به دوربین ممکن نیست. مجوز مرورگر و اتصال امن HTTPS را بررسی کنید.");
      }
    }

    void startCamera();
    return () => {
      isCancelled = true;
      stopScanning();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [startScanning, stopScanning]);

  return { videoRef, canvasRef, cameraError, startScanning, stopScanning };
}
