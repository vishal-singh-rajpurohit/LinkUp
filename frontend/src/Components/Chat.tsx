import { ChatTop, MailBox } from "./subComponents/Chat"

const Contacts = () => {

  return (
    <>
      
      <section className="w-full h-[100vh] flex items-center justify-center">
        <section className="flex flex-col gap-[1rem] items-center pt-2 w-[90%] h-[98%] rounded-lg">
          <ChatTop />
          <MailBox />
        </section>
      </section>
    </>
  )
}

export default Contacts