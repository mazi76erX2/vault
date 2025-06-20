import * as React from 'react';
import {useState, useRef, useEffect} from 'react';

import ReactCrop, {
    centerCrop,
    makeAspectCrop, PercentCrop, PixelCrop,
} from 'react-image-crop';
import { Stack, Box, Slider, Typography } from '@mui/material';
import {canvasPreview} from './createCanvas';
import {HCModal} from '../HCModal';

import 'react-image-crop/dist/ReactCrop.css';

const ASPECT_RATIO = 1;
function centerAspectCrop(mediaWidth: number,  mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export interface HCImageCropperProps {
    imgSrc?: string;
    onClose(cancel?: boolean): void;
    updateAvatar(data: string): void;
}
export const HCImageCropper = ({imgSrc, updateAvatar, onClose}: HCImageCropperProps) => {
    const previewCanvasRef = useRef<HTMLCanvasElement | null>();
    const imgRef = useRef<HTMLImageElement | null>();
    const blobUrlRef = useRef('');
    const [crop, setCrop] = useState<PercentCrop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate] = useState(0);
    const [aspect] = useState(1);
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    async function onDownloadCropClick() {
        const image = imgRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist');
        }
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        );
        const ctx = offscreen.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }
        // Set the background color to white
        ctx.fillStyle = 'white'; // Set background color to white
        ctx.fillRect(0, 0, offscreen.width, offscreen.height); // Fill the canvas
        ctx.drawImage(
            previewCanvas,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height,
            0,
            0,
            offscreen.width,
            offscreen.height
        );
        const blob = await new Promise((resolve) => {
            offscreen.convertToBlob({
                type: 'image/png',
            }).then(resolve);
        });

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blobUrlRef.current = URL.createObjectURL(blob);
        // let file;
        // if (blob) {
        //   file = new File([blob], `smallLogo_image_${Math.floor(Date.now() / 1000)}.png`, {
        //     type: 'image/png',
        //   });
        // }
    }

    useEffect(
        () => {
            if (!imgRef.current || !previewCanvasRef.current) return;
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(imgRef.current!, previewCanvasRef.current!, completedCrop, scale, rotate).then();
            }
        },
        [completedCrop, scale, rotate]
    );

    const renderContent = () => {
        return (
            <Stack sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* {error && <p className="text-red-400 text-xs">{error}</p>} */}
                {imgSrc && (
                    <Stack sx={{
                        maxWidth: 550,
                    }} display="flex" flexDirection="column" alignItems="center">
                        <Stack>
                            <Box sx={{ width: 320 }}>
                                <Box sx={{ m: 3 }} />
                                <Typography gutterBottom>Scale</Typography>
                                <Slider
                                    valueLabelDisplay="auto"
                                    onChange={(e, value) => {
                                        setScale(Number(value));
                                    }}
                                    step={0.1}
                                    min={0}
                                    max={5}
                                    aria-label="custom thumb label"
                                    defaultValue={1}
                                />
                            </Box>{' '}
                        </Stack>
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={ASPECT_RATIO}
                            minWidth={400}
                            maxWidth={500}
                            minHeight={100}
                            maxHeight={250}
                            circularCrop
                        >
                            <img
                                ref={(ref) => imgRef.current = ref}
                                src={imgSrc}
                                alt="Upload"
                                // style={{ maxHeight: '100vh' }}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={(e) => onImageLoad(e)}
                            />
                        </ReactCrop>
                    </Stack>
                )}

                {crop && (
                    <canvas
                        ref={(ref) => previewCanvasRef.current = ref}
                        className="mt-4"
                        style={{
                            display: 'none',
                            border: '1px solid black',
                            objectFit: 'contain',
                            width: 150,
                            height: 150,
                        }}
                    />
                )}
            </Stack>
        );
    };

    return (
        <>
            {imgSrc && (
                <HCModal
                    options={{
                        renderContent,
                        title: 'Crop Image',
                        type: 'confirm',
                        onConfirm() {
                            console.log(previewCanvasRef.current);
                            if (!previewCanvasRef.current) return;
                            if ('toDataURL' in previewCanvasRef.current) {
                                const dataUrl = previewCanvasRef.current.toDataURL();
                                updateAvatar(dataUrl);
                                onDownloadCropClick().then();
                                onClose(false);
                            }
                        },
                        onCancel() {
                            onClose(true);
                        }
                    }}
                    open={!!imgRef}
                />
            )}
        </>
    );
};