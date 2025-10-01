const QRCode = require('qrcode');
const crypto = require('crypto');
const { FRONTEND_URL } = require('../config/constants');

const generatePaymentId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const createPaymentUrl = (merchantAddress, tokenAddress, amount, paymentId) => {
  const params = new URLSearchParams({
    m: merchantAddress,
    t: tokenAddress,
    a: amount,
    id: paymentId,
  });
  return `${FRONTEND_URL}/pay?${params.toString()}`;
};

const generateQRCode = async (paymentUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = {
  generatePaymentId,
  createPaymentUrl,
  generateQRCode,
};