const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5173;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
