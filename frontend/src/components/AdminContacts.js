
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "./AdminContacts.css";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwt_decode(token);
        if (decoded.role !== "admin") {
          alert("Access Denied! Redirecting to home...");
          navigate("/home");
        } else {
          fetchAllContacts(token);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        navigate("/login");
      }
    }
  }, [navigate]);

  const fetchAllContacts = async (token) => {
    try {
      const response = await fetch("https://radheshop-backend.onrender.com/api/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch contacts");
      }

      const responseData = await response.json();
      setContacts(responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading contacts...</p>;
  if (error) return <p>Error: {error}</p>;
  if (contacts.length === 0) return <p>No contacts found.</p>;

  return (
   <div className="contacts-page">
  <h1>Users: All Contacts</h1>
  <div className="table-responsive">
    <table className="contacts-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Message</th>
          <th>Rating</th>
          <th>Submitted At</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact._id}>
            <td data-label="Name">{contact.name}</td>
            <td data-label="Email">{contact.email}</td>
            <td data-label="Phone">{contact.phone}</td>
            <td data-label="Message">{contact.message}</td>
            <td data-label="Rating">{contact.rating}</td>
            <td data-label="Submitted At">{new Date(contact.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

  );
};

export default AdminContacts;
