import React, { useState } from "react";
import "./SignUp.css";
const SignUp = () => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFnameChange = (e) => {
    setFname(e.target.value);
  };

  const handleLnameChange = (e) => {
    setLname(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDobChange = (e) => {
    setDob(e.target.value);
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!fname || !lname || !email || !password || !dob || !gender) {
      alert("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const body = {
        name: fname + " " + lname,
        password: password,
        email: email,
        dob: dob,
        gender: gender,
      };
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      console.log(response.status);
      if (response.status === 409) {
        alert("Email already exists");
      } else if (response.status === 200) {
        alert("Sign Up Successful");
        window.location = "/login";
      } else {
        console.log("Something went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="form-container col-md-6 offset-md-3">
          <h1 className="form-header">Sign Up</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fname">First name</label>
              <input
                type="text"
                className="form-control"
                id="first-name"
                placeholder="Enter your first name"
                value={fname}
                onChange={handleFnameChange}
              />
              <label htmlFor="lname">Last name</label>
              <input
                type="text"
                className="form-control"
                id="last-name"
                placeholder="Enter your last name"
                value={lname}
                onChange={handleLnameChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                id="dob"
                value={dob}
                onChange={handleDobChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                className="form-control"
                id="gender"
                value={gender}
                onChange={handleGenderChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Loading indicator */}
            <div className={`loading-container ${loading ? "" : "hide"}`}>
              <div className="spinner"></div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
