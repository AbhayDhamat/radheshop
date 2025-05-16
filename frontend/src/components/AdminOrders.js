
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "./AdminOrders.css";
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwt_decode(token);
        if (decoded.role !== "admin") {
          alert("Access Denied!");
          navigate("/home");
        } else {
          fetchOrders(token);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        navigate("/login");
      }
    }
  }, [navigate]);

  const fetchOrders = async (token) => {
    try {
      const response = await fetch("https://radheshop-backend.onrender.com/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://radheshop-backend.onrender.com/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      // Update table and remove order from user page
      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (error) {
      alert("Error deleting order: " + error.message);
    }
  };

  // Filtering orders based on user search & date search
  const filteredOrders = orders
    .filter((order) =>
      searchUser ? order.userId?.name?.toLowerCase().includes(searchUser.toLowerCase()) : true
    )
    .filter((order) =>
      searchDate ? new Date(order.createdAt).toISOString().split("T")[0] === searchDate : true
    );

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  return (
    <div className="admin-orders">
      <h1>Admin Orders</h1>

      {/* Search Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
      </div>

      {/* Orders Table */}
      {/* Orders Table */}
<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th>Order ID</th>
        <th>User</th>
        <th>Date</th>
        <th>Type</th>
        <th>Products</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentRecords.map((order) => (
        <tr key={order._id}>
          <td>{order._id}</td>
          <td>{order.userId?.name || "Unknown"}</td>
          <td>{new Date(order.createdAt).toLocaleString()}</td>
          <td>{(order.items[0]?.productType).toLocaleString()}</td>
          <td>{order.items.map((item) => item.productId?.name).join(", ")}</td>
          <td>
            <button className="delete-btn" onClick={() => deleteOrder(order._id)}>🗑 Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Pagination Controls */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;
