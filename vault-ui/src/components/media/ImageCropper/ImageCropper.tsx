import * as React from "react";
import Cropper from "react-easy-crop";
import { Label } from "@/components/ui/label/label";
import { _Button } from "@/components/ui/button/button";
import { Slider } from "@/components/ui/slider/slider";
import { cn } from "@/lib/utils";

export interface ImageCropperProps {
  label?: string;
  image: string;
  onCropComplete?: (croppedArea: any, croppedAreaPixels: any) => void;
  aspect?: number;
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  className?: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  label,
  image,
  onCropComplete,
  aspect = 16 / 9,
  cropShape = "rect",
  showGrid = true,
  className,
}) => {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}

      <div className="relative h-[400px] w-full bg-muted rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          cropShape={cropShape}
          showGrid={showGrid}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Zoom</Label>
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            min={1}
            max={3}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Rotation</Label>
          <Slider
            value={[rotation]}
            onValueChange={(value) => setRotation(value[0])}
            min={0}
            max={360}
            step={1}
          />
        </div>
      </div>
    </div>
  );
};

ImageCropper.displayName = "ImageCropper";
