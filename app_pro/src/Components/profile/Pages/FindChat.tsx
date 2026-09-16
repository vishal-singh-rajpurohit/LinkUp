import { FaFileAlt, FaImage, FaVideo, FaMusic } from 'react-icons/fa'
import { FaCirclePlay } from 'react-icons/fa6'
import { useState } from 'react'

const AudioSingle = () => {
    return (
        <div className="glass-card p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition shadow-md">
            <button type="button" className="p-3 rounded-xl accent-bg text-black shadow-md cursor-pointer hover:scale-105 transition">
                <FaCirclePlay size={20} />
            </button>
            <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-[var(--c-text-primary)]">
                    Audio Attachment.mp3
                </p>
                <div className="flex items-center justify-between text-[10px] text-[var(--c-text-muted)] mt-1">
                    <span>1:28</span>
                    <span>3:01</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full w-[45%] accent-bg rounded-full"></div>
                </div>
            </div>
        </div>
    )
}

const MediaGrid = ({ type }: { type: string }) => {
    if (type === 'audio') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                <AudioSingle />
                <AudioSingle />
                <AudioSingle />
                <AudioSingle />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--c-text-muted)] space-y-2">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-[var(--c-text-muted)]">
                {type === 'photo' && <FaImage size={28} />}
                {type === 'video' && <FaVideo size={28} />}
                {type === 'docs' && <FaFileAlt size={28} />}
                {type === 'gif' && <FaMusic size={28} />}
            </div>
            <p className="text-sm font-semibold text-[var(--c-text-primary)] capitalize">No {type} media found</p>
            <p className="text-xs">Media shared in this chat will appear here automatically.</p>
        </div>
    );
}

const FindChat = () => {
    const [medType, setMedType] = useState<string>('photo');

    const tabs = [
        { id: 'photo', label: 'Photos' },
        { id: 'gif', label: 'GIFs' },
        { id: 'video', label: 'Videos' },
        { id: 'audio', label: 'Audio' },
        { id: 'docs', label: 'Docs' }
    ];

    return (
        <section className="h-full flex flex-col items-center w-full p-4">
            <section className="w-full max-w-4xl space-y-4">
                {/* Media Filter Tabs */}
                <div className="glass-panel p-1.5 rounded-2xl border border-white/10 grid grid-cols-5 gap-1 text-xs font-bold shadow-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setMedType(tab.id)}
                            className={`py-2 rounded-xl transition cursor-pointer text-center ${
                                medType === tab.id
                                    ? 'accent-bg text-black shadow-md font-extrabold'
                                    : 'text-[var(--c-text-muted)] hover:text-[var(--c-text-primary)] hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Media Container */}
                <div className="glass-panel rounded-3xl border border-white/10 min-h-[60vh] shadow-xl overflow-hidden">
                    <MediaGrid type={medType} />
                </div>
            </section>
        </section>
    )
}

export default FindChat