import React from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOP_SIZES = [
  { size: 'SMALL', chest: '96-101cm', length: '68cm' },
  { size: 'MEDIUM', chest: '102-107cm', length: '70cm' },
  { size: 'LARGE', chest: '108-113cm', length: '72cm' },
];

const BOTTOM_SIZES = [
  { size: '28', waist: '71cm', inseam: '78cm' },
  { size: '30', waist: '76cm', inseam: '79cm' },
  { size: '32', waist: '81cm', inseam: '80cm' },
  { size: '34', waist: '86cm', inseam: '81cm' },
  { size: '36', waist: '91cm', inseam: '82cm' },
];

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-light">Size Guide</h2>
          <button onClick={onClose} aria-label="Close size guide">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-medium mb-3 uppercase tracking-wide">Tops</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="pb-2">Size</th><th className="pb-2">Chest</th><th className="pb-2">Length</th>
                </tr>
              </thead>
              <tbody>
                {TOP_SIZES.map(row => (
                  <tr key={row.size} className="border-t border-gray-100">
                    <td className="py-2">{row.size}</td><td className="py-2">{row.chest}</td><td className="py-2">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 uppercase tracking-wide">Bottoms</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase">
                  <th className="pb-2">Size</th><th className="pb-2">Waist</th><th className="pb-2">Inseam</th>
                </tr>
              </thead>
              <tbody>
                {BOTTOM_SIZES.map(row => (
                  <tr key={row.size} className="border-t border-gray-100">
                    <td className="py-2">{row.size}</td><td className="py-2">{row.waist}</td><td className="py-2">{row.inseam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;