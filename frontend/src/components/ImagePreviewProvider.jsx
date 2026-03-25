import React, { createContext, useContext, useState, useCallback } from 'react';
import ImagePreviewModal from './ImagePreviewModal';

const ImagePreviewContext = createContext(null);

export const useImagePreview = () => {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error('useImagePreview must be used within an ImagePreviewProvider');
  }
  return context;
};

export const ImagePreviewProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  const openPreview = useCallback((url, alt = '') => {
    setImageUrl(url);
    setAltText(alt);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ImagePreviewContext.Provider value={{ openPreview }}>
      {children}
      <ImagePreviewModal
        isOpen={isOpen}
        onClose={closePreview}
        imageUrl={imageUrl}
        altText={altText}
      />
    </ImagePreviewContext.Provider>
  );
};
