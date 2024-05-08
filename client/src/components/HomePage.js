import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const sighUp = () => {
    window.location = "/signup";
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const body = {
        email: email,
        password: password,
      };
      console.log(body);
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (response.status === 401) {
        alert("Invalid credentials");
        return;
      }
      response.json().then((data) => {
        if (data.status === "success") {
          window.location = "/";
          console.log(data);
        } else {
          setErrorMessage(data.message);
        }
      });
    } catch (error) {
      console.error(errorMessage);
      // Handle other errors here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6 col-sm-12 sidenav">
          <div className="login-main-text">
            <h2>
              Application
              <br />
              Login Page
            </h2>
            <p>Login or register from here to access.</p>
          </div>
        </div>
        <div className="col-md-6 col-sm-12 main">
          <div className="login-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="User Name"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className={`loading-container ${loading ? "" : "hide"}`}>
                <div className="spinner"></div>
              </div>

              <button type="submit" className="btn btn-black">
                Login
              </button>
              <button
                onClick={sighUp}
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
