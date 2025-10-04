'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import type { MigrantWorker, HealthRecord } from '@/types';

interface QRCodeManagerProps {
  mode: 'generate' | 'scan' | 'display';
  worker?: MigrantWorker;
  onScanSuccess?: (mhiId: string) => void;
  onScanError?: (error: string) => void;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  mode,
  worker,
  onScanSuccess,
  onScanError
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'generate' && worker) {
      generateQRCode();
    } else if (mode === 'scan') {
      setupScanner();
    }

    return () => {
      cleanup();
    };
  }, [mode, worker]);

  const generateQRCode = async () => {
    if (!worker) return;

    try {
      setIsLoading(true);

      // Create QR code data with health information
      const qrData = {
        mhi_id: worker.mhi_id,
        name: worker.name,
        age: worker.age,
        gender: worker.gender,
        occupation: worker.occupation,
        languages: worker.languages,
        emergency_contact: worker.emergency_contact_phone,
        health_summary: {
          last_checkup: worker.health_records?.[0]?.reported_at || null,
          critical_conditions: worker.medical_conditions || [],
          allergies: worker.allergies || [],
          vaccination_status: worker.vaccination_status || {}
        },
        generated_at: new Date().toISOString(),
        system_version: '1.0.0'
      };

      // Generate QR code with high error correction for healthcare use
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#008B8B', // Kerala teal
          light: '#FFFFFF'
        },
        width: 300
      });

      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScannerActive(true);
        startScanning();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onScanError?.('Camera access denied or not available');
    }
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const scan = () => {
      if (!scannerActive || !ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Get image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection (in production, use a proper QR code library)
      try {
        // This is a simplified detection - in production use jsQR or similar
        const detectedData = detectQRCode(imageData);
        if (detectedData) {
          handleQRCodeDetected(detectedData);
          return;
        }
      } catch (error) {
        // Continue scanning
      }

      requestAnimationFrame(scan);
    };

    video.addEventListener('loadedmetadata', () => {
      requestAnimationFrame(scan);
    });
  };

  const detectQRCode = (imageData: ImageData): string | null => {
    // Placeholder for QR code detection logic
    // In production, use a library like jsQR
    return null;
  };

  const handleQRCodeDetected = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.mhi_id) {
        onScanSuccess?.(qrData.mhi_id);
        setScannerActive(false);
        cleanup();
      }
    } catch (error) {
      onScanError?.('Invalid QR code format');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !worker) return;

    const link = document.createElement('a');
    link.download = `MHI-${worker.mhi_id}-QRCode.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeDataUrl || !worker) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Migrant Health ID - ${worker.mhi_id}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: white;
          }
          .qr-container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #008B8B;
            border-radius: 10px;
          }
          .header {
            color: #008B8B;
            margin-bottom: 20px;
          }
          .qr-code {
            margin: 20px 0;
          }
          .info {
            text-align: left;
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .emergency {
            color: #FF4500;
            font-weight: bold;
            text-align: center;
            margin-top: 15px;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">
            <h2>🏥 Kerala Migrant Health System</h2>
            <h3>Digital Health ID</h3>
          </div>
          
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />
          </div>
          
          <div class="info">
            <strong>MHI ID:</strong> ${worker.mhi_id}<br>
            <strong>Name:</strong> ${worker.name}<br>
            <strong>Age:</strong> ${worker.age}<br>
            <strong>Gender:</strong> ${worker.gender}<br>
            <strong>Occupation:</strong> ${worker.occupation}
          </div>
          
          <div class="emergency">
            🚨 Emergency: Call 108
          </div>
          
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            Generated: ${new Date().toLocaleDateString()}<br>
            Keep this ID safe and show it during healthcare visits
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (mode === 'generate' || mode === 'display') {
    return (
      <div className="space-y-6">
        {/* QR Code Display */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="qr-code-container inline-block"
          >
            {isLoading ? (
              <div className="w-72 h-72 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-kerala-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating secure QR code...</p>
                </div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="relative">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Migrant Health ID QR Code"
                  className="w-72 h-72 rounded-xl shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-kerala-teal text-white p-2 rounded-full shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.283.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-72 h-72 flex items-center justify-center bg-gray-100 rounded-xl">
                <p className="text-gray-600">No QR code generated</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Worker Information */}
        {worker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="health-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">👤</span>
              Health ID Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">MHI ID:</span>
                <div className="font-bold text-kerala-teal text-lg">{worker.mhi_id}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <div className="font-semibold">{worker.name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Age:</span>
                <div>{worker.age} years</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Gender:</span>
                <div className="capitalize">{worker.gender}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Occupation:</span>
                <div className="capitalize">{worker.occupation}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Languages:</span>
                <div>{worker.languages?.join(', ') || 'N/A'}</div>
              </div>
            </div>

            {/* Emergency Contact */}
            {worker.emergency_contact_phone && (
              <div className="mt-4 p-3 bg-error-red bg-opacity-10 rounded-lg border border-error-red border-opacity-30">
                <span className="font-medium text-error-red">Emergency Contact:</span>
                <div className="font-bold text-error-red">{worker.emergency_contact_phone}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        {qrCodeDataUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadQRCode}
              className="bg-kerala-teal text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              💾 Download QR Code
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={printQRCode}
              className="bg-neon-blue text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              🖨️ Print Health ID
            </motion.button>
          </motion.div>
        )}

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 rounded-xl p-6 text-sm"
        >
          <h4 className="font-semibold mb-3 flex items-center">
            <span className="text-xl mr-2">📱</span>
            How to Use Your Digital Health ID
          </h4>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-health-green mr-2">✓</span>
              Show this QR code at any healthcare facility in Kerala
            </li>
            <li className="flex items-start">
              <span className="text-health-green mr-2">✓</span>
              Healthcare providers can scan to access your health records instantly
            </li>
            <li className="flex items-start">
              <span className="text-health-green mr-2">✓</span>
              Works across all government and private hospitals
            </li>
            <li className="flex items-start">
              <span className="text-health-green mr-2">✓</span>
              Keep a printed copy as backup and save digital copy on your phone
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-warning-orange bg-opacity-10 rounded-lg border border-warning-orange border-opacity-30">
            <span className="font-medium text-warning-orange">⚠️ Important:</span>
            <span className="text-gray-700 ml-2">Keep your MHI ID safe and don't share it with unauthorized persons</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Scan Migrant Health ID</h3>
          <p className="text-gray-600">Position the QR code within the camera frame</p>
        </div>

        {/* Camera Scanner */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-80 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-neon-blue border-opacity-50 rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-blue"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-blue"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-blue"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-blue"></div>
              
              {/* Scanning line animation */}
              <motion.div
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-neon-blue opacity-75"
              />
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {scannerActive ? (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-health-green rounded-full animate-pulse mr-2"></div>
                Scanning...
              </span>
            ) : (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-error-red rounded-full mr-2"></div>
                Camera inactive
              </span>
            )}
          </div>
        </div>

        {/* Manual Input Fallback */}
        <div className="health-card p-4">
          <h4 className="font-semibold mb-3">Can't scan? Enter MHI ID manually</h4>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Enter MHI ID (e.g., KER12345678ABCD)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kerala-teal"
            />
            <button
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                if (input?.value) {
                  onScanSuccess?.(input.value);
                }
              }}
              className="bg-kerala-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QRCodeManager;