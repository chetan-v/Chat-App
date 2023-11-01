import React, { useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling
import {io} from "socket.io-client";

const ChatSection = (SR_ids) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    setSocket(io("http://localhost:5001"));
      return () => {
      if (socket) {
        socket.disconnect();
      }
    };

  }, []);
  
  
  useEffect(() => {
    socket?.emit("addUser", SR_ids.sender_id);
    socket?.on("getUsers", (users) => {
      console.log("Active users", users);
    });
    
   
    // Listen for incoming messages and update the chat state
    socket?.on("getMessage", (data) => {
      console.log(data);
      setChat([...chat, { receiver_id: data.receiver, msg: data.msg }]);
      });
        
      return () => {
      if (socket) {
        socket.off("getMessage");
      }
      };
  }, [socket, chat, SR_ids.sender_id]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const handleChat = async (e) => {
    e.preventDefault();
    socket?.emit("sendMessage", {
      sender_id: SR_ids.sender_id,
      receiver_id: SR_ids.receiver_id,
      msg: message,
    });
    setMessage("");
    const body = {
      receiver_id: SR_ids.receiver_id ,
      msg: message,
    };
    if (!message) {
      return;
    }
    const response = await fetch("http://localhost:5000/createchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (response.status === 200) {
      // Add the sent message to the chat state
      setChat([...chat, { receiver_id: SR_ids.receiver_id, msg: message }]);
       // Clear the message input field
    } else {
      console.log("Something went wrong");
    }
  };
  const getChats = async () => {
    const body = {
      receiver_id: SR_ids.receiver_id,
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

      console.log(data);
    } else {
      console.log("something Wrong");
    }
  };
  useEffect(() => {
    if (SR_ids.receiver_id) {
      getChats();
    }
  }, [SR_ids.receiver_id]);

  return (
    <div className="chat-box">
      <div className="chat-screen">
        <div className="chat-header">
          <h1>{SR_ids.name}</h1>
        </div>
        {chat.map((item, index) => (
  <div
    className={`message ${
      item.receiver_id === SR_ids.receiver_id ? "sent" : "received"
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
