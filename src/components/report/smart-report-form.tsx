"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Loader2, CheckCircle2, ArrowRight, ArrowLeft, UploadCloud, AlertTriangle, WifiOff, LocateFixed } from "lucide-react";
import { analyzeImageAction, submitIssueAction, checkDuplicatesAction } from "@/app/(dashboard)/report/actions";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { useRouter } from "next/navigation";

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

const extractFrameFromVideo = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.style.display = "none";
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    
    video.onloadeddata = () => {
      // Seek to 1 second in or the middle if shorter
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 800;
      const scaleSize = MAX_WIDTH / video.videoWidth;
      canvas.width = MAX_WIDTH;
      canvas.height = video.videoHeight * scaleSize;
      
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.7);
      
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    
    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
};

export default function SmartReportForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageData, setImageData] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isCheckingDupes, setIsCheckingDupes] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    severity_score: 5,
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    formatted_address: "Selected Location",
  });
  const [isOnline, setIsOnline] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus("success");
      },
      (error) => {
        setGpsStatus("error");
      },
      { timeout: 10000 }
    );
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      const file = e.target.files[0];
      
      let base64 = "";
      if (file.type.startsWith("video/")) {
        try {
          base64 = await extractFrameFromVideo(file);
        } catch (err) {
          alert("Failed to process video. Please try an image.");
          setIsProcessing(false);
          return;
        }
      } else {
        base64 = await compressImage(file);
      }
      
      setImageData(base64);

      const aiResponse = await analyzeImageAction(base64);
      if (aiResponse.success && aiResponse.data) {
        setFormData((prev) => ({
          ...prev,
          title: aiResponse.data.title || prev.title,
          description: aiResponse.data.description || prev.description,
          category: aiResponse.data.category || prev.category,
          severity_score: aiResponse.data.severity_score || prev.severity_score,
        }));
      }
      setIsProcessing(false);
      setStep(2);
    }
  };

  const handleGoToLocation = async () => {
    // Run AI duplicate detection before going to location step
    setIsCheckingDupes(true);
    setDuplicates([]);
    const dupeResult = await checkDuplicatesAction(
      formData.title,
      formData.description,
      formData.category,
      formData.lat,
      formData.lng
    );
    setIsCheckingDupes(false);
    if (dupeResult.duplicates && dupeResult.duplicates.length > 0) {
      setDuplicates(dupeResult.duplicates);
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    const result = await submitIssueAction({
      ...formData,
      image_data: imageData || undefined,
    });
    
    setIsProcessing(false);
    if (result.success) {
      setStep(4);
    } else {
      alert(result.error);
    }
  };

  // Professional, strict layout transition
  const variants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.15, ease: "easeIn" } }
  };

  return (
    <div className="w-full">
      {/* Strict Linear-style Progress Indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span className={step >= 1 ? "text-foreground" : ""}>01 Image</span>
        <span className="w-4 h-px bg-border"></span>
        <span className={step >= 2 ? "text-foreground" : ""}>02 Details</span>
        <span className="w-4 h-px bg-border"></span>
        <span className={step >= 3 ? "text-foreground" : ""}>03 Location</span>
      </div>

      {!isOnline && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700 text-sm">
          <WifiOff className="w-5 h-5 shrink-0" />
          <div>
            <strong>You are offline.</strong> You can still draft your report, but submission requires an internet connection.
          </div>
        </div>
      )}

      <div className="border rounded-lg bg-background shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold tracking-tight">Upload Evidence</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Provide a clear photo of the infrastructure issue. Our system will automatically extract context.
                </p>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
                <div 
                  className="w-full max-w-sm border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
                      <p className="text-sm font-medium">Processing evidence via AI...</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium mb-1">Click to upload photo or video</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, MP4 up to 50MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border-t flex justify-end bg-muted/10">
                <Button variant="ghost" onClick={() => setStep(2)} className="text-xs h-8">
                  Skip image upload
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Review Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">Verify and amend the extracted information.</p>
                </div>
                {imageData && (
                  <div className="w-16 h-16 rounded border overflow-hidden shrink-0">
                    <img src={imageData} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-6 space-y-5">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issue Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="h-9 rounded-md font-medium" 
                    placeholder="Brief summary" 
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={4} 
                    className="resize-none rounded-md text-sm" 
                  />
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-between bg-muted/10">
                <Button variant="outline" onClick={() => setStep(1)} className="h-9 rounded-md"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
                <Button onClick={handleGoToLocation} disabled={isCheckingDupes} className="h-9 rounded-md">
                  {isCheckingDupes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isCheckingDupes ? "Checking Duplicates..." : "Continue"}
                  {!isCheckingDupes && <ArrowRight className="w-4 h-4 ml-2"/>}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col h-[500px]">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Exact Location</h2>
                  <p className="text-sm text-muted-foreground mt-1">Drag the map to position the crosshair precisely over the issue.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDetectLocation} disabled={gpsStatus === "loading"}>
                  {gpsStatus === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
                  Use My GPS
                </Button>
              </div>

              {gpsStatus === "error" && (
                <div className="mx-6 mt-4 p-3 border border-rose-200 bg-rose-50 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-rose-800">GPS Unavailable</h4>
                    <p className="text-xs text-rose-700 mt-0.5">We couldn't detect your location. Please ensure location permissions are granted, or manually drag the map to the correct location.</p>
                  </div>
                </div>
              )}

              {/* AI Duplicate Detection Warning */}
              {duplicates.length > 0 && (
                <div className="mx-6 mt-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-semibold text-amber-800">AI Duplicate Alert</h4>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">Our AI detected similar existing reports. Consider upvoting them instead of creating a duplicate.</p>
                  <div className="space-y-2">
                    {duplicates.map((dup: any, idx: number) => (
                      <a key={idx} href={`/issues/${dup.id}`} target="_blank" className="flex items-center justify-between p-2 bg-white border border-amber-100 rounded-md text-xs hover:bg-amber-50 transition-colors">
                        <span className="font-medium text-slate-800 truncate mr-2">{dup.title}</span>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${dup.confidence === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{dup.confidence}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1 relative bg-slate-100 min-h-[300px] w-full">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} version="3.64">
                  <Map 
                    defaultCenter={{lat: formData.lat, lng: formData.lng}} 
                    defaultZoom={16}
                    mapId="DEMO_MAP_ID"
                    disableDefaultUI={true}
                    className="w-full h-full absolute inset-0"
                    onCameraChanged={(ev) => setFormData({...formData, lat: ev.detail.center.lat, lng: ev.detail.center.lng})}
                  >
                    <AdvancedMarker position={{lat: formData.lat, lng: formData.lng}}>
                      <Pin background="#0f172a" borderColor="#000" glyphColor="#fff" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              </div>

              <div className="p-4 border-t flex justify-between bg-muted/10">
                <Button variant="outline" onClick={() => setStep(2)} className="h-9 rounded-md"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
                <Button onClick={handleSubmit} disabled={isProcessing || !isOnline} className="h-9 rounded-md">
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                  {!isOnline ? "Offline" : "Submit Report"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-foreground mb-4" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold tracking-tight">Report Logged</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                The issue has been registered. It is now open for community verification.
              </p>
              <Button onClick={() => router.push("/dashboard")} variant="outline" className="mt-6 h-9 rounded-md">
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
