const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB error:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'Lost & Found API is live!',
    developer: 'Vedansh Agarwal',
    rollNumber: '202401100300276',
    routes: {
      auth: {
        register: 'POST /api/register',
        login: 'POST /api/login'
      },
      items: {
        addItem: 'POST /api/items',
        getAllItems: 'GET /api/items',
        getItemById: 'GET /api/items/:id',
        updateItem: 'PUT /api/items/:id',
        deleteItem: 'DELETE /api/items/:id',
        searchItems: 'GET /api/items/search?name=xyz'
      }
    }
  });
});

app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
