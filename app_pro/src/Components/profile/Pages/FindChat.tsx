import { FaCirclePause, FaCirclePlay } from 'react-icons/fa6'
import x from '../../../assets/no_dp.png'
import { useState } from 'react'

// Load if not found
const NoContent = () => {
    return (
        <h1 className='text-white font-bold font-stretch-125%'>No media found of this type</h1>
    )
}


// Applicable for images, docs, gifs, and videos
const Media = () => {
    return (
        <div className="grid grid-cols-5 gap-0.5 items-center justify-center overflow-y-scroll">
            <div className="h-[6rem] max-w-full border-1">
                <img src={x} alt="" className='h-full w-auto' />
            </div>
        </div>
    )
}

const AudioSingle = () => {
    return (
        <div className="grid grid-cols-[2fr_8fr] w-[15rem] h-[4rem] gap-2 items-center justify-center bg-orange-400 rounded-lg">
            <div className="w-full flex items-center justify-center h-full">
                <FaCirclePlay size={25} cursor="pointer" />
            </div>
            <div className="h-full w-full flex flex-col justify-evenly overflow-hidden px-1">
                <p className="truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm w-full">
                    Be Khayali. By - Arijit Singhk akdjfka adkfj
                </p>
                <div className="flex w-full justify-between flex-col">
                    <div className=' w-full flex text-[13px] justify-between'>
                        <div className="player-timer">1:28</div>
                        <div className="duration">3:01</div>
                    </div>
                    <div className="bg-amber-600 w-full h-2 relative">
                        <div className="h-full w-[50%] bg-amber-800"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Audio = () => {
    return (
        <div className="grid items-center flex-col gap-4 justify-start overflow-y-scroll p-2 " style={{ scrollbarWidth: 'none' }}>
            <AudioSingle />
            <AudioSingle />
            <AudioSingle />
            <AudioSingle />
        </div>
    )
}

const FindChat = () => {

    const [medType, setMedType] = useState<string>('photo');

    return (
        <section className="h-full flex flex-col items-center w-full">
            <section className="w-[90%] h-[98%] py-2 gap-5 flex flex-col justify-center items-center">
                <section className={`bg-slate-700 rounded-md overflow-hidden w-full min-h-[3rem] h-[30%] grid items-center justify-center grid-cols-5 `}>
                    <div className={`w-full h-full ${medType === "photo" ? "" : "bg-slate-800"} border-r-1 border-r-amber-50  flex items-center text-center justify-center`} onClick={() => setMedType('photo')}>Photos</div>
                    <div className={`w-full h-full ${medType === "gif" ? "" : "bg-slate-800"} border-r-1 border-r-amber-50  flex items-center text-center justify-center`} onClick={() => setMedType('gif')}>Gifs</div>
                    <div className={`w-full h-full ${medType === "video" ? "" : "bg-slate-800"} border-r-1 border-r-amber-50  flex items-center text-center justify-center`} onClick={() => setMedType('video')}>Videos</div>
                    <div className={`w-full h-full ${medType === "audio" ? "" : "bg-slate-800"} border-r-1 border-r-amber-50  flex items-center text-center justify-center`} onClick={() => setMedType('audio')}>Audio</div>
                    <div className={`w-full h-full ${medType === "docs" ? "" : "bg-slate-800"} flex items-center text-center justify-center`} onClick={() => setMedType('docs')}>Docs</div>
                </section>
                <section className="bg-slate-700 rounded-md w-full min-h-[80vh] text-center overflow-hidden" style={{ scrollbarWidth: 'none' }}>
                    {/* <Media /> */}
                    <Audio />
                </section>
            </section>
        </section>
    )
}

export default FindChat