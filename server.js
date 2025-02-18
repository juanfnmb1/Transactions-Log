const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const path = require('path');
require("dotenv").config();

// Set up MySQL connection for remote database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Serve static files from the root directory
app.use(express.static(__dirname)); // <-- Serves all files in the root directory

// Serve the index.html file at the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Adjust path if needed
});
db.connect((err) => {
  if (err) {
    console.error("Could not connect to MySQL:", err);
    process.exit();
  }
  console.log("Connected to MySQL database.");
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Serve static files (if you have front-end assets like scripts or images)
app.use(express.static('public')); // This will serve files from the 'public' folder

// Endpoint to get all transactions
app.get("/transactions", (req, res) => {
  db.query("SELECT * FROM transactions", (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).send("Error fetching transactions.");
    }
    res.json(results);
  });
});

// Endpoint to add a new transaction
app.post("/add-entry", (req, res) => {
  const { name, transaction, paymentType } = req.body;
  const query =
    "INSERT INTO transactions (name, transaction, payment_type) VALUES (?, ?, ?)";
  db.query(query, [name, transaction, paymentType], (err, results) => {
    if (err) {
      console.error("Error adding transaction:", err);
      return res.status(500).send("Error adding transaction.");
    }
    res.status(201).json({
      id: results.insertId, // Return the new transaction's ID
      name,
      transaction,
      payment_type: paymentType,
    });
  });
});

// Endpoint to delete all transactions
app.delete("/delete-all-entries", (req, res) => {
  const query = "DELETE FROM transactions"; // Deletes all rows from the table
  db.query(query, (err) => {
    if (err) {
      console.error("Error deleting all transactions:", err);
      return res.status(500).send("Error deleting all transactions.");
    }
    res.status(200).send("All transactions deleted.");
  });
});

// Endpoint to delete a transaction by ID
app.delete("/delete-entry/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM transactions WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).send("Error deleting transaction.");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Transaction not found.");
    }
    res.status(200).send("Transaction deleted.");
  });
});

// ----- DEBTS ENDPOINTS -----
// Endpoint to get all debts
app.get("/debts", (req, res) => {
  db.query("SELECT * FROM debts", (err, results) => {
    if (err) {
      console.error("Error fetching debts:", err);
      return res.status(500).send("Error fetching debts.");
    }
    res.json(results);
  });
});

// Endpoint to add a new debt
app.post("/add-debt", (req, res) => {
  const { name, amount, description } = req.body; // Include description
  const query =
    "INSERT INTO debts (name, amount, description) VALUES (?, ?, ?)";

  db.query(query, [name, amount, description], (err, results) => {
    if (err) {
      console.error("Error adding debt:", err);
      return res.status(500).send("Error adding debt.");
    }
    res.status(201).json({
      id: results.insertId,
      name,
      amount,
      description, // Return description too
    });
  });
});

// Endpoint to delete a debt by ID
app.delete("/delete-debt/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM debts WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting debt:", err);
      return res.status(500).send("Error deleting debt.");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("Debt not found.");
    }
    res.status(200).send("Debt deleted.");
  });
});

// Endpoint to delete all debts
app.delete("/delete-all-debts", (req, res) => {
  const query = "DELETE FROM debts";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error deleting all debts:", err);
      return res.status(500).send("Error deleting all debts.");
    }
    res.status(200).send("All debts deleted successfully.");
  });
});

// Start the server
const PORT = process.env.PORT || 3000; // Use the environment variable PORT provided by Glitch or default to 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

