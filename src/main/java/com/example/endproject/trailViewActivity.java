package com.example.endproject;


import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import org.osmdroid.config.Configuration;
import org.osmdroid.library.BuildConfig;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Polyline;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;



//Initialize parameters

public class trailViewActivity extends AppCompatActivity {
    TextView textViewTrailView, textViewLengthTrail;
    private MapView mapView;
    Button openGpsBtn;
    Switch mySwitch;
    ApiService apiInterface; // Retrofit API interface
    private static final String PREFS_NAME = "TrailPrefs";
    private static final String SWITCH_STATE_KEY = "SwitchState_";
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_trail_view);
        Configuration.getInstance().setUserAgentValue(BuildConfig.APPLICATION_ID);

        textViewLengthTrail = findViewById(R.id.textViewLengthTrail);
        progressBar = findViewById(R.id.progressBar); // ProgressBar
        apiInterface = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        setupImageButtons();

        // Get the intent and retrieve the Trail object
        Intent intent = getIntent();
        Trail trail = intent.getParcelableExtra("trail");
        String trailNumStr = String.valueOf(trail.getTrailNum());
        String trailName = trail.getTrailName();
        String username = User.getInstance().getUsername();

        mySwitch = findViewById(R.id.mySwitch);

        // Initialize SharedPreferences
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String switchKey = SWITCH_STATE_KEY + trail.getTrailNum();
        boolean isSwitchChecked = sharedPreferences.getBoolean(switchKey, false);
        mySwitch.setChecked(isSwitchChecked);

        // Map view parameters
        mapView = findViewById(R.id.mapview);
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);
        mapView.getController().setCenter(new GeoPoint(0.0, 0.0));

        // Trail attributes icons
        setupTrailIcons(trail);

        // Load GPX file and display on map
        List<GeoPoint> geoPoints = loadGpxFile(trail);
        if (geoPoints != null && !geoPoints.isEmpty()) {
            mapView.getController().setCenter(geoPoints.get(0));
            Polyline polyline = new Polyline();
            polyline.setPoints(geoPoints);
            mapView.getOverlayManager().add(polyline);
        }

        // Trail details
        textViewTrailView = findViewById(R.id.textViewTrailView);
        textViewTrailView.setText(trail.getAbout());
        textViewLengthTrail.setText(trail.getLength() + " km");

        // Switch handling
        mySwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putBoolean(switchKey, isChecked);
            editor.apply();
            // Handle favorites logic
            if (isChecked) {
                addToFavorites(trailNumStr, trailName, username);
            } else {
                removeFromFavorites(trailNumStr, username);
            }
        });

        // Open GPS apps
        openGpsBtn = findViewById(R.id.openGpsBtn);
        openGpsBtn.setOnClickListener(v -> openGpsNavigation(trail.getTrailName()));

        // Check if the trail is already a favorite
        checkIfFavorite(trailNumStr, username);
    }

    // Trail icons setup
    private void setupTrailIcons(Trail trail) {
        ImageView imgBike = findViewById(R.id.imgBike);
        ImageView imgPet = findViewById(R.id.imgPet);
        ImageView imgJeep = findViewById(R.id.imgJeep);
        ImageView imgWater = findViewById(R.id.imgWater);
        ImageView imgCamping = findViewById(R.id.imgCamping);

        imgPet.setVisibility(trail.getPet().equals("1") ? View.VISIBLE : View.GONE);
        imgBike.setVisibility(trail.getBike().equals("1") ? View.VISIBLE : View.GONE);
        imgJeep.setVisibility(trail.getJeep().equals("1") ? View.VISIBLE : View.GONE);
        imgCamping.setVisibility(trail.getCamping().equals("1") ? View.VISIBLE : View.GONE);
        imgWater.setVisibility(trail.getWater().equals("1") ? View.VISIBLE : View.GONE);
    }

    // Open GPS Navigation
    private void openGpsNavigation(String location) {

            String wazeUri = "https://waze.com/ul?q=" + Uri.encode(location);
            Intent wazeIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(wazeUri));
            wazeIntent.setPackage("com.waze");
            startActivity(wazeIntent);

    }


    // Load GPX file
    private List<GeoPoint> loadGpxFile(Trail trail) {
        List<GeoPoint> geoPoints = new ArrayList<>();
        try (InputStream inputStream = getAssets().open(trail.getTrailFileName())) {
            XmlPullParserFactory factory = XmlPullParserFactory.newInstance();
            XmlPullParser parser = factory.newPullParser();
            parser.setInput(inputStream, null);

            int eventType = parser.getEventType();
            while (eventType != XmlPullParser.END_DOCUMENT) {
                if (eventType == XmlPullParser.START_TAG && "trkpt".equals(parser.getName())) {
                    String lat = parser.getAttributeValue(null, "lat");
                    String lon = parser.getAttributeValue(null, "lon");
                    geoPoints.add(new GeoPoint(Double.parseDouble(lat), Double.parseDouble(lon)));
                }
                eventType = parser.next();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return geoPoints;
    }

    // Add trail to favorites
    private void addToFavorites(String trailNum, String trailName, String username) {
        progressBar.setVisibility(View.VISIBLE);
        FavoriteTrail f1 = new FavoriteTrail(trailNum, trailName, username);
        Call<Void> call = apiInterface.addFavoriteTrail(f1);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                progressBar.setVisibility(View.GONE);

            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getApplicationContext(), "An error occurred: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // Remove trail from favorites
    private void removeFromFavorites(String trailNum, String username) {
        progressBar.setVisibility(View.VISIBLE);
        Call<Void> call = apiInterface.deleteFavoriteTrail(trailNum, username);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                progressBar.setVisibility(View.GONE);

            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getApplicationContext(), "An error occurred: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
    //Nav bar
    private void setupImageButtons() {
        ImageButton home = findViewById(R.id.homeButton);
        home.setOnClickListener(v -> startActivity(new Intent(trailViewActivity.this, HomeActivity.class)));

        ImageButton search = findViewById(R.id.searchButton);
        search.setOnClickListener(v -> startActivity(new Intent(trailViewActivity.this, SearchActivity.class)));

        ImageButton favorite = findViewById(R.id.favoriteButton);
        favorite.setOnClickListener(v -> startActivity(new Intent(trailViewActivity.this, FavoriteActivity.class)));

        ImageButton profile = findViewById(R.id.profileButton);
        profile.setOnClickListener(v -> startActivity(new Intent(trailViewActivity.this, ProfileActivity.class)));

        ImageButton admin = findViewById(R.id.adminButton);

        String userName = User.getInstance().getUsername();
        admin.setOnClickListener(v -> startActivity(new Intent(trailViewActivity.this, AdminActivity.class)));
        if (userName.equals("admin")) {
            admin.setVisibility(View.VISIBLE);
        }
    }

    // Check if trail is favorite
    private void checkIfFavorite(String trailNum, String username) {
        progressBar.setVisibility(View.VISIBLE);
        Call<CountResponse> call = apiInterface.countFavorites(trailNum, username);
        call.enqueue(new Callback<CountResponse>() {
            @Override
            public void onResponse(Call<CountResponse> call, Response<CountResponse> response) {
                progressBar.setVisibility(View.GONE);
                mySwitch.setChecked(response.isSuccessful() && response.body() != null && response.body().getNumOfRows() > 0);
            }

            @Override
            public void onFailure(Call<CountResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getApplicationContext(), "An error occurred: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
