import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState('');

  const startScanner = async () => {
    setCamError('');
    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (onScan) onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan-miss errors
        }
      );
      setScanning(true);
    } catch (err) {
      setCamError(err?.message || 'Camera access denied or not available');
      if (onError) onError(err);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="qr-scanner-wrapper">
      <div id="qr-reader" ref={scannerRef} style={{ width: '100%', maxWidth: 400 }} />
      {camError && <p className="qr-error">{camError}</p>}
      <div className="qr-scanner-controls">
        {!scanning ? (
          <button className="primary-action-btn" onClick={startScanner} type="button">
            Start Camera Scanner
          </button>
        ) : (
          <button className="danger-btn" onClick={stopScanner} type="button">
            Stop Scanner
          </button>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
