// Import required modules
const connection = require("../models/user.model"); // Database connection
const bcrypt = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating JSON Web Tokens (JWT)

// Secret key for signing JWT tokens (use environment variables in production)
const secretKey = "your_secret_key";

// Function to handle user registration
exports.register = (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // Hash the password before storing it in the database for security
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      // Handle error during password hashing
      return res.status(500).send({ message: "Error hashing password" });
    }

    // SQL query to insert the new user into the database
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    connection.query(query, [username, hash], (error, results) => {
      if (error) {
        // Handle database error during user registration
        return res.status(500).send({ message: "Error registering user" });
      }

      // Respond with success message if user registration is successful
      res.status(201).send({ message: "User registered successfully" });
    });
  });
};

// Function to handle user login
exports.login = (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // SQL query to fetch the user by username
  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], (error, results) => {
    if (error) {
      // Handle database error during user lookup
      return res.status(500).send({ message: "Error fetching user" });
    }

    if (results.length === 0) {
      // Handle case where user is not found
      return res.status(404).send({ message: "User not found" });
    }

    const user = results[0]; // Retrieve the user record from the query results

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        // Handle error during password comparison
        return res.status(500).send({ message: "Error comparing passwords" });
      }

      if (!isMatch) {
        // Handle case where passwords do not match
        return res.status(401).send({ message: "Invalid credentials" });
      }

      // Generate a JWT token for the authenticated user
      const token = jwt.sign(
        { id: user.id, username: user.username }, // Payload containing user information
        secretKey, // Secret key for signing the token
        {
          expiresIn: "1h", // Token expiration time
        }
      );

      // Respond with the generated token
      res.status(200).send({ token });
    });
  });
};

// Function to update the user's password
exports.updatePassword = (req, res) => {
  const { username, oldPassword, newPassword } = req.body; // Extract username, oldPassword, and newPassword from request body

  // SQL query to fetch the user by username
  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], (error, results) => {
    if (error) {
      // Handle database error during user lookup
      return res.status(500).send({ message: "Error fetching user" });
    }

    if (results.length === 0) {
      // Handle case where user is not found
      return res.status(404).send({ message: "User not found" });
    }

    const user = results[0]; // Retrieve the user record from the query results

    // Compare the provided old password with the hashed password in the database
    bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
      if (err) {
        // Handle error during password comparison
        return res.status(500).send({ message: "Error comparing passwords" });
      }

      if (!isMatch) {
        // Handle case where old password does not match
        return res.status(401).send({ message: "Old password is incorrect" });
      }

      // Hash the new password before updating it in the database
      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
          // Handle error during password hashing
          return res
            .status(500)
            .send({ message: "Error hashing new password" });
        }

        // SQL query to update the user's password
        const updateQuery = "UPDATE users SET password = ? WHERE username = ?";
        connection.query(updateQuery, [hash, username], (error, results) => {
          if (error) {
            // Handle database error during password update
            return res.status(500).send({ message: "Error updating password" });
          }

          // Respond with success message if password update is successful
          res.status(200).send({ message: "Password updated successfully" });
        });
      });
    });
  });
};
