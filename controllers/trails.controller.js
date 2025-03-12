// Import necessary modules
const db = require("../config/db.config"); // Import the database configuration
const connection = require("../models/user.model"); // Import the database connection model
const { query } = require("../models/user.model"); // Import the query function (if required)

// Function to fetch all trails
const getAllTrails = (req, res) => {
  // SQL query to retrieve all trail names
  const query = "SELECT `trail_name` FROM `trails` WHERE 1";

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      // Log and handle SQL errors
      console.error("Error fetching trails: " + err);
      res.status(500).send("Error fetching trails");
    } else {
      // Map the results to return only trail names as a list
      const trailNames = results.map((row) => row.trail_name);
      res.json(trailNames); // Respond with the trail names
    }
  });
};

// Function to fetch trails located in the north district
const getNorthTrails = (req, res) => {
  // SQL query to retrieve trails in the north district
  const query = "SELECT `trail_name` FROM `trails` WHERE district ='צפון'";

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      // Log and handle SQL errors
      console.error("Error fetching trails: " + err);
      res.status(500).send("Error fetching trails");
    } else {
      res.json(results); // Respond with the results
    }
  });
};

// Function to fetch trails located in the center district
const getCenterTrails = (req, res) => {
  // SQL query to retrieve trails in the center district
  const query = "SELECT `trail_name` FROM `trails` WHERE district ='מרכז'";

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      // Log and handle SQL errors
      console.error("Error fetching trails: " + err);
      res.status(500).send("Error fetching trails");
    } else {
      res.json(results); // Respond with the results
    }
  });
};

// Function to fetch trails located in the south district
const getSouthTrails = (req, res) => {
  // SQL query to retrieve trails in the south district
  const query = "SELECT `trail_name` FROM `trails` WHERE district ='דרום'";

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      // Log and handle SQL errors
      console.error("Error fetching trails: " + err);
      res.status(500).send("Error fetching trails");
    } else {
      res.json(results); // Respond with the results
    }
  });
};

// Function to fetch details of a specific trail by its name
const getTrailByName = async (req, res) => {
  const trailName = req.params.name; // Extract the trail name from the request parameters

  console.log(trailName); // Log the trail name for debugging purposes

  try {
    // SQL query to retrieve the trail details by name
    connection.query(
      "SELECT * FROM `trails` WHERE trail_name = ?",
      [trailName], // Use trailName as a parameter to prevent SQL injection
      function (error, results, fields) {
        if (error) {
          // Log and handle SQL errors
          console.error("Error fetching trail by name:", error.message);
          res.status(500).send("Error fetching trail");
        } else {
          if (results.length === 0) {
            // Handle case where no trail is found
            res.status(404).send("Trail not found");
          } else {
            res.json(results[0]); // Respond with the trail details
          }
        }
      }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error fetching trail");
  }
};

// Function to update trail details
const updateTrail = async (req, res) => {
  // Extract the trail details and trail number from the request
  const { trail_name, length, water, camping, bike, jeep, pet, about } =
    req.body;
  const trailNum = req.params.trail_num; // Retrieve trail number from URL parameters

  // SQL query to update trail details
  const updateQuery = `
    UPDATE trails 
    SET 
      trail_name = ?, 
      length = ?, 
      water = ?, 
      camping = ?, 
      bike = ?, 
      jeep = ?, 
      pet = ?, 
      about = ?
    WHERE trail_num = ?`;

  const values = [
    trail_name,
    length,
    water,
    camping,
    bike,
    jeep,
    pet,
    about,
    trailNum, // Ensure the trail number is included for the WHERE clause
  ];

  try {
    // Execute the update query with the provided values
    connection.query(updateQuery, values, (err, results) => {
      if (err) {
        // Log and handle SQL errors
        console.error("Error updating trail: " + err.message);
        res.status(500).send("Error updating trail");
      } else {
        res.send("Trail updated successfully"); // Respond with success
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error:", error.message);
    res.status(500).send("Unexpected error updating trail");
  }
};

// Export the functions to make them accessible in other parts of the application
module.exports = {
  getNorthTrails,
  getCenterTrails,
  getSouthTrails,
  getTrailByName,
  updateTrail, // Export the new update function
  getAllTrails,
};
