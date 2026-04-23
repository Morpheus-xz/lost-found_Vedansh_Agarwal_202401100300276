import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'https://lost-found-backend-rbsl.onrender.com/api';

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: token };

  const [items, setItems] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [msg, setMsg] = useState('');
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    itemName: '', description: '', type: 'Lost',
    location: '', date: '', contactInfo: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/items`, { headers });
      setItems(res.data);
    } catch {
      navigate('/login');
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddItem = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      await axios.post(`${API}/items`, form, { headers });
      setMsg('Item added successfully!');
      setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API}/items/${id}`, { headers });
      setMsg('Item deleted!');
      fetchItems();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setForm({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date?.substring(0, 10),
      contactInfo: item.contactInfo
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      await axios.put(`${API}/items/${editItem._id}`, form, { headers });
      setMsg('Item updated successfully!');
      setEditItem(null);
      setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update.');
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API}/items/search?name=${searchName}`, { headers });
      setItems(res.data);
    } catch {
      setMsg('Search failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.name}!</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {msg && <p className="msg success">{msg}</p>}

      <div className="form-card">
        <h3>{editItem ? 'Update Item' : 'Report an Item'}</h3>
        <form onSubmit={editItem ? handleUpdate : handleAddItem}>
          <input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleFormChange} required />
          <input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} required />
          <select name="type" value={form.type} onChange={handleFormChange}>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
          <input name="location" placeholder="Location" value={form.location} onChange={handleFormChange} required />
          <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
          <input name="contactInfo" placeholder="Contact Info" value={form.contactInfo} onChange={handleFormChange} required />
          <button type="submit">{editItem ? 'Update Item' : 'Add Item'}</button>
          {editItem && <button type="button" className="cancel-btn" onClick={() => { setEditItem(null); setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' }); }}>Cancel</button>}
        </form>
      </div>

      <div className="form-card">
        <h3>Search Items</h3>
        <div className="search-row">
          <input placeholder="Search by item name..." value={searchName} onChange={e => setSearchName(e.target.value)} />
          <button onClick={handleSearch}>Search</button>
          <button className="cancel-btn" onClick={fetchItems}>Clear</button>
        </div>
      </div>

      <div className="form-card">
        <h3>All Items ({items.length})</h3>
        {items.length === 0 ? <p style={{color:'var(--color-text-secondary)'}}>No items found.</p> : (
          items.map(item => (
            <div key={item._id} className="item-card">
              <div className="item-header">
                <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span>
                <strong>{item.itemName}</strong>
              </div>
              <p>{item.description}</p>
              <p>Location: {item.location}</p>
              <p>Date: {new Date(item.date).toLocaleDateString()}</p>
              <p>Contact: {item.contactInfo}</p>
              <p className="posted-by">Posted by: {item.postedBy?.name}</p>
              {item.postedBy?._id === user.id && (
                <div className="item-actions">
                  <button onClick={() => handleEditClick(item)}>Edit</button>
                  <button className="logout-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
