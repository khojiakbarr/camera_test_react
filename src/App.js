import "./App.css";

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const App = () => {
  const videoRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "../public/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // optional for better accuracy
      setInitialized(true);
    };
    loadModels();

    const constraints = {
      video: { facingMode: "user" },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => {
        setError(err);
        console.error(err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      const interval = setInterval(async () => {
        if (videoRef.current) {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptors();
          setDetections(detections);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [initialized]);

  return (
    <div>
      <h2>Yuzni Tanishing</h2>
      <video ref={videoRef} style={{ width: "100%" }} />
      {error && <p>Xato: {error.message}</p>}
      <div>
        {detections.map((detection, index) => (
          <div key={index}>
            <p>Yuz topildi</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// import React, { useRef, useEffect, useState } from "react";
// import jsQR from "jsqr";

// function App() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const constraints = {
//       video: { facingMode: "environment" },
//     };

//     navigator.mediaDevices
//       .getUserMedia(constraints)
//       .then((stream) => {
//         videoRef.current.srcObject = stream;
//         videoRef.current.setAttribute("playsinline", "true"); // iOS support
//         videoRef.current.play();
//         requestAnimationFrame(tick);
//       })
//       .catch((err) => {
//         setError(err);
//         console.error(err);
//       });

//     return () => {
//       if (videoRef.current && videoRef.current.srcObject) {
//         const stream = videoRef.current.srcObject;
//         const tracks = stream.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const tick = () => {
//     if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
//       const canvas = canvasRef.current.getContext("2d");
//       canvasRef.current.height = videoRef.current.videoHeight;
//       canvasRef.current.width = videoRef.current.videoWidth;
//       canvas.drawImage(
//         videoRef.current,
//         0,
//         0,
//         canvasRef.current.width,
//         canvasRef.current.height
//       );
//       const imageData = canvas.getImageData(
//         0,
//         0,
//         canvasRef.current.width,
//         canvasRef.current.height
//       );
//       const code = jsQR(imageData.data, imageData.width, imageData.height, {
//         inversionAttempts: "dontInvert",
//       });
//       if (code) {
//         setResult(code.data);
//       }
//     }
//     requestAnimationFrame(tick);
//   };

//   return (
//     <div>
//       <h2>QR Kodni Skanerlang</h2>
//       <video ref={videoRef} style={{ width: "500px" }} />
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//       {error && <p>Xato: {error.message}</p>}
//       {result && <p>Natija: {result}</p>}
//     </div>
//   );
// }

export default App;
