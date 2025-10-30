// ==================== Dummy Data ====================
const moviesData = [
    {
        id: 1,
        title: "Inception",
        genre: "Sci-Fi, Thriller",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
        icon: "🎬",
        rating: 4.8,
        price: 15
    },
    {
        id: 2,
        title: "The Dark Knight",
        genre: "Action, Crime, Drama",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
        icon: "🦇",
        rating: 4.9,
        price: 15
    },
    {
        id: 3,
        title: "Interstellar",
        genre: "Adventure, Drama, Sci-Fi",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival on another planet.",
        icon: "🚀",
        rating: 4.7,
        price: 15
    },
    {
        id: 4,
        title: "Pulp Fiction",
        genre: "Crime, Drama",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        icon: "🎭",
        rating: 4.6,
        price: 12
    },
    {
        id: 5,
        title: "The Matrix",
        genre: "Action, Sci-Fi",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        icon: "💊",
        rating: 4.7,
        price: 12
    },
    {
        id: 6,
        title: "The Shawshank Redemption",
        genre: "Drama",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        icon: "🔒",
        rating: 4.9,
        price: 12
    }
];

const reservationsData = [
    {
        id: "BK001",
        movie: "Inception",
        date: "2025-10-20",
        time: "19:00",
        seats: 2,
        status: "upcoming"
    },
    {
        id: "BK002",
        movie: "Interstellar",
        date: "2025-10-22",
        time: "20:00",
        seats: 1,
        status: "upcoming"
    },
    {
        id: "BK003",
        movie: "The Dark Knight",
        date: "2025-10-24",
        time: "21:00",
        seats: 3,
        status: "upcoming"
    },
    {
        id: "BK004",
        movie: "Pulp Fiction",
        date: "2025-10-15",
        time: "18:00",
        seats: 2,
        status: "past"
    },
    {
        id: "BK005",
        movie: "The Matrix",
        date: "2025-10-12",
        time: "19:30",
        seats: 1,
        status: "past"
    }
];

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('User Dashboard Loaded!');
    initializeNavigation();
    initializeSidebar();
    loadMovies();
    loadReservations();
    initializeButtons();
    initializeModal();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// ==================== Update Current Time ====================
function updateCurrentTime() {
    const timeElement = document.querySelector('#currentTime span');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        timeElement.textContent = formattedHours + ':' + formattedMinutes + ':' + formattedSeconds + ' ' + ampm;
    }
}

// ==================== Navigation ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Handle logout separately
            if (link.classList.contains('logout')) {
                handleLogout();
                return;
            }

            const targetTab = link.getAttribute('data-tab');

            // Remove active class from all links and sections
            navLinks.forEach(function(l) {
                l.classList.remove('active');
            });
            sections.forEach(function(s) {
                s.classList.remove('active');
            });

            // Add active class to clicked link and corresponding section
            link.classList.add('active');
            const targetSection = document.getElementById(targetTab + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
                // Update page title
                const titleText = link.querySelector('span').textContent;
                pageTitle.textContent = titleText;
            }
        });
    });
}

// ==================== Sidebar Toggle ====================
function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ==================== Load Movies ====================
function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';

    moviesData.forEach(function(movie) {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterDiv = document.createElement('div');
    posterDiv.className = 'movie-poster';
    posterDiv.textContent = movie.icon;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info';
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.title;
    
    const genre = document.createElement('p');
    genre.className = 'movie-genre';
    genre.textContent = movie.genre;
    
    const description = document.createElement('p');
    description.className = 'movie-description';
    description.textContent = movie.description;
    
    const footer = document.createElement('div');
    footer.className = 'movie-footer';
    
    const rating = document.createElement('div');
    rating.className = 'movie-rating';
    rating.innerHTML = '<i class="fas fa-star"></i> ' + movie.rating;
    
    const bookBtn = document.createElement('button');
    bookBtn.className = 'btn-book';
    bookBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Book Now';
    bookBtn.onclick = function() { openBookingModal(movie); };
    
    footer.appendChild(rating);
    footer.appendChild(bookBtn);
    
    infoDiv.appendChild(title);
    infoDiv.appendChild(genre);
    infoDiv.appendChild(description);
    infoDiv.appendChild(footer);
    
    card.appendChild(posterDiv);
    card.appendChild(infoDiv);
    
    return card;
}

// ==================== Load Reservations ====================
function loadReservations() {
    const reservationsTable = document.getElementById('reservationsTable');
    reservationsTable.innerHTML = '';

    reservationsData.forEach(function(reservation) {
        const row = createReservationRow(reservation);
        reservationsTable.appendChild(row);
    });
}

function createReservationRow(reservation) {
    const row = document.createElement('tr');
    
    const idCell = document.createElement('td');
    idCell.innerHTML = '<strong>' + reservation.id + '</strong>';
    
    const movieCell = document.createElement('td');
    movieCell.textContent = reservation.movie;
    
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(reservation.date);
    
    const timeCell = document.createElement('td');
    timeCell.textContent = formatTime(reservation.time);
    
    const seatsCell = document.createElement('td');
    seatsCell.textContent = reservation.seats;
    
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge status-' + reservation.status;
    statusBadge.textContent = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
    statusCell.appendChild(statusBadge);
    
    const actionsCell = document.createElement('td');
    actionsCell.className = 'table-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn-icon';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.title = 'View Details';
    viewBtn.onclick = function() { viewReservation(reservation.id); };
    
    actionsCell.appendChild(viewBtn);
    
    if (reservation.status === 'upcoming') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-icon cancel';
        cancelBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
        cancelBtn.title = 'Cancel Booking';
        cancelBtn.onclick = function() { cancelReservation(reservation.id); };
        actionsCell.appendChild(cancelBtn);
    }
    
    row.appendChild(idCell);
    row.appendChild(movieCell);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(seatsCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);
    
    return row;
}

