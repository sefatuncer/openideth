'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

interface PropertyImageGalleryProps {
  images: GalleryImage[];
}

export function PropertyImageGallery({ images }: PropertyImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.order - b.order;
  });

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-primary-50 text-muted">
        No images available
      </div>
    );
  }

  const current = sorted[selectedIndex];

  const goTo = (index: number) => {
    setSelectedIndex(((index % sorted.length) + sorted.length) % sorted.length);
  };

  return (
    <>
      {/* Main image */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="aspect-[16/9] cursor-pointer bg-primary-50"
          onClick={() => setLightboxOpen(true)}
        >
          {current && (
            <img
              src={current.url}
              alt={current.caption || 'Property image'}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(selectedIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(selectedIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          {selectedIndex + 1} / {sorted.length}
        </div>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                idx === selectedIndex ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={img.url} alt={img.caption || ''} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {sorted.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex - 1); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex + 1); }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={current.url}
            alt={current.caption || 'Property image'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
