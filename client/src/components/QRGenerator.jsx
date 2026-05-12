import React from 'react';

import {
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const QRGenerator = ({
  traceId,
  productName,
  qrBase64
}) => {
  if (!qrBase64) return null;

  const handlePrint = () => {
    const win = window.open('');

    win.document.write(`
      <html>
        <head>
          <title>TraceChain QR</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f8fafc;
              font-family: Arial, sans-serif;
            }

            .card {
              background: white;
              border-radius: 32px;
              padding: 40px;
              border: 1px solid #e2e8f0;
              text-align: center;
              width: 380px;
              box-shadow: 0 10px 30px rgba(15,23,42,0.08);
            }

            .logo {
              width: 70px;
              height: 70px;
              border-radius: 24px;
              background: #dcfce7;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              font-size: 32px;
            }

            .title {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 8px;
            }

            .subtitle {
              color: #64748b;
              margin-bottom: 28px;
              line-height: 1.6;
            }

            img {
              width: 230px;
              height: 230px;
              border-radius: 24px;
              padding: 12px;
              border: 1px solid #e2e8f0;
              background: white;
              margin-bottom: 24px;
            }

            .product {
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 8px;
            }

            .trace {
              font-size: 13px;
              font-family: monospace;
              letter-spacing: 1px;
              color: #10b981;
              font-weight: bold;
              margin-bottom: 24px;
            }

            .badge {
              display: inline-block;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #bbf7d0;
              padding: 10px 18px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 700;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>

          <div class="card">

            <div class="logo">
              🌿
            </div>

            <div class="title">
              TraceChain
            </div>

            <div class="subtitle">
              Secure Blockchain Product Verification
            </div>

            <img src="${qrBase64}" />

            <div class="product">
              ${productName}
            </div>

            <div class="trace">
              ${traceId}
            </div>

            <div class="badge">
              Blockchain Verified Product
            </div>

          </div>

          <script>
            window.onload = () => {
              window.print();
              window.close();
            }
          </script>

        </body>
      </html>
    `);
  };

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[36px] p-6 md:p-8 shadow-sm w-full max-w-sm mx-auto">

      {/* Background Glow */}

      <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-44 h-44 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}

      <div className="relative flex flex-col items-center text-center mb-8">

        <div className="w-20 h-20 rounded-[28px] bg-emerald-100 flex items-center justify-center shadow-sm mb-5">

          <QrCode className="w-10 h-10 text-emerald-600" />

        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold mb-5">

          <ShieldCheck className="w-4 h-4" />

          Blockchain Verified

        </div>

        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">

          Product QR

        </h2>

        <p className="text-slate-500 leading-relaxed max-w-xs">

          Scan to verify authenticity and trace
          the complete supply chain journey.

        </p>

      </div>

      {/* QR Card */}

      <div className="relative bg-[#F8FAFC] border border-slate-200 rounded-[32px] p-6 text-center mb-8">

        {/* QR */}

        <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm mb-6 inline-block">

          <img
            src={qrBase64}
            alt="QR Code"
            className="w-56 h-56 object-contain"
          />

        </div>

        {/* Product */}

        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">

          {productName}

        </h3>

        {/* Trace ID */}

        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2">

          <Sparkles className="w-4 h-4 text-orange-500" />

          <p className="font-mono text-xs tracking-[0.2em] text-emerald-600 font-bold">

            {traceId}

          </p>

        </div>

      </div>

      {/* Buttons */}

      <div className="flex flex-col sm:flex-row gap-4">

        {/* Download */}

        <a
          href={qrBase64}
          download={`QR_${traceId}.png`}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md"
        >

          <Download className="w-5 h-5" />

          Download QR

        </a>

        {/* Print */}

        <button
          onClick={handlePrint}
          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl py-4 font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md"
        >

          <Printer className="w-5 h-5" />

          Print QR

        </button>

      </div>

      {/* Footer */}

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">

        <p className="text-xs text-slate-400 leading-relaxed">

          Secure QR generated using TraceChain
          blockchain verification infrastructure.

        </p>

      </div>
    </div>
  );
};

export default QRGenerator;