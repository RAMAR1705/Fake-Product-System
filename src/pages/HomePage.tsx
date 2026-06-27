import { motion } from "motion/react";
import { ShieldCheck, QrCode, Search, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
        >
          <ShieldCheck size={16} />
          <span>Next-Gen Anti-Counterfeit Technology</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
        >
          Stop Fake Products with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Secure QR Authentication
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/60 max-w-2xl mx-auto"
        >
          Protect your brand and your customers. Our system generates unique, encrypted QR codes 
          for every product, making it impossible to replicate or forge.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Link
            to="/generate"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            Generate Secure QR
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/verify"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-semibold transition-all backdrop-blur-md"
          >
            Verify a Product
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <QrCode className="text-blue-400" size={32} />,
            title: "Unique Fingerprinting",
            desc: "Each product gets a unique digital identity that cannot be duplicated."
          },
          {
            icon: <ShieldCheck className="text-purple-400" size={32} />,
            title: "Instant Verification",
            desc: "Customers can verify authenticity in seconds using any smartphone camera."
          },
          {
            icon: <Search className="text-cyan-400" size={32} />,
            title: "Supply Chain Tracking",
            desc: "Monitor batch numbers and manufacturing details to ensure quality control."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
          >
            <div className="mb-6 p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-white/50 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* How it Works */}
      <section className="bg-white/5 border border-white/10 rounded-[40px] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">How TrustQR Works</h2>
            <div className="space-y-8">
              {[
                { step: "01", title: "Register Product", desc: "Enter product details like batch number and expiry date into our secure portal." },
                { step: "02", title: "Generate Encrypted QR", desc: "Our system creates a unique QR code with a cryptographically secure token." },
                { step: "03", title: "Apply to Packaging", desc: "Print the QR code on your product labels or packaging." },
                { step: "04", title: "Verify Anywhere", desc: "End users scan the code to instantly confirm the product's authenticity." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <span className="text-2xl font-black text-blue-500/40">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center p-12">
              <div className="w-full aspect-square bg-white rounded-2xl p-4 shadow-2xl shadow-blue-500/20 flex items-center justify-center">
                <QrCode size={160} className="text-slate-900" />
              </div>
              
              {/* Floating Badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <CheckCircle size={18} />
                <span className="font-bold">Authentic</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <AlertTriangle size={18} />
                <span className="font-bold">Fake Detected</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
