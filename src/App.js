import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

function App() {
  const [stream, setStream] = useState();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // const videoRef = useRef(null);
  // const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const constraints = {
      video: { facingMode: "environment" },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // iOS support
        videoRef.current.play();
        requestAnimationFrame(tick);
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

  const tick = () => {
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current.getContext("2d");
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.width = videoRef.current.videoWidth;
      canvas.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imageData = canvas.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        setResult(code.data);
      }
    }
    requestAnimationFrame(tick);
  };

  return (
    <div>
      <h2>QR Kodni Skanerlang</h2>
      <video ref={videoRef} style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {error && <p>Xato: {error.message}</p>}
      {result && <p>Natija: {result}</p>}
    </div>
  );
}

// function getCam() {
//   console.log(videoRef.current);

//   async function getCameraStream() {
//     if (window.location.protocol !== "https:") {
//       setError("Kamera faqat HTTPSda ishlaydi.");
//       return;
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: { ideal: "environment" } },
//       });
//       setStream(stream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//     }
//   }
//   getCameraStream();
// }

// const stopCam = () => {
//   if (stream) {
//     stream.getTracks().forEach((track) => track.stop());
//     setStream(null);
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   }
// };

// const takePicture = () => {
//   const context = canvasRef.current.getContext("2d");
//   context.drawImage(
//     videoRef.current,
//     0,
//     0,
//     canvasRef.current.width,
//     canvasRef.current.height
//   );
//   stopCam();
// };
//   return (
//     <div className="">
//       <video
//         ref={videoRef}
//         autoPlay
//         className="w-[300px] h-[300px] border-2 border-black"
//       ></video>
//       <canvas
//         ref={canvasRef}
//         className="w-[300px] h-[300px] border-2 border-black"
//       ></canvas>
//       <button
//         onClick={() => getCam()}
//         className="border-2 border-black p-[10px] rounded-lg m-[10px]"
//       >
//         Start Camera
//       </button>
//       <button
//         onClick={() => takePicture()}
//         className="border-2 border-black p-[10px] rounded-lg"
//       >
//         Take Picture
//       </button>
//       <p>{Error}</p>
//     </div>
//   );
// }

export default App;
