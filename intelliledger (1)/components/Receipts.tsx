import React, { useState, useRef } from 'react';
import { Upload, Camera, FileCheck, Loader2, X } from 'lucide-react';
import { analyzeReceiptAI } from '../services/geminiService';
import { Receipt } from '../types';

const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    const file = files[0];
    
    // Create a local preview
    const objectUrl = URL.createObjectURL(file);
    const tempId = Math.random().toString(36).substring(7);
    
    // Add to state immediately as processing
    const newReceipt: Receipt = {
      id: tempId,
      fileUrl: objectUrl,
      uploadDate: new Date().toISOString(),
      status: 'PROCESSING'
    };
    
    setReceipts(prev => [newReceipt, ...prev]);

    try {
      // Convert to base64 for Gemini
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Call AI Service
        const analysis = await analyzeReceiptAI(base64String, file.type);
        
        // Update state with analysis
        setReceipts(prev => prev.map(r => r.id === tempId ? {
            ...r,
            status: 'ANALYZED',
            merchantName: analysis.merchant,
            totalAmount: analysis.amount,
            date: analysis.date,
            category: analysis.category
        } : r));
        
        setIsAnalyzing(false);
      };
    } catch (error) {
       console.error(error);
       setReceipts(prev => prev.map(r => r.id === tempId ? { ...r, status: 'ERROR' } : r));
       setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Receipt Management</h2>
          <p className="text-slate-500">AI-powered extraction for expenses.</p>
        </div>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-primary bg-indigo-50' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            {isAnalyzing ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
                {isAnalyzing ? 'Analyzing Receipt...' : 'Click to upload or drag and drop'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-100 relative group">
              <img src={receipt.fileUrl} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm">
                   <Camera size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                   {receipt.status === 'PROCESSING' ? (
                       <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
                   ) : (
                       <h4 className="font-bold text-slate-800">{receipt.merchantName}</h4>
                   )}
                   <p className="text-xs text-slate-500">{receipt.date || 'Date unknown'}</p>
                </div>
                {receipt.status === 'ANALYZED' && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                        <FileCheck size={12} className="mr-1"/> AI Verified
                    </span>
                )}
              </div>
              
              <div className="mt-auto space-y-2">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-slate-800 text-lg">
                        {receipt.totalAmount ? `$${receipt.totalAmount.toFixed(2)}` : '--'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                        {receipt.category || 'Pending...'}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Receipts;