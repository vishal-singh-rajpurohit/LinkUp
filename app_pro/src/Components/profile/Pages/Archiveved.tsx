import { IoArchiveSharp } from "react-icons/io5"
import { ContactItem } from "../../subComponents/Contact"

const Archiveved = () => {
    return (
        <section className="w-full h-full overflow-y-auto flex justify-center rounded-sm">
            <section className="w-[90%] h-full bg-slate-800 flex  flex-col gap-2 rounded-md mt-3 md:w-[98%]">
                <section className="w-full h-[15%] bg-slate-900 flex gap-2 items-center justify-center px-3 py-4">
                    <div className="">
                        <IoArchiveSharp size={40} cursor={'pointer'} />
                    </div>
                    <div className="">
                        <h1 className="text-2xl font-bold">Archved Friends</h1>
                    </div>
                </section>
                <section className="h-full">
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                    <ContactItem />
                </section>
            </section>
        </section>
    )
}

export default Archiveved