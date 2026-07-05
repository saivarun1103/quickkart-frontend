import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function ImageCropModal({
    image,
    fileName,
    onClose,
    onCropDone
}) {
    const [crop, setCrop] = useState({
        x: 0,
        y: 0
    });

    const [zoom, setZoom] = useState(1);

    const [croppedAreaPixels,
        setCroppedAreaPixels] = useState(null);

    const onCropComplete =
        useCallback((_, croppedPixels) => {

            setCroppedAreaPixels(
                croppedPixels
            );

        }, []);


    // 🔥 CREATE CROPPED IMAGE
    const createCroppedImage = async () => {

        if (
            !image ||
            !croppedAreaPixels
        ) return;

        const imageElement =
            new Image();

        imageElement.src = image;

        imageElement.onload = () => {

            const canvas =
                document.createElement(
                    "canvas"
                );

            const ctx =
                canvas.getContext("2d");

            canvas.width =
                croppedAreaPixels.width;

            canvas.height =
                croppedAreaPixels.height;

            ctx.drawImage(
                imageElement,

                croppedAreaPixels.x,
                croppedAreaPixels.y,

                croppedAreaPixels.width,
                croppedAreaPixels.height,

                0,
                0,

                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob(
                (blob) => {

                    if (!blob) return;

                    const croppedFile =
                        new File(
                            [blob],

                            fileName,

                            {
                                type:
                                    "image/jpeg"
                            }
                        );

                    onCropDone(
                        croppedFile
                    );

                    onClose();

                },

                "image/jpeg"
            );
        };
    };

    return (
        <div
            className="
                fixed
                inset-0

                z-[99999]

                bg-black/90
                backdrop-blur-xl

                flex
                items-center
                justify-center

                p-4
            "
        >
            <div
                className="
                    relative

                    w-full
                    max-w-2xl

                    h-[80vh]

                    rounded-[32px]

                    overflow-hidden

                    border
                    border-zinc-800

                    bg-zinc-950
                "
            >

                {/* HEADER */}
                <div
                    className="
                        absolute
                        top-0
                        left-0
                        right-0

                        z-20

                        flex
                        items-center
                        justify-between

                        p-5

                        bg-black/40
                        backdrop-blur-xl
                    "
                >
                    <h2
                        className="
                            text-xl
                            font-bold
                        "
                    >
                        Crop Image
                    </h2>

                    <button
                        onClick={onClose}

                        className="
                            w-11
                            h-11

                            rounded-2xl

                            bg-zinc-900
                            hover:bg-zinc-800

                            border
                            border-zinc-800
                        "
                    >
                        ✕
                    </button>
                </div>


                {/* CROPPER */}
                <div
                    className="
                        relative
                        w-full
                        h-full
                    "
                >
                    <Cropper
                        image={image}

                        crop={crop}

                        zoom={zoom}

                        aspect={4 / 3}

                        onCropChange={setCrop}

                        onZoomChange={setZoom}

                        onCropComplete={
                            onCropComplete
                        }
                    />
                </div>


                {/* FOOTER */}
                <div
                    className="
                        absolute
                        bottom-0
                        left-0
                        right-0

                        z-20

                        p-5

                        bg-black/50
                        backdrop-blur-xl
                    "
                >

                    {/* ZOOM */}
                    <input
                        type="range"

                        min={1}
                        max={3}

                        step={0.1}

                        value={zoom}

                        onChange={(e) =>
                            setZoom(
                                e.target.value
                            )
                        }

                        className="
                            w-full
                            mb-5
                        "
                    />


                    <div
                        className="
                            flex
                            gap-3
                        "
                    >
                        <button
                            onClick={onClose}

                            className="
                                flex-1
                                h-14

                                rounded-2xl

                                bg-zinc-800
                                hover:bg-zinc-700
                            "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={
                                createCroppedImage
                            }

                            className="
                                flex-1
                                h-14

                                rounded-2xl

                                bg-[#1ea753]
                                hover:bg-[#1ea753]/90

                                font-semibold
                            "
                        >
                            Apply Crop
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}