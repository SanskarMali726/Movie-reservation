// ==================== Showtime Modal Functionality ====================

// Initialize showtime modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeShowtimeModal();
});

// ==================== Initialize Modal ====================
function initializeShowtimeModal() {
    const addShowtimeBtn = document.getElementById('addShowtimeBtn');
    const showtimeModal = document.getElementById('showtimeModal');
    const closeShowtimeModal = document.getElementById('closeShowtimeModal');
    const cancelShowtime = document.getElementById('cancelShowtime');
    const showtimeForm = document.getElementById('addShowtimeForm');
    const screenSelect = document.getElementById('showtimeScreen');
    const repeatRadios = document.querySelectorAll('input[name="repeatDays"]');
    
    // Open modal
    if (addShowtimeBtn) {
        addShowtimeBtn.addEventListener('click', function() {
            showtimeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            loadMoviesForShowtime();
            setMinDate();
        });
    }
    
    // Close modal
    function closeModal() {
        showtimeModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetShowtimeForm();
    }
    
    if (closeShowtimeModal) {
        closeShowtimeModal.addEventListener('click', closeModal);
    }
    
    if (cancelShowtime) {
        cancelShowtime.addEventListener('click', closeModal);
    }
    
    // Close on overlay click
    showtimeModal.addEventListener('click', function(e) {
        if (e.target === showtimeModal) {
            closeModal();
        }
    });
    
    // Screen selection - auto-fill seats
    if (screenSelect) {
        screenSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const seats = selectedOption.getAttribute('data-seats');
            
            if (seats) {
                document.getElementById('totalSeats').value = seats;
                document.getElementById('totalSeatsDisplay').textContent = seats;
                document.getElementById('seatInfo').style.display = 'flex';
            } else {
                document.getElementById('totalSeats').value = '';
                document.getElementById('seatInfo').style.display = 'none';
            }
        });
    }
    
    // Repeat days radio buttons
    repeatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const customDaysInput = document.getElementById('customDaysInput');
            const repeatInfoText = document.getElementById('repeatInfoText');
            
            if (this.value === 'custom') {
                customDaysInput.classList.add('active');
                document.getElementById('customDays').required = true;
            } else {
                customDaysInput.classList.remove('active');
                document.getElementById('customDays').required = false;
                const days = parseInt(this.value);
                updateRepeatInfo(days);
            }
        });
    });
    
    // Custom days input
    const customDaysInput = document.getElementById('customDays');
    if (customDaysInput) {
        customDaysInput.addEventListener('input', function() {
            if (this.value) {
                updateRepeatInfo(parseInt(this.value));
            }
        });
    }
    
    // Form submission
    if (showtimeForm) {
        showtimeForm.addEventListener('submit', handleShowtimeSubmit);
    }
}

// ==================== Set Minimum Date (Today) ====================
function setMinDate() {
    const showDateInput = document.getElementById('showDate');
    const today = new Date().toISOString().split('T')[0];
    showDateInput.min = today;
    showDateInput.value = today;
}

// ==================== Update Repeat Info Text ====================
function updateRepeatInfo(days) {
    const repeatInfoText = document.getElementById('repeatInfoText');
    if (days === 1) {
        repeatInfoText.textContent = 'The system will create 1 showtime entry';
    } else {
        repeatInfoText.textContent = `The system will create ${days} showtime entries for consecutive days`;
    }
}

// ==================== Load Movies for Showtime ====================
async function loadMoviesForShowtime() {
    const movieSelect = document.getElementById('showtimeMovie');
    if (!movieSelect) return;
    
    try {
        const response = await fetch('http://localhost:8080/api/getallmovies');
        if (!response.ok) {
            throw new Error('Failed to fetch movies');
        }
        
        const movies = await response.json();
        
        // Clear existing options except the first one
        movieSelect.innerHTML = '<option value="">Choose the movie that will be shown</option>';
        
        // Add movie options
        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            movieSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Failed to load movies. Please refresh the page.', 'error');
    }
}

