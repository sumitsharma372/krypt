const express = require('express');
const mongoose = require('mongoose');
const tokenRoutes = require('./routes/tokenRoutes');
var cors = require('cors')
const app = express();
app.use(cors())

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sperax:sperax123@cluster0.c2p1x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

app.use('/api/tokens', tokenRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
