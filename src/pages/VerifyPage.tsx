import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Upload, Camera, CheckCircle, AlertTriangle, Loader2, RefreshCw, Package, Factory, Calendar, Hash } from "lucide-react";

interface VerificationResult {
  authentic: boolean;
  message: string;
  product?: {
    id: string;
    name: string;
    manufacturer: string;
    batchNumber: string;
    expiryDate: string;
    createdAt: string;
  };
  details?: string;
}

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError("");
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("qrImage", file);

    try {
      const response = await fetch("/api/products/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to verify QR code");
        setResult(data); // Still set result to show the "Fake" UI if it returned authentic: false
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Verify Product Authenticity</h1>
        <p className="text-white/60">Upload a QR code image to check if the product is genuine.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
              preview ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 rounded-lg shadow-lg" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Upload size={32} className="text-white/40" />
                </div>
                <p className="font-medium">Click to upload QR image</p>
                <p className="text-white/40 text-sm mt-1">PNG, JPG or JPEG</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              disabled={!file || isLoading}
              onClick={handleVerify}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isLoading ? "Verifying..." : "Verify Authenticity"}
            </button>
            {file && (
              <button
                onClick={reset}
                className="w-full py-3 text-white/60 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw size={16} />
                Clear and Try Another
              </button>
            )}
          </div>
        </motion.div>

        {/* Result Section */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-12 text-center"
              >
                <ShieldCheck size={64} className="text-white/10 mb-6" />
                <h3 className="text-xl font-bold text-white/40">Verification Result</h3>
                <p className="text-white/20 text-sm">Upload an image to see the verification details.</p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <Loader2 size={64} className="text-blue-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold">Checking Database...</h3>
                <p className="text-white/40 text-sm">Validating security tokens and product ID.</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`h-full rounded-[32px] p-8 border ${
                  result.authentic 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    result.authentic ? "bg-green-500 shadow-lg shadow-green-500/20" : "bg-red-500 shadow-lg shadow-red-500/20"
                  }`}>
                    {result.authentic ? <CheckCircle size={40} className="text-white" /> : <AlertTriangle size={40} className="text-white" />}
                  </div>
                  <h2 className={`text-3xl font-black ${result.authentic ? "text-green-400" : "text-red-400"}`}>
                    {result.authentic ? "AUTHENTIC" : "FAKE PRODUCT"}
                  </h2>
                  <p className="text-white/70 mt-2">{result.message}</p>
                </div>

                {result.authentic && result.product && (
                  <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Package size={18} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Product Name</p>
                        <p className="font-bold">{result.product.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Factory size={18} className="text-purple-400" />
                      <div>
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Manufacturer</p>
                        <p className="font-bold">{result.product.manufacturer}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Hash size={18} className="text-cyan-400" />
                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Batch</p>
                          <p className="font-bold">{result.product.batchNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-orange-400" />
                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Expiry</p>
                          <p className="font-bold">{result.product.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!result.authentic && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle size={18} /> Security Warning
                    </h4>
                    <p className="text-sm text-white/60 leading-relaxed">
                      This product could not be verified. The QR code is either invalid or has been tampered with. 
                      Do not use this product and report it to the authorities.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
