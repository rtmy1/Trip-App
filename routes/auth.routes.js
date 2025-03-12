// Import necessary modules and controllers
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller"); // Handles authentication (register, login)
const trailsContoller = require("../controllers/trails.controller"); // Handles trail-related operations
const favoriteConntoller = require("../controllers/favorite.controller"); // Handles favorite trails functionality
const bugController = require("../controllers/bugs.controller"); // Handles bug reporting functionality

// Authentication routes
router.post("/register", authController.register); // User registration
router.post("/login", authController.login); // User login
router.put("/updatePassword", authController.updatePassword);

// Trail-related routes
router.get("/northTrails", trailsContoller.getNorthTrails); // Get trails in the north region
router.get("/centerTrails", trailsContoller.getCenterTrails); // Get trails in the center region
router.get("/southTrails", trailsContoller.getSouthTrails); // Get trails in the south region
router.get("/getTrail/:name", trailsContoller.getTrailByName); // Get trail details by name
router.put("/trails/:trail_num", trailsContoller.updateTrail); // Update trail details by trail number
router.get("/getAllTrails", trailsContoller.getAllTrails); // Get all trails

// Favorite-related routes
router.post("/addFavorites", favoriteConntoller.addFavorite); // Add a trail to user's favorites
router.get(
  "/deleteFavorite/:trail_num/:user_name",
  favoriteConntoller.deleteFavorite
); // Delete a trail from user's favorites
router.get(
  "/countFavorites/:trail_num/:user_name",
  favoriteConntoller.countFavorites
); // Count how many times a trail is favorited
router.get(
  "/getMostFavoritedTrails",
  favoriteConntoller.getMostFavoritedTrails
); // Get the most favorited trails
router.get(
  "/getFavoriteTrails/:user_name",
  favoriteConntoller.getFavoriteTrails
); // Get all favorite trails for a specific user

// Bug reporting routes
router.post("/addBugReport", bugController.addBugReport); // Add a new bug report
router.get("/getUnfixedBugs", bugController.getUnfixedBugs); // Get all unfixed bug reports
router.post("/markBugAsFixed", bugController.markBugAsFixed); // Mark a bug report as fixed

// Export the router to use in the main application file
module.exports = router;