// ==================== Modal Functions ====================
function initializeModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.addEventListener('click', function() {
        closeBookingModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeBookingModal();
        }
    });
}

function openBookingModal(movie) {
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalBody');
    
    let seatCount = 1;
    const ticketPrice = movie.price;
    
    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="booking-movie-info">
                <div class="booking-poster">${movie.icon}</div>
                <div class="booking-info">
                    <h4>${movie.title}</h4>
                    <p>${movie.genre}</p>
                    <p><i class="fas fa-star" style="color: #ffa500;"></i> ${movie.rating}/5</p>
                </div>
            </div>
            <div class="seat-selection">
                <label>Select Number of Seats:</label>
                <div class="seat-input">
                    <button class="seat-btn" id="decreaseSeat">-</button>
                    <span class="seat-count" id="seatCount">1</span>
                    <button class="seat-btn" id="increaseSeat">+</button>
                </div>
            </div>
            <div class="booking-summary">
                <div class="summary-row">
                    <span>Ticket Price:</span>
                    <span>$${ticketPrice}</span>
                </div>
                <div class="summary-row">
                    <span>Number of Seats:</span>
                    <span id="summarySeats">1</span>
                </div>
                <div class="summary-row">
                    <span>Total Amount:</span>
                    <span id="totalAmount">$${ticketPrice}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-confirm" id="confirmBooking">Confirm Booking</button>
                <button class="btn-cancel" id="cancelBooking">Cancel</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Add event listeners for seat controls
    document.getElementById('decreaseSeat').addEventListener('click', function() {
        if (seatCount > 1) {
            seatCount--;
            updateBookingSummary(seatCount, ticketPrice);
        }
    });
    
    document.getElementById('increaseSeat').addEventListener('click', function() {
        if (seatCount < 10) {
            seatCount++;
            updateBookingSummary(seatCount, ticketPrice);
        }
    });
    
    document.getElementById('confirmBooking').addEventListener('click', function() {
        confirmBooking(movie, seatCount);
    });
    
    document.getElementById('cancelBooking').addEventListener('click', function() {
        closeBookingModal();
    });
}

function updateBookingSummary(seats, price) {
    document.getElementById('seatCount').textContent = seats;
    document.getElementById('summarySeats').textContent = seats;
    document.getElementById('totalAmount').textContent = '$' + (seats * price);
}

function confirmBooking(movie, seats) {
    alert('Booking Confirmed!\n\nMovie: ' + movie.title + '\nSeats: ' + seats + '\nTotal: $' + (seats * movie.price) + '\n\nYour booking has been confirmed. Check "My Reservations" for details.');
    closeBookingModal();
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
}

// ==================== Button Handlers ====================
function initializeButtons() {
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', function() {
            updateProfile();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                resetProfileForm();
            }
        });
    }
}

function updateProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (!fullName || !email) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    // In production, this would make an API call
    alert('Profile Updated Successfully!\n\nName: ' + fullName + '\nEmail: ' + email);
    
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function resetProfileForm() {
    document.getElementById('fullName').value = 'John Doe';
    document.getElementById('email').value = 'john.doe@example.com';
    document.getElementById('phone').value = '+1 234 567 8900';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// ==================== Reservation Actions ====================
function viewReservation(id) {
    const reservation = reservationsData.find(function(r) { return r.id === id; });
    if (reservation) {
        alert('Booking Details\n\nBooking ID: ' + reservation.id + '\nMovie: ' + reservation.movie + '\nDate: ' + formatDate(reservation.date) + '\nTime: ' + formatTime(reservation.time) + '\nSeats: ' + reservation.seats + '\nStatus: ' + reservation.status.toUpperCase());
    }
}

function cancelReservation(id) {
    const reservation = reservationsData.find(function(r) { return r.id === id; });
    if (reservation) {
        if (confirm('Are you sure you want to cancel booking ' + id + ' for "' + reservation.movie + '"?\n\nThis action cannot be undone.')) {
            alert('Booking ' + id + ' has been cancelled successfully.\n\nRefund will be processed within 3-5 business days.');
            // In production, this would make an API call to cancel the booking
            // Then reload the reservations table
        }
    }
}

// ==================== Utility Functions ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

function formatTime(timeString) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return formattedHour + ':' + minutes + ' ' + ampm;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/';
    }
}