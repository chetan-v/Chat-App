import Modal from "react-modal";
import React, { useState, useEffect } from "react";
const GroupChatSection = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   const response = await fetch("http://localhost:5000/update", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     credentials: "include",
    //     body: JSON.stringify({ name, email }),
    //   });
    //   response.json().then((data) => {
    //     if (data.Status === "success") {
    //       setName(data.name);
    //       setEmail(data.email);
    //       setModalIsOpen(false);
    //     } else {
    //       setErrorMessage(data.message);
    //     }
    //   });
    // } catch (error) {
    //   console.error(error);
    //   // Handle other errors here
    // }
  };
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
    >
      <h2>Enter Your Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" />
        </div>
        <button type="submit">Submit</button>
      </form>
      <button onClick={closeModal}>Close</button>
    </Modal>
  );
};
export default GroupChatSection;
