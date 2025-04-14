import React, { Fragment } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import DashBoard from "./dashboard/DashBoard";
import HomePage from "./components/HomePage";
import { io } from "socket.io-client";
function App() {
  const socket = io("http://localhost:5000");
  return (
    <Router>
      <Fragment>
        <div className="container">
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<DashBoard socket={socket} />} />
          </Routes>
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
