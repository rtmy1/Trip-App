const db = require("../config/db.config"); // Import database configuration
const connection = require("../models/user.model"); // Import the database connection
const { query } = require("../models/user.model"); // Import query function (if required)

// Function to add a favorite trail for a user
const addFavorite = async (req, res) => {
  const { trail_num, trail_name, user_name } = req.body; // Extract data from the request body

  // SQL query to insert a new favorite into the database
  const insertQuery = `
        INSERT INTO favorites (trail_num, trail_name, user_name) 
        VALUES (?, ?, ?)`;

  const values = [trail_num, trail_name, user_name]; // Values to be inserted

  try {
    // Execute the query with the provided values
    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        // Handle SQL errors
        console.error("Error inserting into favorites: " + err.message);
        res.status(500).send("Error inserting into favorites");
      } else {
        // Respond with success if insertion is successful
        res.status(200).send("Favorite added successfully");
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error inserting into favorites");
  }
};

// Function to delete a favorite trail for a user
const deleteFavorite = async (req, res) => {
  const { trail_num, user_name } = req.params; // Extract parameters from the request URL

  // Validate that required parameters are provided
  if (!trail_num || !user_name) {
    return res.status(400).send("Missing trail_num or user_name.");
  }

  // SQL query to delete the specified favorite
  const deleteQuery =
    "DELETE FROM favorites WHERE trail_num = ? AND user_name = ?";
  const values = [trail_num, user_name]; // Values to be used in the query

  try {
    connection.query(deleteQuery, values, (err, results) => {
      if (err) {
        // Handle SQL errors
        console.error("Error deleting from favorites: " + err.message);
        res.status(500).send("Error deleting favorite.");
      } else if (results.affectedRows === 0) {
        // Handle case where no matching favorite was found
        res.status(404).send("Favorite not found.");
      } else {
        // Respond with success if deletion was successful
        res.status(200).send("Favorite removed successfully.");
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error deleting favorite.");
  }
};

// Function to count the number of times a trail is favorited by a specific user
const countFavorites = async (req, res) => {
  const { trail_num, user_name } = req.params; // Extract parameters from the request URL

  // Validate that required parameters are provided
  if (!trail_num || !user_name) {
    return res.status(400).send("Missing trail_num or user_name.");
  }

  // SQL query to count favorites matching the criteria
  const countQuery = `
        SELECT COUNT(trail_num) AS num_of_rows 
        FROM favorites 
        WHERE trail_num = ? AND user_name = ?`;
  const values = [trail_num, user_name]; // Values to be used in the query

  try {
    connection.query(countQuery, values, (err, results) => {
      if (err) {
        // Handle SQL errors
        console.error("Error counting favorites: " + err.message);
        res.status(500).send("Error counting favorites.");
      } else {
        // Respond with the count of favorites
        res.status(200).json({ num_of_rows: results[0].num_of_rows });
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error counting favorites.");
  }
};

// Function to retrieve a user's favorite trails
const getFavoriteTrails = async (req, res) => {
  const { user_name } = req.params; // Extract the user name from the request URL

  // Validate that user_name is provided
  if (!user_name) {
    return res.status(400).send("Missing user_name.");
  }

  // SQL query to fetch the trail names favorited by the user
  const selectQuery = `
        SELECT trail_name 
        FROM favorites 
        WHERE user_name = ?`;
  const values = [user_name]; // Value to be used in the query

  try {
    connection.query(selectQuery, values, (err, results) => {
      if (err) {
        // Handle SQL errors
        console.error("Error retrieving favorite trails: " + err.message);
        res.status(500).send("Error retrieving favorite trails.");
      } else {
        // Extract trail names from the query results
        const trailNames = results.map((row) => row.trail_name);
        res.status(200).json(trailNames); // Respond with the trail names
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error retrieving favorite trails.");
  }
};

// Function to get the most favorited trails across all users
const getMostFavoritedTrails = async (req, res) => {
  // SQL query to count favorites for each trail and sort them in descending order
  const query = `
        SELECT trail_name, COUNT(*) as count 
        FROM favorites 
        GROUP BY trail_name 
        ORDER BY count DESC`;

  try {
    connection.query(query, (err, results) => {
      if (err) {
        // Handle SQL errors
        console.error("Error retrieving most favorited trails: " + err.message);
        res.status(500).send("Error retrieving most favorited trails.");
      } else {
        // Respond with the most favorited trails and their counts
        res.status(200).json(results);
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error retrieving most favorited trails.");
  }
};

// Export the functions for use in other parts of the application
module.exports = {
  addFavorite,
  deleteFavorite,
  countFavorites,
  getFavoriteTrails,
  getMostFavoritedTrails, // Export the new function
};
