'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ImageCropperProps {
  image: string; // Data URL or blob URL
  filename: string;
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  open: boolean;
}

export function ImageCropper({ image, filename, onComplete, onCancel, open }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasTransparency, setHasTransparency] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null); // null = transparent

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Check for transparency when image loads
  useEffect(() => {
    const checkTransparency = async () => {
      if (!image) return;
      const hasAlpha = await checkImageTransparency(image);
      setHasTransparency(hasAlpha);
    };
    checkTransparency();
  }, [image]);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedFile = await getCroppedImg(
        image,
        croppedAreaPixels,
        filename,
        hasTransparency ? backgroundColor : null
      );
      onComplete(croppedFile);
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Your Photo</DialogTitle>
        </DialogHeader>

        <div
          className="relative h-96 rounded-lg"
          style={{
            backgroundColor: hasTransparency && backgroundColor ? backgroundColor : '#f3f4f6',
            backgroundImage: hasTransparency && !backgroundColor
              ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px'
              : undefined,
          }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square crop
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect" // Rectangular/square crop area
            showGrid={true}
            style={{
              containerStyle: {
                background: hasTransparency && backgroundColor ? backgroundColor : undefined,
              },
            }}
          />
          {hasTransparency && backgroundColor && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${backgroundColor} 0%, ${backgroundColor} 50%, transparent 50%)`,
                mixBlendMode: 'multiply',
                opacity: 0.3,
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {hasTransparency && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Background
                <span className="text-xs text-muted-foreground ml-2">
                  (Transparent image detected)
                </span>
              </label>
              <div className="flex gap-2 items-center flex-wrap">
                {/* Color picker */}
                <input
                  type="color"
                  value={backgroundColor || '#4F46E5'}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-8 w-12 border-2 border-gray-300 cursor-pointer"
                  title="Custom color"
                />

                {/* Transparent option as circle */}
                <button
                  type="button"
                  onClick={() => setBackgroundColor(null)}
                  className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform ${
                    backgroundColor === null ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#999999 0% 25%, white 0% 50%) 50% / 8px 8px',
                  }}
                  title="Keep transparent"
                >
                  <span className="sr-only">Transparent</span>
                </button>

                {/* Preset colors */}
                {['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBackgroundColor(color)}
                    className={`h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform ${
                      backgroundColor === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Save Photo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Check if image has transparency
async function checkImageTransparency(imageSrc: string): Promise<boolean> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return false;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Check alpha channel (every 4th value)
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true; // Found transparency
    }
  }

  return false;
}

// Helper function to crop and compress image
async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
  filename: string,
  backgroundColor: string | null = null
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas to target size (800x800 for optimal quality/size)
  const targetSize = 800;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // If background color is specified, draw circular background
  if (backgroundColor) {
    const centerX = targetSize / 2;
    const centerY = targetSize / 2;
    const radius = targetSize / 2;

    // Draw circular background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  // Draw cropped and resized image
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    targetSize,
    targetSize
  );

  // Convert to blob (WebP if supported, JPEG fallback)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        // Convert blob to File
        const file = new File([blob], filename, {
          type: blob.type,
          lastModified: Date.now(),
        });

        resolve(file);
      },
      'image/webp', // WebP format for best compression
      0.9 // 90% quality
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
