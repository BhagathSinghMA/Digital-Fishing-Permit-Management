import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Printer, Download } from 'lucide-react';
import { Button } from './Button';

interface QRViewerProps {
  tokenValue: string;
  permitNumber?: string;
  boatName?: string;
  ownerName?: string;
  port?: string;
  expiryDate?: string;
}

export const QRViewer: React.FC<QRViewerProps> = ({
  tokenValue,
  permitNumber,
  boatName,
  ownerName,
  port,
  expiryDate,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300 mb-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>OFFICIAL DEPARTURE QR TOKEN</span>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block mb-4">
        <QRCodeSVG
          value={tokenValue}
          size={180}
          level="H"
          includeMargin={false}
        />
      </div>

      {permitNumber && (
        <div className="font-mono text-sm font-bold text-slate-800 tracking-wider mb-1">
          {permitNumber}
        </div>
      )}

      {boatName && (
        <div className="text-xs text-slate-600 font-medium">
          Vessel: <span className="font-semibold text-slate-900">{boatName}</span>
        </div>
      )}

      {port && (
        <div className="text-xs text-slate-500 mt-0.5">
          Station: <span className="font-medium text-slate-700">{port}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
          Print Pass
        </Button>
      </div>
    </div>
  );
};
