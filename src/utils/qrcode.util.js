import QRCode from 'qrcode';

export async function generateQRCodeBuffer(qrCodeUrl) {
  try {
    const buffer = await QRCode.toBuffer(qrCodeUrl);
    return buffer;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}
