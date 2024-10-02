// import { useState, useEffect, useRef } from 'react';

// export function useCamera() {
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const startCamera = async () => {
//     try {
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'environment' }
//       });
//       setStream(newStream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = newStream;
//       }
//     } catch (err) {
//       console.error("Error accessing the camera", err);
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//       }
//     }
//   };

//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, []);

//   return { videoRef, stream, startCamera, stopCamera };
// }