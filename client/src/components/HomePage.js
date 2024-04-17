import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./HomePage.css";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        email: email,
        password: password,
      };
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      response.json().then((data) => {
        if (data.status === "success") {
          window.location = "/";
          console.log(data);
        } else {
          setErrorMessage(data.message);
        }
      });
    } catch (error) {
      console.error(error);
      // Handle other errors here
    }
  };

  return (
    <div className="homepage-container">
      <header className="header">
        <h1>Welcome to ChatNext</h1>
      </header>

      <main className="main-content">
        <section className="login-section">
          <h2>Log In</h2>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label className="label p-2">
                <span className="text-base label-text">Email</span>
              </label>
              <input
                type="text"
                placeholder="Enter email"
                className="w-full input input-bordered h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="text-base label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full input input-bordered h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button className="btn btn-primary">
                {/* {loading ? (
                  <span className="loading loading-spinner "></span>
                ) : (
                  "Login"
                )} */}
                login
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
