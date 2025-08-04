import { ChatArea } from "./subComponents/Chat"
import { ContactList } from "./subComponents/Contact"


function Home() {
    return (
        <section className="w-[100vw] h-[100vh] overflow-y-auto flex justify-center md:grid md:grid-cols-[4fr_6fr] lg:grid-cols-[3fr_7fr]">
            <ContactList />
            <ChatArea />
        </section>
    )
}

export default Home
