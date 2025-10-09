'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleScan = useCallback((result: QrScanner.ScanResult) => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    onScan(result.data);
  }, [onScan]);

  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Initialize QR scanner
        const scanner = new QrScanner(
          videoRef.current,
          handleScan,
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5, // Optimize performance
            preferredCamera: 'environment'
          }
        );

        scannerRef.current = scanner;
        await scanner.start();

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!mounted) return;

        console.error('Camera error:', err);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please enable camera permissions in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
        setIsLoading(false);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [handleScan, cleanup]);

  const handleClose = () => {
    cleanup();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full aspect-square object-cover rounded-b-xl"
                playsInline
                muted
              />

              {/* Scanning overlay */}
              {!isLoading && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-center text-sm">
                    Position the QR code within the frame
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        {!error && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Hold your device steady and ensure the QR code is well-lit for faster scanning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
