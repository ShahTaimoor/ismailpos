import React from 'react';
import BaseModal from './BaseModal';
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, altText }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = altText || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      variant="centered"
      className="bg-transparent shadow-none border-none p-0 overflow-hidden"
      contentClassName="p-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg"
      showCloseButton={false}
    >
      <div className="relative group w-full h-full flex flex-col items-center justify-center p-4">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Container */}
        <div 
          className="relative max-w-full max-h-[85vh] overflow-auto flex items-center justify-center cursor-zoom-out"
          onClick={onClose}
        >
          <img
            src={imageUrl}
            alt={altText}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* Footer Info */}
        {altText && (
            <div className="mt-4 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {altText}
            </div>
        )}
      </div>
    </BaseModal>
  );
};

export default ImagePreviewModal;
