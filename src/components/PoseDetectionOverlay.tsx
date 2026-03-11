import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Camera, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PoseDetectionOverlayProps {
  targetPoseName?: string;
  onFeedback?: (feedback: string[]) => void;
  onAccuracyUpdate?: (accuracy: number) => void;
}

export const PoseDetectionOverlay: React.FC<PoseDetectionOverlayProps> = ({ 
  targetPoseName = "Tree Pose",
  onFeedback,
  onAccuracyUpdate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDetector = async () => {
      try {
        await tf.ready();
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
          modelType: 'full'
        } as any;
        const newDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize pose detector:", err);
        setError("Failed to load AI model. Please check your connection.");
        setIsLoading(false);
      }
    };

    initDetector();
  }, []);

  useEffect(() => {
    if (!detector || !videoRef.current) return;

    let animationFrameId: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            detectPose();
          };
        }
      } catch (err) {
        setError("Camera access denied. Please enable camera permissions.");
      }
    };

    const detectPose = async () => {
      if (!detector || !videoRef.current || !canvasRef.current) return;

      const poses = await detector.estimatePoses(videoRef.current);
      
      if (poses.length > 0) {
        const pose = poses[0];
        drawPose(pose);
        analyzePose(pose);
      }

      animationFrameId = requestAnimationFrame(detectPose);
    };

    const drawPose = (pose: poseDetection.Pose) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current || !videoRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw keypoints
      pose.keypoints.forEach(kp => {
        if (kp.score && kp.score > 0.5) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#FF6321'; // brand-accent
          ctx.fill();
        }
      });

      // Draw skeleton
      const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose);
      connections.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];
        if (kp1.score && kp2.score && kp1.score > 0.5 && kp2.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    const analyzePose = (pose: poseDetection.Pose) => {
      const newFeedback: string[] = [];
      let currentAccuracy = 0;

      // Helper to get angle between 3 points
      const getAngle = (p1: any, p2: any, p3: any) => {
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
      };

      const keypoints = pose.keypoints.reduce((acc: any, kp) => {
        acc[kp.name!] = kp;
        return acc;
      }, {});

      if (targetPoseName === "Tree Pose") {
        // Tree Pose logic: 
        // 1. One leg straight (angle ~180)
        // 2. Other leg bent (angle < 90)
        // 3. Hands together or up
        const leftKneeAngle = getAngle(keypoints.left_hip, keypoints.left_knee, keypoints.left_ankle);
        const rightKneeAngle = getAngle(keypoints.right_hip, keypoints.right_knee, keypoints.right_ankle);
        
        if (leftKneeAngle > 160 && rightKneeAngle < 100) {
          currentAccuracy = 80;
          newFeedback.push("Great balance!");
        } else if (rightKneeAngle > 160 && leftKneeAngle < 100) {
          currentAccuracy = 80;
          newFeedback.push("Great balance!");
        } else {
          newFeedback.push("Try to place one foot on your inner thigh.");
        }
      } else if (targetPoseName === "Warrior II") {
        const leftKneeAngle = getAngle(keypoints.left_hip, keypoints.left_knee, keypoints.left_ankle);
        const rightKneeAngle = getAngle(keypoints.right_hip, keypoints.right_knee, keypoints.right_ankle);
        
        if (leftKneeAngle < 110 || rightKneeAngle < 110) {
          currentAccuracy = 85;
          newFeedback.push("Good lunge!");
        } else {
          newFeedback.push("Deepen your lunge.");
        }
      } else {
        currentAccuracy = 50;
        newFeedback.push("Keep focusing on your breath.");
      }

      setFeedback(newFeedback);
      setAccuracy(currentAccuracy);
      onFeedback?.(newFeedback);
      onAccuracyUpdate?.(currentAccuracy);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [detector, targetPoseName]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
          <RefreshCw className="text-brand-accent animate-spin mb-4" size={40} />
          <p className="text-white font-medium">Initializing AI Pose Detection...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50 p-8 text-center">
          <AlertCircle className="text-red-500 mb-4" size={40} />
          <p className="text-white font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-accent text-white rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      )}

      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
        playsInline 
        muted 
      />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
      />

      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Target Pose</p>
          <p className="text-white font-bold text-lg">{targetPoseName}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-right">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Accuracy</p>
          <p className={cn(
            "text-2xl font-bold",
            accuracy > 80 ? "text-emerald-400" : accuracy > 50 ? "text-amber-400" : "text-red-400"
          )}>{accuracy}%</p>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            accuracy > 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-accent/20 text-brand-accent"
          )}>
            {accuracy > 70 ? <CheckCircle2 size={24} /> : <Camera size={24} />}
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">AI Feedback</p>
            <div className="space-y-1">
              {feedback.map((f, i) => (
                <p key={i} className="text-white text-sm font-medium">{f}</p>
              ))}
              {feedback.length === 0 && <p className="text-white/40 text-sm italic">Analyzing your form...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
