import QRCode from 'qrcode';

export const generateQR = async (traceId) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const traceUrl = `${baseUrl}/trace/${traceId}`;
    const qrCode = await QRCode.toDataURL(traceUrl);
    return qrCode;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
};