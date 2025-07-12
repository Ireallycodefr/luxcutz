
function loadAvailableTimes(date) {
    fetch(`http://localhost:4000/available-times?date=${date}`)
    .then(response => response.json())
    .then(times => {
    const dropdown = document.getElementById("timeSlots");
    dropdown.innerHTML = "";
    
    if (times.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No times Available";
        option.disabled = true;
        dropdown.appendChild(option);
        return;
    }
    times.forEach((time) =>{
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        dropdown.appendChild(option);
    });
    })
    .catch(err => console.error("Error loading times:", err));
};
    
    document.getElementById("appointmentDate").addEventListener("change", (e) => {
        const selectedDate = e.target.value;
        loadAvailableTimes(selectedDate);
    })
    document.getElementById('appointmentForm').addEventListener("submit", function(event) {

        event.preventDefault();
    
    
    
        const name = document.getElementById("name").value;
    
        const email = document.getElementById("email").value;
    
        const timeSelect = document.getElementById("timeSlots");
    
        const selectedTime = timeSelect.value;
    
        const selectedDate = document.getElementById("appointmentDate").value;
    
    
    
        if (!name || !email || !selectedTime || !selectedDate) {
    
            document.getElementById("confirmation").textContent = "Please fill out all fields!";
    
            return;
    
        }
    
    
    
        fetch("http://localhost:4000/book-appointment", {
    
            method: "POST",
    
            headers: { "Content-Type": "application/json" },
    
            body: JSON.stringify({
    
                customerName: name,
    
                customerEmail: email,
    
                appointmentDate: selectedDate,
    
                appointmentTime: selectedTime
    
            })
    
        })
    
        .then(response => response.json())
    
        .then(data => {
    
            if (data.error) {
    
                document.getElementById("confirmation").textContent = data.error;
    
            } else {
    
                document.getElementById("confirmation").textContent =
    
                    `Appointment booked for ${name} at ${selectedTime} on ${selectedDate}. Confirmation sent to ${email}.`;
    
                loadAvailableTimes(selectedDate); // Refresh dropdown
    
                document.getElementById("appointmentForm").reset();
    
            }
    
        })
    
        .catch(error => console.error("Error booking appointment:", error));
    
    });
    window.addEventListener("DOMContentLoaded", () => {
        const selectedDate = document.getElementById("appointmentDate").value;
        if (selectedDate) {
            loadAvailableTimes(selectedDate);
        }
    });
    
