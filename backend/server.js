require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verifierRoutes = require('./routes/verifier');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/verifier', verifierRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
