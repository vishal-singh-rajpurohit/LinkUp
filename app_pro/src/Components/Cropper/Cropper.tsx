import { useEffect, useRef, useState, type SetStateAction } from 'react';
import { CircleStencil } from 'react-advanced-cropper';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { updateAvatar } from '../../app/functions/auth';
import { useAppDispatch } from '../../app/hooks';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const api = import.meta.env.VITE_API;

interface MyCropperRef {
    getCanvas: () => HTMLCanvasElement;
}

function Loading({ open }: {
    open: boolean;
}) {
    return (
        <div className={`fixed z-50 inset-0 ${open ? 'flex' : 'hidden'} flex-col bg-[#59339945] items-center justify-center p-2`}>
            <AiOutlineLoading3Quarters size={40} color='#9644e2' className='animate-spin' />
        </div>
    )
}

export const SampleCropper = ({ open, setOpen, image, setImage }: {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    image: string;
    setImage: React.Dispatch<SetStateAction<string>>;
}) => {
    const disp = useAppDispatch()
    const cropperRef = useRef<MyCropperRef | null>(null);
    const [loading, setLoading] = useState<boolean>(false)

    const onCrop = () => {
        setLoading(true)
        const canvas = cropperRef.current?.getCanvas();
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            setImage(dataUrl)
            setLoading(false)
        }
    };

    const CropAndSave = () => {
        setLoading(true)
        const canvas = cropperRef.current?.getCanvas();
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            setImage(dataUrl)
            canvas.toBlob(async (blob) => {
                await upload(blob);
            })
            setLoading(false)
        }
    };

    async function upload(image: Blob | null) {
        if (image) {
            const formData = new FormData()
            formData.append('avatar', image)
            try {
                const resp = await axios.post<{
                    data: {
                        avatar: string;
                    }
                }>(`${api}/user/update-avatar`, formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                console.log(`done`);
                disp(updateAvatar({ avatar: resp.data.data.avatar }))
                setImage("")
            } catch (error) {
                console.log(`Error data: ${error}`);
            }
        }
    }

    return (
        <>
            <Loading open={loading} />
            <section className={`fixed z-40 inset-0 ${open ? 'flex' : 'hidden'} flex-col bg-slate-700 items-center justify-center p-2`}>
                <div className="w-full max-w-screen-lg h-full max-h-screen flex flex-col rounded-lg overflow-hidden bg-slate-900 shadow-lg">
                    {/* Top Bar */}
                    <div className="w-full flex gap-2 justify-end items-center p-2 bg-slate-950">
                        <button
                            className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-all duration-200"
                            onClick={onCrop}
                        >
                            Crop
                        </button>
                        <button
                            className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-all duration-200"
                            onClick={CropAndSave}
                        >
                            Save
                        </button>
                    </div>

                    <div className="flex-1 min-h-0">
                        <Cropper
                            ref={cropperRef}
                            src={image}
                            stencilComponent={CircleStencil}
                            aspectRatio={1}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </section>
        </>

    );
};
