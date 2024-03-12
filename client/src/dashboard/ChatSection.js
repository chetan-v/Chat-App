import React, { useRef,useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling
import {io} from "socket.io-client";

const ChatSection = (SR_ids) => {
  const [message, setMessage] = useState("");
  const [deleteWanted, setDeleteWanted] = useState(false);
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
      setMessage("");
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
      setMessage("");
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

      // console.log(data.list);
    } else {
      console.log("something Wrong");
    }
  };
  useEffect(() => {
    if (SR_ids.receiver_id) {
      getChats();
    }
  }, [SR_ids.receiver_id]);

  const deletechat = async (chat_id) => {
       //e.preventDefault();
    const body = {
      chat_id: chat_id,
    };
    const response = await fetch("http://localhost:5000/deletechat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    console.log(response)
    if (response.status === 200) {
      const data = await response.json();
      getChats();
      console.log(data);
    } else {
      console.log("something Wrong");
    }
  }
  const deleteWantedHandler = () => {
    setDeleteWanted(!deleteWanted);
  };
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container when chat updates
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chat]);
  return (
    <div className="chat-box">
      <div className="chat-screen" ref={chatContainerRef}>
        <div className="chat-header">
          <h1>{SR_ids.name}</h1>
          <button onClick={deleteWantedHandler}>Delete Chats</button>
        </div>
        {chat.map((item, index) => (
  <div
    className={`message ${
      item.receiver_id === SR_ids.receiver_id ? "sent" : "received"
    }`}
    key={index}
  >
  
    <div className="message-text">{item.msg}{deleteWanted?<button onClick={()=>deletechat(item.chat_id)} >x</button>:<></>}</div>
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
