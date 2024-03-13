import React, { useState, useEffect } from "react";
import "./DashBoard.css"; // Import your CSS file for styling
import { Link } from "react-router-dom";
import ChatSection from "./ChatSection";
const DashBoard = () => {
  const [auth, setAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [list, setList] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const [chatUserId, setChatUserId] = useState(false);
  const [GroupChatUserId, setGroupChatUserId] = useState(false);
  const [sender_id, setSender_id] = useState("");
  const [groupList, setGroupList] = useState([]);
  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        // console.log(response);
        response.json().then((data) => {
          if (data.Status === "success") {
            setAuth(true);
            // console.log(data.user_id);
            setName(data.name);
            setEmail(data.email);
            setSender_id(data.user_id);
          } else {
            setErrorMessage(data.message);
          }
        });
      } catch (error) {
        console.error(error);
        // Handle other errors here
      }
    };
    getDashboard();
  }, []);
  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      response.json().then((data) => {
        if (data.status === "success") {
          window.location = "/login";
          // console.log(data);
        } else {
          setErrorMessage(data.message);
        }
      });
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };
  const getList = async () => {
    try {
      const response = await fetch("http://localhost:5000/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      response.json().then((data) => {
        if (data.Status === "success") {
          // console.log(data);
          setList(data.list);
        } else {
          setErrorMessage(data.message);
        }
      });
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
    //  console.log(user_id);
    setReceiverName(list.find((item) => item.user_id === user_id).name);
  };
  const getGroupList = async () => {
    try {
      const response = await fetch("http://localhost:5000/grouplist", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      response.json().then((data) => {
        if (data.Status === "success") {
          // console.log(data);
          setGroupList(data.list);
        } else {
          setErrorMessage(data.message);
        }
      });
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
    //  console.log(user_id);
    setReceiverName(
      groupList.find((item) => item.group_id === group_id).g_name
    );
  };

  return auth ? (
    <div className="dashboard">
      <div className="left-block">
        <div className="header">
          <h1>{name}</h1>
          <button className="logout-button" onClick={handleLogOut}>
            Logout
          </button>
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
                    <td onClick={() => handleChat(item.user_id)}>
                      {item.name}
                    </td>
                  </tr>
                ))}
            </tbody>
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
                    <td onClick={() => handleGroupChat(item.group_id)}>
                      {item.g_name}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="right-block">
        {chatUserId && (
          <ChatSection
            receiver_id={chatUserId}
            name={receiverName}
            sender_id={sender_id}
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
    <div>
      <h1>Not Authenticated {errorMessage}</h1>
      <Link to="/login"> Login </Link>
    </div>
  );
};

export default DashBoard;
