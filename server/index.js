const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.send('Altfolio backend is working');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const investmentRoutes = require('./routes/investments');
app.use('/api/investments', investmentRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
