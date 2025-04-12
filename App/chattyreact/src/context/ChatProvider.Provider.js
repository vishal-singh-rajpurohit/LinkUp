import { useEffect, useMemo, useState } from "react";
import ChatContext from "./ChatContext.context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const ChatProvider = ({ children }) => {
  const ChatEventEnum = Object({
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    JOIN_CHAT_EVENT: "joinChat",
    LEAVE_CHAT_EVENT: "leaveChat",
    UPDATE_GROUP_NAME: "updateGroupName",
    MESSAGE_RECIVED_EVENT: "messageRecieved",
    MESSAGE_UNDO_EVENT: "messageUndo",
    NEW_CHAT_EVENT: "newChat",
    SOCKET_EVENT_ERROR: "socketError",
    STOP_TYPING_EVENT: "stopTyping",
    TYPING_EVENT: "typing",
    MESSAGE_DELETE_EVENT: "messageDeleted",
    SOCKET_ERROR_EVENT: "socketError",
  });

  const navigator = useNavigate();

  /**
   * @description Shift letter to the Redux store
   */
  const [loggedIn, setLoggedIn] = useState(false);
  const [chatMode, setChatMode] = useState("oneOnOne");

  /**
   * @description The Variables to shift in Redux Toolkit
   */
  // User Profile
  const [theme, setTheme] = useState(true);
  const [showTyping, setShowTyping] = useState(true);
  const [showOnline, setShowOnline] = useState(true);

  // User Details
  const [user, setUser] = useState({}); //user is an object of user details
  const [userContacts, setUserContacts] = useState([]);
  const [userGroupChats, setUserGroupChats] = useState([]);
  const [userSecuredChat, setUserSecuredChat] = useState([]);

  /**
   * @description Temprary States
   * @default ""
   */
  // Chats and Modes
  const [openSelectDocs, setSelectDocs] = useState(false);
  const [canMessageInChat, setCanMessageInChat] = useState(true);
  const [message, setMessage] = useState("");
  const [messagesArr, setMessagesArr] = useState([]);

  // Temprary
  const [tempId, setTempId] = useState("");
  const [tempName, setTempName] = useState("");
  const [openGroupCreate, setOpenGroupCreate] = useState(false);
  const [openOneOnOneModal, setOpenOneOnOneModal] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNav, setOpenNav] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResut, setSearchResult] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedContact, setSelectedContact] = useState({});

  /*---------------------------------------------------------------------------METHODS---------------------------------------------------------------------------*/

  /**
   * @description if already logged in (check for access token)
   */
  const alreadyLoggedIn = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/user/check-user-already-loggedin`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setLoggedIn(true);
      setUser(response.data.data.User);
      localStorage.setItem("accessToken", response.data.data.accessToken);
      getChatHistory();
    } catch (error) {
      // console.log("User does not existe ", error);
    }
  };

  /**
   * @description fetching the all chats history after log in
   *
   */

  const getChatHistory = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/user/get-chat-history`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Chat histoy found: ", response);
      setUserContacts(response.data.data.contact_history.one_on_one_chats);
      setUserGroupChats(response.data.data.contact_history.group_chats);
      setUserSecuredChat(response.data.data.contact_history.secured_contacts);

      userContacts.map((chat) => {
        if (chat.contact_det.isGroup) {
          if (!userGroupChats.includes(chat)) {
            setUserGroupChats([...userGroupChats, chat]);
            console.log(
              "userGroupChats: ",
              userGroupChats,
              chat.contact_det.groupName
            );
          }
        }
      });
    } catch (error) {
      // console.log("Error while fetching chat history ");
    }
  };

  const selectedTalks = (contactId, contactType = chatMode) => {
    if (contactType === "oneOnOne") {
      userContacts.forEach((user) => {
        if (user.contact_det._id === contactId) {
          // console.log("user 1 1", user.contact_det._id === contactId);
          setSelectedContact({
            userName: user.contact_name,
            avatar: user.contact_det.avatar,
            _id: user.contact_det._id,
            searchTag: user.chat_members.searchTag,
            isOnline: user.contact_det.isOnline,
          });
          joinRoom(user.contact_det._id);
        }
      });
    } else if (contactType === "groupChat") {
      userGroupChats.forEach((user) => {
        if (user.contact_det._id === contactId) {
          // console.log("group : ", user.contact_det._id);
          setSelectedContact({
            userName: user.contact_det.groupName,
            avatar: user.contact_det.avatar || null,
            _id: user.contact_det._id,
            searchTag: "group",
            isOnline: "group",
          });
          joinRoom(user.contact_det._id);
        }
      });
    } else {
      userSecuredChat.forEach((user) => {
        if (user.contact_det._id === contactId) {
          // console.log("user secure", user.contact_det._id === contactId);
          setSelectedContact({
            userName: user.contact_name,
            avatar: user.contact_det.avatar,
            _id: user.contact_det._id,
            searchTag: user.chat_members.searchTag,
            isOnline: user.contact_det.isOnline,
          });
          joinRoom(user.contact_det._id);
        }
      });
    }

    fetchPresentChat(contactId);
  };

  const fetchPresentChat = async (contactId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/get-present-chats`,
        {
          contactId: contactId,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Chats fetchd: ", response);
      setMessagesArr(response.data.data.chats);

      if (window.innerWidth < 700) {
        navigator("/");
      }
    } catch (error) {
      // console.log("Error in fetching chats: ", error);
      setMessagesArr([]);
    }
  };

  /**
   * @description Select to an user to talk
   * @param reciverId
   */
  const selectToTalk = (reciverId) => {
    setSelectedContact(reciverId);
  };

  /**
   * @description create new contact for one on one chat
   */
  const saveContact = async (tempId) => {
    // console.log("temp id: ".tempId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/save-contact`,
        {
          reciverId: tempId,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      selectedTalks(response.data.data.newContact._id);
      getChatHistory();
      search();
      setTempId("");
      setTempName("");
      // console.log("Saved: ", response);
    } catch (error) {
      console.log("Error while saving contact ", error);
    }
  };

  /**
   * @description Search for contacts, both functions search for users and search2() for search for group chats
   */
  const search = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/contact/search`,
        {
          searchKeyword: searchKeyword,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      // console.log("Search executed: ", response);
      setSearchResult(response.data.data.Contacts);

      if (window.innerWidth < 700) {
        navigator("/contact");
      }
    } catch (error) {
      setIsSearching(false);
      console.log("Error while searching contact: ", error);
    }
  };

  // Executed while changing searchKeyword

  useEffect(() => {
    // console.log("Search Result: ", searchResut);
    if (searchKeyword.length < 3) {
      setIsSearching(false);
    } else {
      setIsSearching(true);
      search();
    }
  }, [searchKeyword]);

  const search2 = async (searchKeyword, setOutput) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/contact/search`,
        {
          searchKeyword: searchKeyword,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      // console.log("Search executed: ", response);
      setOutput(response.data.data.Contacts);

      if (window.innerWidth < 700) {
        navigator("/contact");
      }
    } catch (error) {
      setIsSearching(false);
      console.log("Error while searching contact: ", error);
    }
  };

  /**
   * @description addToContact is Save contact add in contact or group
   */
  function addToContact(contactId, userName) {
    setTempId(contactId);
    setTempName(userName);
    setOpenOneOnOneModal(true);
  }

  /**
   * @description Send Message Function
   * @param <reciverId, Message>
   */

  const sendMessage = async (message, contactId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/send-msg`,
        {
          message: message,
          contactId: contactId,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage("");
      // setMessagesArr([...messagesArr, response.data.data.newMessage[0]]);
      console.log("Message sent: ", response.data.data.newMessage);
    } catch (error) {
      console.log("Error in sending message: ", error);
    }
  };

  /**
   * @description De;ete Message Function
   * @param <reciverId, ChatId>
   */

  const deleteMessage = async (messageId, contactId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/undo-msg`,
        {
          messageId: messageId,
          contactId: contactId,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Message deleted: ", response.data.data);
    } catch (error) {
      console.log("Error in Undo message: ", error);
    }
  };

  // Socket io ----------------------------------------------------------------

  const socket = useMemo(() => {
    const newSocket = io("http://localhost:5000", {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    return newSocket;
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;

    // Connect the socket
    socket.connect();

    // Basic connection confirmation
    socket.on("connect", () => {
      console.log("Connected to the socket with ID:", socket.id);
    });

    // Listen for the 'joinedRoom' event to confirm room join
    socket.on("joinedRoom", (roomId) => {
      console.log("User joined room:", roomId);
    });

    // Listen for 'message' event to get messages from the room
    socket.on("message", (payload) => {
      console.log("Message from room:", payload);
    });

    const handleMessageReceived = (payload) => {
      setMessagesArr((prevMessages) => [...prevMessages, payload]);
    };

    const handleUndoMessage = (payload) => {
      setMessagesArr((prev) =>
        prev.filter((message) => message._id !== payload._id)
      );

      // setMessagesArr(updatedArr);
      console.log("Message deleted: ", payload);

      setTimeout(() => {
        console.log("update chats: ", messagesArr);
      }, 2000);
    };

    socket.on("messageUndo", handleUndoMessage);

    socket.on("messageRecieved", handleMessageReceived);

    return () => {
      // Clean up
      socket.off("connect");
      socket.off("joinedRoom");
      socket.off(ChatEventEnum.MESSAGE_RECIVED_EVENT, handleMessageReceived);
      socket.off(ChatEventEnum.MESSAGE_UNDO_EVENT, handleUndoMessage);
      socket.disconnect();
    };
  }, [socket, loggedIn]);

  const joinRoom = (roomId) => {
    socket.emit("joinRoom", { roomId: roomId });
  };

  // Socket io-------------------------------

  /**
   * @description checking first time while opening the app alreadyLoggedIn()
   */
  useEffect(() => {
    alreadyLoggedIn();
  }, []);

  const data = {
    // UIs
    openNav,
    setOpenNav,
    editMode,
    setEditMode,
    // Toolkits redux
    loggedIn,
    setLoggedIn,
    user,
    setUser,
    userContacts,
    userSecuredChat,
    userGroupChats,
    setUserGroupChats,
    openOneOnOneModal,
    setOpenOneOnOneModal,
    tempId,
    setTempId,
    tempName,
    setTempName,
    chatMode,
    setChatMode,
    openGroupCreate,
    setOpenGroupCreate,
    addToContact,
    // Searchings
    isSearching,
    setIsSearching,
    searchResut,
    setSearchResult,
    searchKeyword,
    setSearchKeyword,
    search2,
    // theme and settings
    theme,
    setTheme,
    showTyping,
    setShowTyping,
    showOnline,
    setShowOnline,
    openProfile,
    setOpenProfile,
    // Current Chat Settings
    canMessageInChat,
    setCanMessageInChat,
    message,
    setMessage,
    // Chat Modes
    openSelectDocs,
    setSelectDocs,
    selectedContact,
    messagesArr,
    setMessagesArr,
    // Navigator
    navigator,
    // METHODS
    getChatHistory,
    selectedTalks,
    saveContact,
    selectToTalk,

    // SEND MESSAGE
    sendMessage,
    deleteMessage,
  };
  return <ChatContext.Provider value={data}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
