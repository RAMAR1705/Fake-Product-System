import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QrCode, Package, Factory, Calendar, Hash, Download, CheckCircle, Loader2 } from "lucide-react";

interface ProductData {
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
}

export default function GeneratePage() {
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ product: any; qrCode: string } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/products/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to generate QR code");
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.qrCode;
    link.download = `QR_${result.product.name}_${result.product.batchNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Generate Secure QR</h1>
        <p className="text-white/60">Create a unique digital identity for your product.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <Package size={16} /> Product Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Premium Whey Protein"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <Factory size={16} /> Manufacturer
              </label>
              <input
                required
                type="text"
                placeholder="e.g. NutriCorp Industries"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Hash size={16} /> Batch No.
                </label>
                <input
                  required
                  type="text"
                  placeholder="BATCH-123"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Calendar size={16} /> Expiry Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <QrCode size={20} />
              )}
              {isLoading ? "Generating..." : "Generate QR Code"}
            </button>
          </form>
        </motion.div>

        {/* Result Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <QrCode size={40} className="text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white/40">Preview</h3>
                <p className="text-white/20 text-sm">Fill the form to generate your secure QR code.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] p-8 shadow-2xl shadow-blue-500/20 text-slate-900"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <CheckCircle size={20} />
                    <span>Generated</span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">ID: {result.product.id}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center mb-6 border border-slate-100">
                  <img src={result.qrCode} alt="Generated QR" className="w-full max-w-[200px]" />
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 text-sm">Product</span>
                    <span className="font-bold">{result.product.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 text-sm">Manufacturer</span>
                    <span className="font-bold">{result.product.manufacturer}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 text-sm">Batch No.</span>
                    <span className="font-bold">{result.product.batchNumber}</span>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={20} />
                  Download QR Image
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
