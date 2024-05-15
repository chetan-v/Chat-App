import React, { useRef, useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling

const ChatSection = ({ receiver_id, sender_id, socket, name }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // console.log("Adding user to socket:", sender_id);
    socket?.emit("addUser", sender_id);

    socket?.on("getUsers", (users) => {
      // console.log("Active users", users);
    });

    // Listen for incoming messages and update the chat state
    socket?.on("getMessage", (data) => {
      // console.log("Received message:", data);
      if (
        (data.receiver_id === receiver_id && data.sender_id === sender_id) ||
        (data.receiver_id === sender_id && data.sender_id === receiver_id)
      ) {
        setChat((prevChat) => [
          ...prevChat,
          { senderId: data.sender_id, msg: data.msg },
        ]);
      }
    });

    return () => {
      if (socket) {
        // console.log("Cleaning up socket listeners");
        socket.off("getMessage");
      }
    };
  }, [socket, receiver_id, sender_id]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when chat updates
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chat]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log(
      "Sending message:",
      message,
      "from:",
      sender_id,
      "to:",
      receiver_id
    );
    socket?.emit("sendMessage", {
      sender_id,
      receiver_id,
      msg: message,
    });

    setChat((prevChat) => [...prevChat, { senderId: sender_id, msg: message }]);
    setMessage("");

    const body = {
      receiver_id,
      msg: message,
    };
    const response = await fetch("http://localhost:5000/createchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (response.status !== 200) {
      console.log("Something went wrong");
    }
  };

  const getChats = async () => {
    const body = {
      receiver_id,
    };
    const response = await fetch("http://localhost:5000/fetchchats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (response.status === 200) {
      const data = await response.json();
      setChat(data.list);
    } else {
      console.log("something Wrong");
    }
  };

  useEffect(() => {
    setChat([]);
    if (receiver_id) {
      getChats();
    }
  }, [receiver_id]);

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
