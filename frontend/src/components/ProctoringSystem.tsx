'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface ProctoringSystemProps {
  onViolation: (type: 'gaze' | 'head') => void;
}

export default function ProctoringSystem({ onViolation }: ProctoringSystemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const violationTimer = useRef<NodeJS.Timeout | null>(null);
  const [isOutZone, setIsOutZone] = useState(false);
  const isOutZoneRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function initMediaPipe() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      setFaceLandmarker(landmarker);
    }
    initMediaPipe();

    // Start webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      });
    }

    return () => {
      if (violationTimer.current) clearTimeout(violationTimer.current);
    };
  }, []);

  const predictWebcam = async () => {
    if (!faceLandmarker || !videoRef.current || !canvasRef.current) return;

    let lastVideoTime = -1;
    const renderLoop = async () => {
      if (videoRef.current && videoRef.current.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current.currentTime;
        const result = faceLandmarker.detectForVideo(videoRef.current, performance.now());

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0];
          
          // Gaze Detection Logic (Iris Tracking)
          // Indices for eyes:
          // Left Eye Corners: 362 (inner), 263 (outer)
          // Right Eye Corners: 33 (outer), 133 (inner)
          // Iris Centers: 468 (left), 473 (right)
          
          const leftIris = landmarks[468];
          const rightIris = landmarks[473];
          
          const leftInner = landmarks[362];
          const leftOuter = landmarks[263];
          const rightInner = landmarks[133];
          const rightOuter = landmarks[33];

          // Calculate Horizontal Gaze Ratio (0.0 to 1.0)
          // Ratio < 0.35 (Looking far right), Ratio > 0.65 (Looking far left)
          const leftGazeRatio = (leftIris.x - leftInner.x) / (leftOuter.x - leftInner.x);
          const rightGazeRatio = (rightIris.x - rightInner.x) / (rightOuter.x - rightInner.x);
          
          const avgGazeRatio = (leftGazeRatio + rightGazeRatio) / 2;

          // Head Rotation Check (Yaw/Pitch)
          // Nose tip (1), Chin (152), Left eye (33), Right eye (263), Left mouth (61), Right mouth (291)
          // Simple estimation: distance between eyes and nose
          const nose = landmarks[1];
          const faceWidth = Math.abs(landmarks[263].x - landmarks[33].x);
          const horizontalHeadRotation = (nose.x - landmarks[1].x) / faceWidth; // Simplified
          
          // Check for significant gaze deviation
          // Looking away if ratio is outside 0.15 - 0.85 (tuned for common screen distances)
          // Or if head is turned significantly (nose x position relative to eyes)
          const noseToLeftEye = Math.abs(nose.x - landmarks[362].x);
          const noseToRightEye = Math.abs(nose.x - landmarks[133].x);
          const headYawRatio = noseToLeftEye / noseToRightEye;

          const isGazeDeviated = avgGazeRatio < 0.15 || avgGazeRatio > 0.85;
          const isHeadTurned = headYawRatio < 0.4 || headYawRatio > 2.5;

          if (isGazeDeviated || isHeadTurned) {
            if (!isOutZoneRef.current) {
              isOutZoneRef.current = true;
              setIsOutZone(true);
              if (violationTimer.current) clearTimeout(violationTimer.current);
              violationTimer.current = setTimeout(() => {
                if (isOutZoneRef.current) {
                  onViolation('gaze');
                }
              }, 1500); 
            }
          } else {
            isOutZoneRef.current = false;
            setIsOutZone(false);
            if (violationTimer.current) {
              clearTimeout(violationTimer.current);
              violationTimer.current = null;
            }
          }
        }
      }
      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };


  if (!mounted) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-2xl"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {/* Indicator Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
        <div className={`w-2 h-2 rounded-full ${isOutZone ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
          Proctoring Active
        </span>
      </div>
    </div>
  );
}
