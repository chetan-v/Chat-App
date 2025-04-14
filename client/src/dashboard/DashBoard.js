import React, { useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling
import { useNavigate } from "react-router-dom";
import ChatSection from "./ChatSection";
import CreateGroup from "./CreateGroup";
import GroupFetch from "./GroupFetch";

const DashBoard = (socket) => {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [list, setList] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const [chatUserId, setChatUserId] = useState(false);
  const [GroupChatUserId, setGroupChatUserId] = useState(false);
  const [sender_id, setSender_id] = useState("");
  const [groupList, setGroupList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.Status === "success") {
          setAuth(true);
          setName(data.name);
          setEmail(data.email);
          setSender_id(data.user_id);
        } else {
          setErrorMessage(data.message);
        }
      } catch (error) {
        console.error(error);
        // Handle other errors here
      } finally {
        setLoading(false); // Update loading state
      }
    };
    getDashboard();
  }, []);

  useEffect(() => {
    if (!loading && !auth) {
      navigate("/");
    }
  }, [auth, loading, navigate]);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        window.location = "/";
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };

  const getList = async () => {
    try {
      const response = await fetch("/api/user/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.Status === "success") {
        setList(data.list);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const handleChat = (user_id) => {
    setChatUserId(user_id);
    setGroupChatUserId(false);
    setReceiverName(list.find((item) => item._id === user_id).name);
  };

  const getGroupList = async () => {
    try {
      const response = await fetch("/api/group/groupList", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (data.Status === "success") {
        setGroupList(data.list);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };

  useEffect(() => {
    getGroupList();
  }, []);

  const handleGroupChat = (group_id) => {
    setGroupChatUserId(group_id);
    setChatUserId(false);
    setReceiverName(groupList.find((item) => item._id === group_id).groupName);
  };

  return !loading && auth ? (
    <div className="dashboard">
      <div className="left-block">
        <div className="header">
          <h1>{name}</h1>
          <button className="logout-button" onClick={handleLogOut}>
            Logout
          </button>
        </div>
        <div>
          <CreateGroup
            key={sender_id}
            emailOfCreater={email}
            _idOfCreator={sender_id}
          />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>All users</th>
              </tr>
            </thead>
            <tbody>
              {list
                .filter((item) => item.email !== email)
                .map((item, index) => (
                  <tr key={index}>
                    <td onClick={() => handleChat(item._id)}>{item.name}</td>
                  </tr>
                ))}
            </tbody>
            {/* this is group section */}
            <thead>
              <tr>
                <th>Groups</th>
              </tr>
            </thead>
            <tbody>
              {groupList
                .filter((item) => item.email !== email)
                .map((item, index) => (
                  <tr key={index}>
                    <td onClick={() => handleGroupChat(item._id)}>
                      {item.groupName}
                    </td>
                  </tr>
                ))}
            </tbody>
            {/* <GroupFetch /> */}
          </table>
        </div>
      </div>
      <div className="right-block">
        {chatUserId && (
          <ChatSection
            receiver_id={chatUserId}
            name={receiverName}
            sender_id={sender_id}
            socket={socket.socket}
          />
        )}
        {GroupChatUserId && (
          <ChatSection
            receiver_id={GroupChatUserId}
            name={receiverName}
            sender_id={sender_id}
            groupAuth={true}
          />
        )}
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default DashBoard;
