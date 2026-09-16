import { ChatArea } from "./subComponents/Chat"
import { ContactList } from "./subComponents/Contact"

function Home() {
    return (
        <section className="w-screen h-screen overflow-hidden flex justify-center md:grid md:grid-cols-[3.8fr_6.2fr] lg:grid-cols-[3fr_7fr] bg-[var(--c-app-bg)] text-[var(--c-text-primary)] transition-colors duration-300">
            <ContactList />
            <ChatArea />
        </section>
    )
}

export default Home
