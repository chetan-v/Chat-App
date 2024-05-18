import React, { useRef, useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling

const ChatSection = ({
  receiver_id,
  sender_id,
  socket,
  name,
  group_id,
  groupAuth,
}) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatContainerRef = useRef(null);
  const isGroupChat = groupAuth && group_id;

  useEffect(() => {
    // Add user to socket connection
    socket?.emit("addUser", sender_id);

    socket?.on("getUsers", (users) => {
      // Handle active users if needed
    });

    // Listen for incoming messages and update the chat state
    socket?.on("getMessage", (data) => {
      if (isGroupChat) {
        if (data.group_id === group_id) {
          setChat((prevChat) => [
            ...prevChat,
            { senderId: data.sender_id, msg: data.msg },
          ]);
        }
      } else {
        if (
          (data.receiver_id === receiver_id && data.sender_id === sender_id) ||
          (data.receiver_id === sender_id && data.sender_id === receiver_id)
        ) {
          setChat((prevChat) => [
            ...prevChat,
            { senderId: data.sender_id, msg: data.msg },
          ]);
        }
      }
    });

    return () => {
      if (socket) {
        socket.off("getMessage");
      }
    };
  }, [socket, receiver_id, sender_id, group_id, isGroupChat]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when chat updates
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      sender_id,
      msg: message,
    };

    if (isGroupChat) {
      messageData.group_id = group_id;
    } else {
      messageData.receiver_id = receiver_id;
    }

    socket?.emit("sendMessage", messageData);

    setChat((prevChat) => [...prevChat, { senderId: sender_id, msg: message }]);
    setMessage("");

    const response = await fetch("/api/chats/createchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
      credentials: "include",
    });

    if (response.status !== 200) {
      console.log("Something went wrong");
    }
  };

  const getChats = async () => {
    const body = isGroupChat ? { group_id } : { receiver_id };
    const response = await fetch("/api/chats/fetchchats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (response.status === 200) {
      const data = await response.json();
      setChat(data.list);
    } else {
      console.log("Something went wrong");
    }
  };

  useEffect(() => {
    setChat([]);
    if (receiver_id || group_id) {
      getChats();
    }
  }, [receiver_id, group_id]);

  return (
    <div className="chat-box">
      <div className="chat-screen" ref={chatContainerRef}>
        <div className="chat-header">
          <h1>{name}</h1>
        </div>
        {chat.map((item, index) => (
          <div
            className={`message ${
              item.senderId === sender_id ? "sent" : "received"
            }`}
            key={index}
          >
            <div className="message-text">{item.msg}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChat}>
        <div className="input-area">
          <input
            type="text"
            id="message-input"
            placeholder="Type your message..."
            value={message}
            onChange={handleMessageChange}
            autoComplete="off"
          />
          <button id="send-button" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;
