// Import database configuration and connection model
const db = require("../config/db.config"); // Database configuration
const connection = require("../models/user.model"); // Database connection

// Function to add a new bug report
const addBugReport = async (req, res) => {
  const { user_name, description, fixed, date } = req.body; // Extract bug details from request body

  // SQL query to insert a new bug report into the database
  const insertQuery = `INSERT INTO bugs (user_name, description, fixed, date) VALUES (?, ?, ?, ?)`;
  const values = [user_name, description, fixed, date]; // Values to be inserted

  try {
    // Execute the query
    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        // Log and send error response if query fails
        console.error("Error inserting into bugs: " + err.message);
        res.status(500).send("Error inserting bug report");
      } else {
        // Send success response if query is successful
        res.status(200).send("Bug report added successfully");
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error inserting bug report");
  }
};

// Function to fetch all unfixed bugs
const getUnfixedBugs = async (req, res) => {
  // SQL query to select bug reports where the `fixed` flag is set to 0 (unfixed)
  const selectQuery =
    "SELECT user_name, description, fixed, date FROM bugs WHERE fixed = 0 ORDER BY date DESC";

  try {
    // Execute the query
    connection.query(selectQuery, (err, results) => {
      if (err) {
        // Log and send error response if query fails
        console.error("Error fetching unfixed bugs: " + err.message);
        res.status(500).send("Error fetching unfixed bugs");
      } else {
        // Send the unfixed bug reports as a JSON response
        res.status(200).json(results);
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error fetching unfixed bugs");
  }
};

// Function to mark a specific bug report as fixed
const markBugAsFixed = async (req, res) => {
  const { user_name, description } = req.body; // Extract user and bug description from request body

  // SQL query to update the `fixed` flag of the specified bug report
  const updateQuery = `UPDATE bugs SET fixed = 1 WHERE user_name = ? AND description = ?`;
  const values = [user_name, description]; // Values to identify the specific bug report

  try {
    // Execute the query
    connection.query(updateQuery, values, (err, results) => {
      if (err) {
        // Log and send error response if query fails
        console.error("Error updating bug status: " + err.message);
        res.status(500).send("Error marking bug as fixed");
      } else if (results.affectedRows === 0) {
        // If no rows were affected, the specified bug was not found
        res.status(404).send("Bug not found");
      } else {
        // Send success response if the bug was successfully marked as fixed
        res.status(200).send("Bug marked as fixed successfully");
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error updating bug status");
  }
};

// Export all functions for use in other parts of the application
module.exports = {
  addBugReport,
  getUnfixedBugs,
  markBugAsFixed,
};
