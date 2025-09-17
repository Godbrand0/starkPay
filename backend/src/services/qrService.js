const QRCode = require('qrcode');
const crypto = require('crypto');

class QRService {
  /**
   * Generate a unique payment ID
   */
  generatePaymentId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create QR data payload for payment
   */
  createQRData(merchantAddress, tokenAddress, amount, paymentId, description = '') {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const paymentData = {
      merchantAddress: merchantAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      amount: amount.toString(),
      paymentId,
      description,
      timestamp: Date.now()
    };

    // Create payment URL
    const params = new URLSearchParams({
      m: paymentData.merchantAddress,
      t: paymentData.tokenAddress,
      a: paymentData.amount,
      id: paymentData.paymentId,
      d: paymentData.description
    });

    const paymentUrl = `${baseUrl}/pay?${params.toString()}`;
    
    return {
      paymentUrl,
      paymentData,
      paymentId
    };
  }

  /**
   * Generate QR code image from payment URL
   */
  async generateQRCode(paymentUrl, options = {}) {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrCodeDataURL = await QRCode.toDataURL(paymentUrl, qrOptions);
      
      return {
        dataURL: qrCodeDataURL,
        url: paymentUrl
      };
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  /**
   * Create complete QR payment package
   */
  async createPaymentQR(merchantAddress, tokenAddress, amount, description = '') {
    try {
      // Generate payment ID
      const paymentId = this.generatePaymentId();
      
      // Create QR data
      const qrData = this.createQRData(merchantAddress, tokenAddress, amount, paymentId, description);
      
      // Generate QR code image
      const qrCode = await this.generateQRCode(qrData.paymentUrl);
      
      return {
        paymentId,
        paymentUrl: qrData.paymentUrl,
        qrCodeDataURL: qrCode.dataURL,
        paymentData: qrData.paymentData,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      throw new Error(`Payment QR creation failed: ${error.message}`);
    }
  }

  /**
   * Validate payment URL parameters
   */
  validatePaymentParams(params) {
    const { m: merchantAddress, t: tokenAddress, a: amount, id: paymentId } = params;
    
    const errors = [];
    
    if (!merchantAddress || !/^0x[a-fA-F0-9]{64}$/.test(merchantAddress)) {
      errors.push('Invalid merchant address');
    }
    
    if (!tokenAddress || !/^0x[a-fA-F0-9]{64}$/.test(tokenAddress)) {
      errors.push('Invalid token address');
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.push('Invalid amount');
    }
    
    if (!paymentId || !/^[a-fA-F0-9]{32}$/.test(paymentId)) {
      errors.push('Invalid payment ID');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: {
        merchantAddress: merchantAddress?.toLowerCase(),
        tokenAddress: tokenAddress?.toLowerCase(),
        amount: parseFloat(amount),
        paymentId
      }
    };
  }

  /**
   * Generate QR code for merchant registration
   */
  async generateMerchantQR(merchantAddress, merchantName) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const registrationUrl = `${baseUrl}/merchant/register?address=${merchantAddress}&name=${encodeURIComponent(merchantName)}`;
      
      const qrCode = await this.generateQRCode(registrationUrl, {
        color: {
          dark: '#1E40AF', // Blue color for registration QR
          light: '#FFFFFF'
        }
      });
      
      return {
        registrationUrl,
        qrCodeDataURL: qrCode.dataURL
      };
    } catch (error) {
      throw new Error(`Merchant QR generation failed: ${error.message}`);
    }
  }
}

module.exports = new QRService();
