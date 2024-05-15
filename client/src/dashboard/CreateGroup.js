import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

function CreateGroup({ emailOfCreater, _idOfCreator }) {
  const [show, setShow] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  // console.log(groupName, selectedMembers);
  useEffect(() => {
    // Simulate fetching members from an API
    // Replace this with your actual fetch logic
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
            setMembers(data.list);
            setSearchResults(data.list);
          } else {
            setErrorMessage(data.message);
          }
        });
      } catch (error) {
        console.error(error);
        // Handle other errors here
      }
    };
    getList();
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredResults = members.filter((member) =>
      member.name.toLowerCase().includes(query)
    );
    setSearchResults(filteredResults);
  };

  const handleCheckboxChange = (memberId) => {
    const isSelected = selectedMembers.includes(memberId);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  const handleCreateGroup = () => {
    // Replace this with your actual create group logic

    const groupNames = groupName;
    const selectedUserIds = selectedMembers;
    const createGroup = async () => {
      try {
        const response = await fetch("http://localhost:5000/creategroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            groupName: groupNames,
            selectedUserIds: selectedUserIds,
          }),
        });
        response.json().then((data) => {
          if (data.Status === "success") {
            console.log(data);
            handleClose();
          } else {
            setErrorMessage(data.message);
          }
        });
      } catch (error) {
        console.error(error);
        // Handle other errors here
      }
    };
    createGroup();

    setSelectedMembers([]);
    setGroupName("");

    handleClose();
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        group +
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="groupName">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="searchMember">
            <Form.Label>Search Member</Form.Label>
            <FormControl
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={handleSearch}
            />
          </Form.Group>

          <ul>
            {members
              .filter((item) => item.email !== emailOfCreater)
              .map((member) => (
                <li key={member.id}>
                  <Form.Check
                    type="checkbox"
                    label={member.name}
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => handleCheckboxChange(member._id)}
                  />
                </li>
              ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateGroup}>
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CreateGroup;
