// import React, { useRef, useState, useEffect } from "react";
// import "./DashBoard.css"; // Import your CSS file for styling

// const GroupChatSection = ({ group_id, user_id, socket, groupName }) => {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     socket?.emit("joinGroup", group_id);

//     socket?.on("getGroupMessage", (data) => {
//       if (data.group_id === group_id) {
//         setChat((prevChat) => [
//           ...prevChat,
//           { senderId: data.sender_id, msg: data.msg },
//         ]);
//       }
//     });

//     return () => {
//       if (socket) {
//         socket.off("getGroupMessage");
//       }
//     };
//   }, [socket, group_id]);

//   useEffect(() => {
//     chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//   }, [chat]);

//   const handleMessageChange = (e) => {
//     setMessage(e.target.value);
//   };

//   const handleChat = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     socket?.emit("sendGroupMessage", {
//       sender_id: user_id,
//       group_id,
//       msg: message,
//     });

//     setChat((prevChat) => [...prevChat, { senderId: user_id, msg: message }]);
//     setMessage("");

//     const body = { group_id, msg: message };
//     const response = await fetch("http://localhost:5000/creategroupchat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       credentials: "include",
//     });

//     if (response.status !== 200) {
//       console.log("Something went wrong");
//     }
//   };

//   const getChats = async () => {
//     const body = { group_id };
//     const response = await fetch("http://localhost:5000/fetchgroupchats", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       credentials: "include",
//     });

//     if (response.status === 200) {
//       const data = await response.json();
//       setChat(data.list);
//     } else {
//       console.log("Something went wrong");
//     }
//   };

//   useEffect(() => {
//     setChat([]);
//     if (group_id) {
//       getChats();
//     }
//   }, [group_id]);

//   return (
//     <div className="chat-box">
//       <div className="chat-screen" ref={chatContainerRef}>
//         <div className="chat-header">
//           <h1>{groupName}</h1>
//         </div>
//         {chat.map((item, index) => (
//           <div
//             className={`message ${
//               item.senderId === user_id ? "sent" : "received"
//             }`}
//             key={index}
//           >
//             <div className="message-text">{item.msg}</div>
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleChat}>
//         <div className="input-area">
//           <input
//             type="text"
//             id="message-input"
//             placeholder="Type your message..."
//             value={message}
//             onChange={handleMessageChange}
//             autoComplete="off"
//           />
//           <button id="send-button" type="submit">
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default GroupChatSection;
