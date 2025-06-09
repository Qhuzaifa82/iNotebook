require('dotenv').config({ path: __dirname + '/.env' }); // ✅ absolute path from current file location
// ✅ Load .env first

const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');

console.log("📦 ENV MONGO_URI from index.js:", process.env.MONGO_URI); // Debug

const app = express();
const port = 5000;

connectToMongo();

app.use(cors());
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`iNotebook WEB app backend listening on port ${port}`);
});
