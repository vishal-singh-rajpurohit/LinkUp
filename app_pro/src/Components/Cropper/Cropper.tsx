import React, { useRef, useState, type SetStateAction } from 'react';
import { CircleStencil, Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { updateAvatar, updateGroupAvatar } from '../../app/functions/auth';
import { useAppDispatch } from '../../app/hooks';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { updateSelectedAvatar } from '../../app/functions/temp';

const api = import.meta.env.VITE_API;

interface MyCropperRef {
    getCanvas: () => HTMLCanvasElement;
}

function Loading({ open }: { open: boolean }) {
    if (!open) return null;
    return (
        <div className="fixed z-50 inset-0 flex flex-col bg-black/80 backdrop-blur-md items-center justify-center p-4">
            <AiOutlineLoading3Quarters size={44} className="accent-text animate-spin mb-2" />
            <span className="text-xs font-bold text-[var(--c-text-primary)]">Processing Image...</span>
        </div>
    )
}

export const SampleCropper = ({ open, image, setImage }: {
    open: boolean;
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

                disp(updateAvatar({ avatar: resp.data.data.avatar }))
                setImage("")
            } catch (error) {
                console.log(`Error data: ${error}`);
            }
        }
    }

    if (!open) return null;

    return (
        <>
            <Loading open={loading} />
            <section className="fixed z-40 inset-0 flex flex-col bg-black/80 backdrop-blur-md items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl">
                    <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-[var(--c-text-primary)]">Crop Profile Avatar</h3>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                                onClick={onCrop}
                            >
                                Preview
                            </button>
                            <button
                                className="px-5 py-1.5 accent-bg text-black font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                                onClick={CropAndSave}
                            >
                                Save Avatar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-slate-950/80 p-4">
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

export const SampleCropper2 = ({ open, image, setImage, contactId }: {
    open: boolean;
    image: string;
    setImage: React.Dispatch<SetStateAction<string>>;
    contactId: string;
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
            formData.append('contactId', contactId)
            try {
                const resp = await axios.post<{
                    data: {
                        avatar: string;
                    }
                }>(`${api}/chat/update-avatar`, formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                disp(updateGroupAvatar({ avatar: resp.data.data.avatar, contactId: contactId }))
                disp(updateSelectedAvatar({ avatar: resp.data.data.avatar }))
                setImage("")
            } catch (error) {
                console.log(`Error data: ${error}`);
                setImage("")
            }
        }
    }

    if (!open) return null;

    return (
        <>
            <Loading open={loading} />
            <section className="fixed z-40 inset-0 flex flex-col bg-black/80 backdrop-blur-md items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl">
                    <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-[var(--c-text-primary)]">Crop Group Logo</h3>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                                onClick={onCrop}
                            >
                                Preview
                            </button>
                            <button
                                className="px-5 py-1.5 accent-bg text-black font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                                onClick={CropAndSave}
                            >
                                Save Logo
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-slate-950/80 p-4">
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

export const SampleCropper3 = ({ open, setOpen, image, setImage, setPiblicId }: {
    open: boolean;
    image: string;
    setImage: React.Dispatch<SetStateAction<string>>;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
    setPiblicId: React.Dispatch<SetStateAction<string>>;
}) => {
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
                        public_id: string;
                    }
                }>(`${api}/chat/upload`, formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                setImage(resp.data.data.avatar)
                setPiblicId(resp.data.data.public_id)
                setOpen(false)
            } catch (error) {
                console.log(`Error data: ${error}`);
                setImage("")
                setOpen(false)
            }
        }
    }

    if (!open) return null;

    return (
        <>
            <Loading open={loading} />
            <section className="fixed z-40 inset-0 flex flex-col bg-black/80 backdrop-blur-md items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl">
                    <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-[var(--c-text-primary)]">Crop Image Attachment</h3>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                                onClick={onCrop}
                            >
                                Preview
                            </button>
                            <button
                                className="px-5 py-1.5 accent-bg text-black font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                                onClick={CropAndSave}
                            >
                                Save Attachment
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 bg-slate-950/80 p-4">
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
