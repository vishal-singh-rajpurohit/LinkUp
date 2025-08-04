import { useCallback, useEffect, useMemo, useState } from "react";
import ChatContext from "./ChatContext.context";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import axios from "axios";

import { login, logout } from "../functions/authSlice";
import { contactDiractory, setClearDiractory } from "../functions/contactSlice";
import {
  trueVideoCall,
  falseVideoCall,
  trueAudioCall,
  falseAudioCall,
  callSetIncoming,
  videoCallRequest,
  setPc,
  setSteams,
} from "../functions/callSlice";

import {
  appendRealtimeChat,
  selectContact,
  setChats,
  switchChatType,
  undoRealtimeChat,
} from "../functions/chatSlice";
import { RtcConfiguration } from "../helper/webRTCHelper";

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
    REQUEST_VIDEO_CALL: "requestVideoCall",
    REJECT_VIDEO_CALL: "rejectVideoCall",
    ACCEPT_VIDEO_CALL: "acceptVideoCall",
    CLOSE_VIDEO_CALL: "closeVideoCall",
    REQUEST_AUDIO_CALL: "requestAudioCall",
    ACCEPT_AUDIO_CALL: "acceptAudioCall",
    REJECT_AUDIO_CALL: "rejectAudioCall",
    CLOSE_AUDIO_CALL: "closeAudioCall",
  });

  const reactNavigator = useNavigate();
  const dispatch = useDispatch();

  /**
   * @description Redux states
   */

  // Auth
  let user = useSelector((state) => state.auth.user);
  let loggedIn = useSelector((state) => state.auth.loggedIn);

  // Contacts
  let userContacts = useSelector((state) => state.contacts.oneOnOne);
  let userGroupChats = useSelector((state) => state.contacts.groupChats);
  let userSecuredChat = useSelector((state) => state.contacts.securedChats);

  // Chats
  let chatMode = useSelector((state) => state.chat.chatType);
  let messagesArr = useSelector((state) => state.chat.chats);
  let selectedContact = useSelector((state) => state.chat.selectedContact);

  // Calls and Peers
  let isAudioCall = useSelector((state) => state.call.isAudioCall);
  let isVideoCall = useSelector((state) => state.call.isVideoCall);
  let isCallAccpted = useSelector((state) => state.call.isCallAccpted);
  let reciverDetails = useSelector((state) => state.call.reciverDetails);
  let peerOffer = useSelector((state) => state.call.peerOffer);
  let isIncoming = useSelector((state) => state.call.isIncoming);
  let isCallRequest = useSelector((state) => state.call.isVideoRequestOn);
  const presentCallId = useSelector((state) => state.call.callId);
  const PC = useSelector((state) => state.call.peerConnection);
  const localPc = useMemo(() => new RTCPeerConnection(RtcConfiguration), []);

  // const myStream = useSelector((state) => state.call.myStream);
  // const otherStream = useSelector((state) => state.call.otherStream);

  const [remoteStream, setRemoteStream] = useState(null);
  const [stream, setStream] = useState(null)

  /**
   *
   * @param {reciverId<selectedContact.callerId<mongoose._id>>}
   * @description make video calls
   */

  async function createOffer() {
    // Creating an offer
    const offer = localPc.createOffer();
    // setting description of local system
    await localPc.setLocalDescription(offer);
    return offer;
  }

  async function createAnswerOffer() {
    await localPc.setRemoteDescription(peerOffer);
    const answer = localPc.createAnswer();
    await localPc.setLocalDescription(answer);
    return answer;
  }

  async function setAnswerToRemoteDescription(answer) {
    await localPc.setRemoteDescription(answer);
  }

  async function sendStream(stream) {

    console.log("Present stream is: ", stream)

    const tracks = stream.getTracks();

    for(const track of tracks){
      localPc.addTrack(track, stream)
    }
  }


  const requestVideoCall = async () => {
    dispatch(setPc({ peerConnection: localPc }));

    const offer = await createOffer();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/call/request-video-call`,
        {
          reciverId: selectedContact.callerId,
          contactId: selectedContact._id,
          Offer: offer,
        },
        {
          withCredentials: true,
        }
      );

      console.log("response video call request: ", response);
      dispatch(
        callSetIncoming({
          callerType: false,
          CallId: response.data.data.CallId,
          isCallOn: true,
        })
      );
      selectedTalks(response.data.data.ContactId);
    } catch (error) {
      console.log("Rejected");
      console.log("Error while requesting video call: ", error);
    }
  };

  const answerVideoCall = async () => {
    const answer = await createAnswerOffer();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/call/ans-video-call`,
        {
          callId: presentCallId,
          answer: answer,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log("Error in answer Call");
    }
  };

  const declineVideoCall = async () => {
    console.log("Video Call declined: ", presentCallId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_CHAT_API}/chat/call/decline-video-call`,
        {
          callId: presentCallId,
        },
        {
          withCredentials: true,
        }
      );
      dispatch(
        callSetIncoming({ callerType: false, CallId: null, isCallOn: false })
      );
      console.log("Video call rejected");
    } catch (error) {
      console.log("Error while decline error: ", error);
    }
  };

  const setChatMode = (chatType) => {
    dispatch(switchChatType({ chatType: chatType }));
  };

  /**
   * @description Temprary States
   * @default ""
   */
  // Chats and Modes
  const [openSelectDocs, setSelectDocs] = useState(false);
  const [canMessageInChat, setCanMessageInChat] = useState(true);
  const [message, setMessage] = useState("");

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

      dispatch(
        login({
          loggedIn: true,
          user: response.data.data.User,
        })
      );

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

      dispatch(
        contactDiractory({
          oneOnOne: response.data.data.contact_history.one_on_one_chats,
          groupChats: response.data.data.contact_history.group_chats,
          securedChats: response.data.data.contact_history.secured_contacts,
        })
      );
    } catch (error) {
      // console.log("Error while fetching chat history ");
    }
  };

  const selectedTalks = (contactId, nn = false, contactType = chatMode) => {
    if (nn) {
      dispatch(
        selectContact({
          user,
          nn,
        })
      );
      joinRoom("1234");
    } else if (contactType === "oneOnOne") {
      console.log("Selected to talk: => ", contactId);
      userContacts.forEach((user) => {
        if (user.contact_det._id === contactId) {
          dispatch(
            selectContact({
              user,
            })
          );
          joinRoom(user.contact_det._id);
        }
      });
    } else if (contactType === "groupChat") {
      userGroupChats.forEach((user) => {
        if (user.contact_det._id === contactId) {
          dispatch(
            selectContact({
              user,
            })
          );
          joinRoom(user.contact_det._id);
        }
      });
    } else {
      userSecuredChat.forEach((user) => {
        if (user.contact_det._id === contactId) {
          dispatch(
            selectContact({
              user,
            })
          );
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
      console.log("Chats fetchd: ", response.data);
      // setMessagesArr(response.data.data.chats);
      dispatch(
        setChats({
          chats: response.data.data.chats,
        })
      );

      if (window.innerWidth < 700) {
        reactNavigator("/");
      }
    } catch (error) {
      // console.log("Error in fetching chats: ", error);
      dispatch(
        setChats({
          chats: [],
        })
      );
    }
  };

  /**
   * @description Select to an user to talk
   * @param reciverId
   */

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
        reactNavigator("/contact");
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
      console.log("Search executed 2: ", response);
      setOutput(response.data.data.Contacts);

      if (window.innerWidth < 700) {
        reactNavigator("/contact");
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
    socket.on("message", (payload) => {});

    const handleMessageReceived = (payload) => {
      dispatch(
        appendRealtimeChat({
          payload: payload,
        })
      );
    };

    const handleUndoMessage = (payload) => {
      dispatch(
        undoRealtimeChat({
          payload: payload,
        })
      );
      setTimeout(() => {
        console.log("update chats: ", messagesArr);
      }, 2000);
    };

    socket.on("messageUndo", handleUndoMessage);
    socket.on("messageRecieved", handleMessageReceived);

    const handleIncomingVideoCall = ({ UserId, ContactId, Message, Offer, CallId,}) => {
      let incomingBool = UserId === user._id ? false : true;
      dispatch(
        callSetIncoming({
          callerType: incomingBool,
          CallId: CallId || "nego",
          Offer: Offer,
          isCallOn: true,
        })
      );
      selectedTalks(ContactId);
    };

    const handleDeclineVideoCall = () => {
      dispatch(
        callSetIncoming({ callerType: false, CallId: null, isCallOn: false })
      );
      selectedTalks(null, true);
      if (window.innerWidth > 700) {
        setOpenNav(true);
      } else {
        if (!selectedContact.userName) {
          reactNavigator("/contact");
          setOpenNav(true);
        }
      }
    };

    const handleAnsweredVideoCall = async ({ senderId, answer }) => {
      console.log("Video call answered")
      if (senderId === user._id) {
        console.log("I accpted the call")
        reactNavigator('/call/videocall')
        return;
      } else {
        console.log("I am the call sender")
        await setAnswerToRemoteDescription(answer);
        reactNavigator('/call/videocall')
      }
      
    };

    socket.on(ChatEventEnum.REQUEST_VIDEO_CALL, handleIncomingVideoCall);
    socket.on(ChatEventEnum.REJECT_VIDEO_CALL, handleDeclineVideoCall);
    socket.on(ChatEventEnum.ACCEPT_VIDEO_CALL, handleAnsweredVideoCall);

    return () => {
      // Clean up
      socket.off("connect");
      socket.off("joinedRoom");
      socket.off(ChatEventEnum.MESSAGE_RECIVED_EVENT, handleMessageReceived);
      socket.off(ChatEventEnum.MESSAGE_UNDO_EVENT, handleUndoMessage);
      socket.off(ChatEventEnum.REQUEST_VIDEO_CALL, handleIncomingVideoCall);
      socket.off(ChatEventEnum.REJECT_VIDEO_CALL, handleDeclineVideoCall);
      socket.off(ChatEventEnum.ACCEPT_VIDEO_CALL, handleAnsweredVideoCall);
      socket.disconnect();
    };
  }, [socket, loggedIn]);



  const handleCallingTracks = (event) =>{
    console.log("Calling track")
    const stream = event.streams;
    setRemoteStream(stream[0])
  }

  const handleNegotiation = (event) =>{

  }

  useEffect(()=>{
    localPc.addEventListener('track', handleCallingTracks);
    localPc.addEventListener('negotiationneeded', handleNegotiation);

    return() =>{
      localPc.removeEventListener('track', handleCallingTracks)
      localPc.removeEventListener('negotiationneeded', handleNegotiation);
    }
  }, [localPc])

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
    dispatch,
    reactNavigator,
    // UIs
    openNav,
    setOpenNav,
    editMode,
    setEditMode,
    setStream,
    // Toolkits redux
    loggedIn,
    // setLoggedIn,
    user,
    // setUser,
    userContacts,
    userSecuredChat,
    userGroupChats,
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
    theme: user.theme,
    // setTheme,
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
    // reactNavigator
    reactNavigator,
    // METHODS
    getChatHistory,
    selectedTalks,
    saveContact,

    // SEND MESSAGE
    sendMessage,
    deleteMessage,

    // Calling states
    createOffer,
    isIncoming,
    isCallRequest,
    myStream: stream,
    otherStream: remoteStream,
    declineVideoCall,
    localPc,
    remoteStream,
    // Calling Methods
    requestVideoCall,
    answerVideoCall,
    presentCallId,
    // getUserMediaStream,
    sendStream
  };

  return <ChatContext.Provider value={data}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
