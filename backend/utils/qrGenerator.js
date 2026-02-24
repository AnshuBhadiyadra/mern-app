const QRCode = require('qrcode');

const generateQR = async (ticketId, eventId, participantId) => {
  try {
    const qrData = JSON.stringify({
      ticketId,
      eventId,
      participantId,
      timestamp: Date.now(),
      type: 'FELICITY_TICKET',
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQR };
