// ===========================
// Supabase Configuration
// ===========================
const SUPABASE_URL = "https://nfynemwkemkhmsnvefmg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meW5lbXdrZW1raG1zbnZlZm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDMzMTAsImV4cCI6MjA4NzIxOTMxMH0.Yn4FFP1EKhGI2vhEC7hLtRHecM7hqQZrxKFiQ8eQDR8";

// Initialize Supabase client (only once)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===========================
// DOM Elements
// ===========================
const vehicleForm = document.getElementById("add-vehicle-form");
const vehicleNameInput = document.getElementById("vehicle-name");
const vehicleCapacityInput = document.getElementById("vehicle-capacity");
const vehicleMessage = document.getElementById("vehicle-message");
const vehiclesTable = document.getElementById("vehicles-tbody");

const tripForm = document.getElementById("add-trip-form");
const tripVehicleSelect = document.getElementById("trip-vehicle");
const tripWeightInput = document.getElementById("trip-weight");
const tripMessage = document.getElementById("trip-message");
const tripsTable = document.getElementById("trips-tbody");

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

// ===========================
// Navigation
// ===========================
// Handle section switching when navigation buttons are clicked
navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const sectionId = button.getAttribute("data-section") + "-section";

        // Remove active class from all buttons and sections
        navButtons.forEach(btn => btn.classList.remove("active"));
        sections.forEach(section => section.classList.remove("active"));

        // Add active class to clicked button and corresponding section
        button.classList.add("active");
        document.getElementById(sectionId).classList.add("active");
    });
});

// ===========================
// Message Display Utility
// ===========================
/**
 * Display a message to the user
 * @param {HTMLElement} element - The element to display the message in
 * @param {string} message - The message text
 * @param {string} type - Message type: 'success', 'error', 'warning'
 */
function showMessage(element, message, type = "success") {
    element.textContent = message;
    element.className = `message show ${type}`;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
        element.classList.remove("show");
    }, 5000);
}

// ===========================
// Vehicle Functions
// ===========================
/**
 * Fetch all vehicles from Supabase and display them in the table
 */
async function fetchVehicles() {
    try {
        // Query the vehicles table
        const { data: vehicles, error } = await supabaseClient
            .from("vehicles")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            showMessage(vehicleMessage, `Error loading vehicles: ${error.message}`, "error");
            return;
        }

        // Clear table
        vehiclesTable.innerHTML = "";

        // Display message if no vehicles
        if (vehicles.length === 0) {
            vehiclesTable.innerHTML = '<tr><td colspan="3" class="text-center">No vehicles found. Add one to get started!</td></tr>';
            return;
        }

        // Display each vehicle in the table
        vehicles.forEach(vehicle => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${vehicle.id}</td>
                <td>${vehicle.name}</td>
                <td>${vehicle.capacity}</td>
            `;
            vehiclesTable.appendChild(row);
        });
    } catch (error) {
        showMessage(vehicleMessage, `Unexpected error: ${error.message}`, "error");
    }
}

/**
 * Add a new vehicle to the database
 */
async function addVehicle(e) {
    e.preventDefault();

    // Get input values
    const name = vehicleNameInput.value.trim();
    const capacity = parseInt(vehicleCapacityInput.value);

    // Validate inputs
    if (!name) {
        showMessage(vehicleMessage, "Please enter a vehicle name", "warning");
        return;
    }

    if (!capacity || capacity <= 0) {
        showMessage(vehicleMessage, "Capacity must be a positive number", "warning");
        return;
    }

    try {
        // Insert vehicle into Supabase
        const { error } = await supabaseClient
            .from("vehicles")
            .insert([{ name, capacity }]);

        if (error) {
            showMessage(vehicleMessage, `Error adding vehicle: ${error.message}`, "error");
            return;
        }

        // Success
        showMessage(vehicleMessage, "Vehicle added successfully!", "success");
        
        // Clear form
        vehicleForm.reset();
        
        // Refresh vehicle list and dropdown
        fetchVehicles();
        populateVehicleDropdown();
    } catch (error) {
        showMessage(vehicleMessage, `Unexpected error: ${error.message}`, "error");
    }
}

/**
 * Populate the vehicle dropdown in the trip form
 */
async function populateVehicleDropdown() {
    try {
        // Query the vehicles table
        const { data: vehicles, error } = await supabaseClient
            .from("vehicles")
            .select("id, name, capacity")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error loading vehicles for dropdown:", error);
            return;
        }

        // Keep the default option and clear others
        const defaultOption = tripVehicleSelect.querySelector('option[value=""]');
        tripVehicleSelect.innerHTML = "";
        tripVehicleSelect.appendChild(defaultOption);

        // Add each vehicle as an option
        vehicles.forEach(vehicle => {
            const option = document.createElement("option");
            option.value = vehicle.id;
            option.textContent = `${vehicle.name} (Capacity: ${vehicle.capacity} kg)`;
            tripVehicleSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Unexpected error loading vehicles:", error);
    }
}

// ===========================
// Trip Functions
// ===========================
/**
 * Fetch all trips from Supabase and display them in the table
 */
async function fetchTrips() {
    try {
        // Query the trips table
        const { data: trips, error } = await supabaseClient
            .from("trips")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            showMessage(tripMessage, `Error loading trips: ${error.message}`, "error");
            return;
        }

        // Clear table
        tripsTable.innerHTML = "";

        // Display message if no trips
        if (trips.length === 0) {
            tripsTable.innerHTML = '<tr><td colspan="4" class="text-center">No trips found. Create one to get started!</td></tr>';
            return;
        }

        // Display each trip in the table
        trips.forEach(trip => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${trip.id}</td>
                <td>${trip.vehicle_id}</td>
                <td>${trip.cargo_weight}</td>
                <td><span class="status-badge">${trip.status}</span></td>
            `;
            tripsTable.appendChild(row);
        });
    } catch (error) {
        showMessage(tripMessage, `Unexpected error: ${error.message}`, "error");
    }
}

/**
 * Create a new trip with validation
 */
async function createTrip(e) {
    e.preventDefault();

    // Get input values
    const vehicleId = parseInt(tripVehicleSelect.value);
    const cargoWeight = parseInt(tripWeightInput.value);

    // Validate inputs
    if (!vehicleId) {
        showMessage(tripMessage, "Please select a vehicle", "warning");
        return;
    }

    if (!cargoWeight || cargoWeight <= 0) {
        showMessage(tripMessage, "Cargo weight must be a positive number", "warning");
        return;
    }

    try {
        // Fetch the vehicle to check capacity
        const { data: vehicle, error: fetchError } = await supabaseClient
            .from("vehicles")
            .select("*")
            .eq("id", vehicleId)
            .single();

        if (fetchError) {
            showMessage(tripMessage, "Vehicle not found", "error");
            return;
        }

        if (!vehicle) {
            showMessage(tripMessage, "Vehicle not found", "error");
            return;
        }

        // Validate cargo weight against vehicle capacity
        if (cargoWeight > vehicle.capacity) {
            showMessage(
                tripMessage,
                `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg)`,
                "error"
            );
            return;
        }

        // Create trip with status "Dispatched"
        const { error: insertError } = await supabaseClient
            .from("trips")
            .insert([
                {
                    vehicle_id: vehicleId,
                    cargo_weight: cargoWeight,
                    status: "Dispatched"
                }
            ]);

        if (insertError) {
            showMessage(tripMessage, `Error creating trip: ${insertError.message}`, "error");
            return;
        }

        // Success
        showMessage(tripMessage, "Trip created successfully!", "success");
        
        // Clear form
        tripForm.reset();
        
        // Refresh trips table
        fetchTrips();
    } catch (error) {
        showMessage(tripMessage, `Unexpected error: ${error.message}`, "error");
    }
}

// ===========================
// Event Listeners
// ===========================
// Add vehicle form submission
vehicleForm.addEventListener("submit", addVehicle);

// Add trip form submission
tripForm.addEventListener("submit", createTrip);

// ===========================
// Initialize Application
// ===========================
/**
 * Initialize the application on page load
 */
async function initializeApp() {
    try {
        // Load vehicles
        await fetchVehicles();
        
        // Load trips
        await fetchTrips();
        
        // Populate vehicle dropdown
        await populateVehicleDropdown();
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

// Run initialization when DOM is fully loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}
