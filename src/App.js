import "./App.css";
import { useRef, useState } from "react";

function App() {
  const [Error, setError] = useState();
  const [stream, setStream] = useState();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  function getCam() {
    console.log(videoRef.current);

    async function getCameraStream() {
      if (window.location.protocol !== "https:") {
        setError("Kamera faqat HTTPSda ishlaydi.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    getCameraStream();
  }

  const stopCam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const takePicture = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    stopCam();
  };
  return (
    <div className="">
      <video
        ref={videoRef}
        autoPlay
        className="w-[300px] h-[300px] border-2 border-black"
      ></video>
      <canvas
        ref={canvasRef}
        className="w-[300px] h-[300px] border-2 border-black"
      ></canvas>
      <button
        onClick={() => getCam()}
        className="border-2 border-black p-[10px] rounded-lg m-[10px]"
      >
        Start Camera
      </button>
      <button
        onClick={() => takePicture()}
        className="border-2 border-black p-[10px] rounded-lg"
      >
        Take Picture
      </button>
      <p>{Error}</p>
    </div>
  );
}

export default App;
