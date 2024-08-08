import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const loadModels = async () => {
    const MODEL_URL = "../../public/models";
    // await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    setInitialized(true);
  };
  loadModels();

  useEffect(() => {
    const startVideo = async () => {
      const constraints = { video: { facingMode: "user" } };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        setError(err);
        console.error(err);
      }
    };
    if (initialized) {
      startVideo();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      const interval = setInterval(async () => {
        if (videoRef.current && referenceDescriptor) {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptors();
          if (detections.length > 0) {
            const match = faceapi.euclideanDistance(
              detections[0].descriptor,
              referenceDescriptor
            );
            if (match < 0.6) {
              // 0.6 is an arbitrary threshold for similarity
              setMessage("Yuz mos keldi!");
            } else {
              setMessage("Yuz mos kelmadi");
            }
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [initialized, referenceDescriptor]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    try {
      const img = await faceapi.bufferToImage(file);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detections) {
        setReferenceDescriptor(detections.descriptor);
        setMessage("Rasm yuklandi. Kameraga qarang.");
      } else {
        setMessage("Yuz topilmadi");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Yuzni Tanish</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <video ref={videoRef} style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {error && <p>Xato: {error.message}</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default FaceRecognition;
