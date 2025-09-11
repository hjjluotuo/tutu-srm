import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerConfig } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, isOpen }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && !isScanning) {
      setIsScanning(true);
      
      const config: Html5QrcodeScannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      };

      const scanner = new Html5QrcodeScanner("barcode-scanner", config, false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // 扫描成功
          onScan(decodedText);
          scanner.clear();
          setIsScanning(false);
          onClose();
        },
        (error) => {
          // 扫描错误（通常是没有找到条码，这是正常的）
          console.log('Scan error:', error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        setIsScanning(false);
      }
    };
  }, [isOpen, onScan, onClose, isScanning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">扫描商品条码</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">
            请将商品条码对准摄像头进行扫描
          </p>
          <div id="barcode-scanner" className="w-full"></div>
        </div>
        
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            取消扫描
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;