// ==================== Handle Form Submission ====================
async function handleShowtimeSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const movieId = document.getElementById('showtimeMovie').value;
    const screenId = document.getElementById('showtimeScreen').value;
    const showDate = document.getElementById('showDate').value;
    const showTime = document.getElementById('showTime').value;
    const ticketPrice = document.getElementById('ticketPrice').value;
    const totalSeats = document.getElementById('totalSeats').value;
    
    // Get repeat days
    let repeatDays = 1;
    const selectedRepeat = document.querySelector('input[name="repeatDays"]:checked');
    if (selectedRepeat) {
        if (selectedRepeat.value === 'custom') {
            repeatDays = parseInt(document.getElementById('customDays').value) || 1;
        } else {
            repeatDays = parseInt(selectedRepeat.value);
        }
    }
    
    // Validate
    if (!movieId || !screenId || !showDate || !showTime || !ticketPrice || !totalSeats) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Prepare showtime data
    const showtimeData = {
        movie_id: parseInt(movieId),
        screen_id: parseInt(screenId),
        show_date: showDate,
        show_time: showTime,
        total_seats: parseInt(totalSeats),
        available_seats: parseInt(totalSeats),
        price: parseFloat(ticketPrice),
        repeat_days: repeatDays
    };
    console.log('Submitting showtime data:', showtimeData);
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('.showtime-btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Adding...</span>';

        // Make API call
        const response = await fetch('http://localhost:8080/api/addshowtime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(showtimeData)
        });
        
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add showtime');
        }else{
            showNotification('Showtime added Successefully','success');
        }
    

        
    
        document.getElementById('showtimeModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        resetShowtimeForm();
        
        // Reload showtime s table if function exists
        if (typeof loadShowtimes === 'function') {
            setTimeout(loadShowtimes, 500);
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error adding showtime:', error);
        showNotification(error.message || 'Failed to add showtime. Please try again.', 'error');
        
        // Reset button
        const submitBtn = document.querySelector('.showtime-btn-primary');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Add Showtime</span>';
    }
}

// ==================== Reset Form ====================
function resetShowtimeForm() {
    const form = document.getElementById('addShowtimeForm');
    if (form) {
        form.reset();
    }
    
    // Reset seat info
    document.getElementById('seatInfo').style.display = 'none';
    document.getElementById('totalSeats').value = '';
    
    // Reset custom days
    document.getElementById('customDaysInput').classList.remove('active');
    document.getElementById('customDays').required = false;
    
    // Reset repeat info
    document.getElementById('repeatInfoText').textContent = 'The system will create 1 showtime entry';
    
    // Set default values
    document.getElementById('ticketPrice').value = '150';
    
    // Set minimum date
    setMinDate();
}

// ==================== Utility Functions ====================

// Format date for display
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time for display
function formatTimeForDisplay(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Validate time (prevent past times for today)
function validateShowTime() {
    const showDate = document.getElementById('showDate').value;
    const showTime = document.getElementById('showTime').value;
    
    if (!showDate || !showTime) return true;
    
    const today = new Date().toISOString().split('T')[0];
    if (showDate === today) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (showTime < currentTime) {
            showNotification('Show time cannot be in the past for today', 'error');
            return false;
        }
    }
    
    return true;
}

// Add time validation on change
document.addEventListener('DOMContentLoaded', function() {
    const showTimeInput = document.getElementById('showTime');
    if (showTimeInput) {
        showTimeInput.addEventListener('change', validateShowTime);
    }
});

window.showNotification = function(message, type = "success") {
    const notification = document.getElementById("notification");
    if (!notification) return;
    
    const icon = notification.querySelector(".notification-icon");
    const messageEl = notification.querySelector(".notification-message");
    
    if (type === "success") {
        icon.className = "notification-icon fas fa-check-circle";
        notification.style.background = "linear-gradient(135deg, #46d369 0%, #3ba856 100%)";
    } else {
        icon.className = "notification-icon fas fa-exclamation-circle";
        notification.style.background = "linear-gradient(135deg, #e50914 0%, #b8070f 100%)";
    }
    
    messageEl.textContent = message;
    notification.classList.add("show");
    
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}