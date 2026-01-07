'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TourGalleryProps {
  images: string[];
  title: string;
  videoUrl?: string; // Optional video URL for the bottom-right slot
}

// Mockup video URL for demonstration
const MOCKUP_VIDEO_URL = 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4';

export function TourGallery({ images, title, videoUrl }: TourGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Ensure we have at least 4 images, fill with placeholders if needed
  const displayImages = [...images];
  while (displayImages.length < 4) {
    displayImages.push(images[0] || '/placeholder-tour.jpg');
  }

  // Use mockup video if no video provided
  const displayVideoUrl = videoUrl || MOCKUP_VIDEO_URL;
  
  // Calculate extra photos count (total images - 4 shown in gallery)
  const extraPhotosCount = Math.max(0, images.length - 4);

  const openLightbox = (image: string) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Calculate width for 9:16 image based on container height (500px on lg)
  // For 9:16: width = height * (9/16)
  // For 6:4: width = height/2 * (6/4) = height * (3/4) for each image

  return (
    <>
      {/* Gallery Grid */}
      <div className="flex h-[400px] gap-1 overflow-hidden rounded-2xl md:h-[450px] lg:h-[500px]">
        {/* Left image - flexible, takes remaining space */}
        <div
          className="relative h-full min-w-0 flex-1 cursor-pointer overflow-hidden"
          onClick={() => openLightbox(displayImages[0])}
        >
          <Image
            src={displayImages[0]}
            alt={`${title} - Main image`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 50vw, 40vw"
            priority
          />
          <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
        </div>

        {/* Middle slot - 9:16 aspect ratio (portrait) - VIDEO */}
        <div
          className="relative h-full cursor-pointer overflow-hidden"
          style={{ width: 'calc((100vh * 0.5) * (9/16))', maxWidth: '280px', minWidth: '180px' }}
          onClick={() => setIsVideoModalOpen(true)}
        >
          <div className="relative h-full w-full" style={{ aspectRatio: '9/16' }}>
            {/* Video with autoplay, muted, loop */}
            <video
              src={displayVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
          </div>
        </div>

        {/* Right column - two images stacked with 6:4 aspect ratio each */}
        <div className="flex h-full flex-col gap-1" style={{ width: 'calc((100vh * 0.25) * (6/4))', maxWidth: '320px', minWidth: '200px' }}>
          {/* Top right image - 6:4 aspect ratio */}
          <div
            className="relative w-full flex-1 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(displayImages[2])}
          >
            <div className="relative h-full w-full">
              <Image
                src={displayImages[2]}
                alt={`${title} - Image 3`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
            </div>
          </div>

          {/* Bottom right image - 6:4 aspect ratio */}
          <div
            className="relative w-full flex-1 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(displayImages[3])}
          >
            <div className="relative h-full w-full">
              <Image
                src={displayImages[3]}
                alt={`${title} - Image 4`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
              
              {/* Show "+X photos" badge if there are more than 4 images */}
              {extraPhotosCount > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  +{extraPhotosCount} photos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={closeLightbox}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={selectedImage}
              alt={title}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video container - 9:16 aspect ratio for portrait video */}
          <div
            className="relative flex h-[90vh] max-h-[90vh] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={displayVideoUrl}
              autoPlay
              controls
              playsInline
              className="h-full max-h-[90vh] rounded-lg object-contain"
              style={{ maxWidth: 'calc(90vh * (9/16))' }}
            />
          </div>
        </div>
      )}
    </>
  );
}

