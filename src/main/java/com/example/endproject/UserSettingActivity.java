package com.example.endproject;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserSettingActivity extends AppCompatActivity {

    // Declare the EditText fields for password inputs and the Button to trigger password update
    private EditText currentPasswordEditText, newPasswordEditText1, newPasswordEditText2;
    private Button btnUpdatePassword;

    // Variable to store the username of the logged-in user
    private String user;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_setting);

        // Initialize the views by finding them by their IDs
        currentPasswordEditText = findViewById(R.id.password);
        newPasswordEditText1 = findViewById(R.id.newPassword1);
        newPasswordEditText2 = findViewById(R.id.newPassword2);
        btnUpdatePassword = findViewById(R.id.btnUpdatePassword);

        // Set up the image buttons (navigation bar)
        setupImageButtons();

        // Assuming the logged-in user's username is stored in the User singleton class
        user = User.getInstance().getUsername(); // Get the username of the logged-in user

        // Handle the click event for the Update Password button
        btnUpdatePassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                updatePassword(); // Call the method to update the password
            }
        });
    }

    // Method to update the password
    private void updatePassword() {
        // Get the values entered by the user in the EditText fields
        String currentPassword = currentPasswordEditText.getText().toString().trim();
        String newPassword1 = newPasswordEditText1.getText().toString().trim();
        String newPassword2 = newPasswordEditText2.getText().toString().trim();

        // Validate that all fields are filled in
        if (TextUtils.isEmpty(currentPassword) || TextUtils.isEmpty(newPassword1) || TextUtils.isEmpty(newPassword2)) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return; // Stop execution if validation fails
        }

        // Check if the new password fields match
        if (!newPassword1.equals(newPassword2)) {
            Toast.makeText(this, "New passwords do not match", Toast.LENGTH_SHORT).show();
            return;
        }

        // Check if user information is available (username)
        if (user == null || TextUtils.isEmpty(user)) {
            Toast.makeText(this, "User information is missing", Toast.LENGTH_SHORT).show();
            return;
        }

        // Create the PasswordUpdateRequest object to send to the API
        PasswordUpdateRequest request = new PasswordUpdateRequest(user, currentPassword, newPassword1);

        // Create an instance of the ApiService for making the API call
        ApiService api = RetrofitClient.getRetrofitInstance().create(ApiService.class);

        // Make the API call to update the password
        Call<Void> call = api.updatePassword(request);

        // Enqueue the call and handle the response
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                // Check if the response was successful
                if (response.isSuccessful()) {
                    Toast.makeText(UserSettingActivity.this, "Password updated successfully", Toast.LENGTH_SHORT).show();
                } else {
                    // Show error message if password update fails
                    Toast.makeText(UserSettingActivity.this, "Failed to update password", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // Show error message if the API request fails
                Toast.makeText(UserSettingActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // Method to set up the image buttons for navigation
    private void setupImageButtons() {
        // Find the image buttons by their IDs and set click listeners for each
        ImageButton home = findViewById(R.id.homeButton);
        home.setOnClickListener(v -> startActivity(new Intent(UserSettingActivity.this, HomeActivity.class)));

        ImageButton search = findViewById(R.id.searchButton);
        search.setOnClickListener(v -> startActivity(new Intent(UserSettingActivity.this, SearchActivity.class)));

        ImageButton favorite = findViewById(R.id.favoriteButton);
        favorite.setOnClickListener(v -> startActivity(new Intent(UserSettingActivity.this, FavoriteActivity.class)));

        ImageButton profile = findViewById(R.id.profileButton);
        profile.setOnClickListener(v -> startActivity(new Intent(UserSettingActivity.this, ProfileActivity.class)));

        ImageButton admin = findViewById(R.id.adminButton);

        // If the logged-in user is "admin", make the admin button visible
        String userName = User.getInstance().getUsername();
        admin.setOnClickListener(v -> startActivity(new Intent(UserSettingActivity.this, AdminActivity.class)));
        if (userName.equals("admin")) {
            admin.setVisibility(View.VISIBLE); // Show the admin button if the user is an admin
        }
    }
}
