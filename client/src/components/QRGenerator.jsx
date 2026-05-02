import React from 'react';
import { Download, Printer } from 'lucide-react';

const QRGenerator = ({ traceId, productName, qrBase64 }) => {
  if (!qrBase64) return null;

  const handlePrint = () => {
    const win = window.open('');
    win.document.write(`
      <html>
        <head>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            img { width: 300px; height: auto; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <img src="${qrBase64}" onload="window.print();window.close()" />
        </body>
      </html>
    `);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-slate-900 w-full max-w-xs mx-auto">
      <img src={qrBase64} alt="QR Code" className="w-48 h-48 mb-4 border rounded-xl" />
      <h3 className="font-bold text-lg text-center leading-tight mb-1">{productName}</h3>
      <p className="font-mono text-xs text-orange-600 font-bold mb-6 tracking-wider">{traceId}</p>
      
      <div className="flex gap-3 w-full">
        <a 
          href={qrBase64} 
          download={`QR_${traceId}.png`}
          className="flex-1 flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Download
        </a>
        <button 
          onClick={handlePrint}
          className="flex-1 flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
    </div>
  );
};

export default QRGenerator;