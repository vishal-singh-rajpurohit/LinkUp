import { CiMenuKebab } from "react-icons/ci"
import g from '../../assets/react.svg'
import { useEffect, useRef } from "react"


export const Mail = ({ mailOptions }: { mailOptions: React.RefObject<HTMLDivElement | null> }) => {

  const currMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const currMessageEl = currMessageRef.current;

    if (currMessageEl) {
      const handleClick = (e: MouseEvent) => {
        if (mailOptions.current) {
          mailOptions.current.style.display = 'flex'
          mailOptions.current.style.top = `${e.clientY}px`
          mailOptions.current.style.left = `${e.clientX}px`
          mailOptions.current.addEventListener('mouseleave', () => {
            if (mailOptions.current) mailOptions.current.style.display = 'none';
          })
        }
      };

      currMessageEl.addEventListener('click', handleClick);
      return () => {
        currMessageEl.removeEventListener('click', handleClick);
      };
    }
  }, []);

  // for sent messaes => bg-[#00F0FF] text-[#0F172A]
  return (
    <div className={`flex gap-2 text-white`}>
      <div className="">
        <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="min-h-6 max-w-[80%]">
        <div className="bg-[#334155] text-[#F8FAFC] p-1 rounded-md ">Jai Shree Ram</div>
        <div className="">
          <div>12:02 pm</div>
        </div>
      </div>
      <div ref={currMessageRef} className="hidden md:flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
    </div>
  )
}

export const MailMenu = ({ mailRef }: { mailRef: React.RefObject<HTMLDivElement | null> }) => {
  return (
    // <section className="fixed flex items-center justify-center w-full">
    <section ref={mailRef} id="message-options" className="absolute hidden flex-col items-center justify-center gap-1 px-2 rounded-sm max-w-max h-[4.5rem] text-[12px] text-blue-100 bg-slate-700">
      <div className="cursor-pointer">forward to</div>
      <div className="cursor-pointer">delete for me</div>
      <div className="cursor-pointer">delete for everyone</div>
      {/* <div className="cursor-pointer">cancel</div> */}
    </section>
  )
}