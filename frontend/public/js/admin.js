// ==================== Dummy Data ====================
const moviesData = [
    {
        id: 1,
        title: "Inception",
        genre: "Sci-Fi, Thriller",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
        icon: "🎬"
    },
    {
        id: 2,
        title: "The Dark Knight",
        genre: "Action, Crime, Drama",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
        icon: "🦇"
    },
    {
        id: 3,
        title: "Interstellar",
        genre: "Adventure, Drama, Sci-Fi",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival on another planet.",
        icon: "🚀"
    },
    {
        id: 4,
        title: "Pulp Fiction",
        genre: "Crime, Drama",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        icon: "🎭"
    },
    {
        id: 5,
        title: "The Matrix",
        genre: "Action, Sci-Fi",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        icon: "💊"
    },
    {
        id: 6,
        title: "The Shawshank Redemption",
        genre: "Drama",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        icon: "🔒"
    }
];

const showtimesData = [
    {
        id: 1,
        movie: "Inception",
        date: "2025-10-20",
        time: "14:00",
        totalSeats: 150,
        availableSeats: 45
    },
    {
        id: 2,
        movie: "The Dark Knight",
        date: "2025-10-20",
        time: "17:30",
        totalSeats: 150,
        availableSeats: 78
    },
    {
        id: 3,
        movie: "Interstellar",
        date: "2025-10-21",
        time: "19:00",
        totalSeats: 200,
        availableSeats: 120
    },
    {
        id: 4,
        movie: "Pulp Fiction",
        date: "2025-10-21",
        time: "21:00",
        totalSeats: 100,
        availableSeats: 23
    },
    {
        id: 5,
        movie: "The Matrix",
        date: "2025-10-22",
        time: "15:30",
        totalSeats: 180,
        availableSeats: 156
    },
    {
        id: 6,
        movie: "Inception",
        date: "2025-10-22",
        time: "20:00",
        totalSeats: 150,
        availableSeats: 12
    },
    {
        id: 7,
        movie: "The Shawshank Redemption",
        date: "2025-10-23",
        time: "18:00",
        totalSeats: 120,
        availableSeats: 89
    }
];

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard Loaded!');
    initializeNavigation();
    initializeSidebar();
    loadMovies();
    loadShowtimes();
    drawSimpleChart();
    initializeButtons();
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
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'movie-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.onclick = function() { editMovie(movie.id); };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.onclick = function() { deleteMovie(movie.id); };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    infoDiv.appendChild(title);
    infoDiv.appendChild(genre);
    infoDiv.appendChild(description);
    infoDiv.appendChild(actionsDiv);
    
    card.appendChild(posterDiv);
    card.appendChild(infoDiv);
    
    return card;
}

// ==================== Load Showtimes ====================
function loadShowtimes() {
    const showtimesTable = document.getElementById('showtimesTable');
    showtimesTable.innerHTML = '';

    showtimesData.forEach(function(showtime) {
        const row = createShowtimeRow(showtime);
        showtimesTable.appendChild(row);
    });
}

function createShowtimeRow(showtime) {
    const row = document.createElement('tr');
    
    const movieCell = document.createElement('td');
    movieCell.innerHTML = '<strong>' + showtime.movie + '</strong>';
    
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(showtime.date);
    
    const timeCell = document.createElement('td');
    timeCell.textContent = formatTime(showtime.time);
    
    const totalSeatsCell = document.createElement('td');
    totalSeatsCell.textContent = showtime.totalSeats;
    
    const availableSeatsCell = document.createElement('td');
    const availableSpan = document.createElement('span');
    availableSpan.textContent = showtime.availableSeats;
    availableSpan.style.color = showtime.availableSeats < 20 ? '#ffa500' : '#46d369';
    availableSeatsCell.appendChild(availableSpan);
    
    const actionsCell = document.createElement('td');
    actionsCell.className = 'table-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit';
    editBtn.onclick = function() { editShowtime(showtime.id); };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = function() { deleteShowtime(showtime.id); };
    
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    
    row.appendChild(movieCell);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(totalSeatsCell);
    row.appendChild(availableSeatsCell);
    row.appendChild(actionsCell);
    
    return row;
}

// ==================== Simple Chart Drawing ====================
function drawSimpleChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#242424';
    ctx.fillRect(0, 0, width, height);
    
    // Data
    const data = [3200, 4100, 3800, 5200, 4900, 6100, 5800, 6800, 7200, 7500];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data);
    const pointSpacing = chartWidth / (data.length - 1);
    
    // Draw grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw line chart
    ctx.strokeStyle = '#e50914';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight - (data[i] / maxValue) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw points
    for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight - (data[i] / maxValue) * chartHeight;
        
        ctx.fillStyle = '#e50914';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw labels
    ctx.fillStyle = '#b3b3b3';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + i * pointSpacing;
        ctx.fillText(labels[i], x, height - 10);
    }
    
    // Draw Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(' + Math.round(value), padding - 10, y + 5');
    }
}

// ==================== Button Handlers ====================
function initializeButtons() {
    const addMovieBtn = document.getElementById('addMovieBtn');
    const addShowtimeBtn = document.getElementById('addShowtimeBtn');

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', function() {
            alert('Add Movie functionality will be implemented with backend integration.');
        });
    }

    if (addShowtimeBtn) {
        addShowtimeBtn.addEventListener('click', function() {
            alert('Add Showtime functionality will be implemented with backend integration.');
        });
    }
}

// ==================== Movie Actions ====================
function editMovie(id) {
    const movie = moviesData.find(function(m) { return m.id === id; });
    if (movie) {
        alert('Edit Movie: ' + movie.title + '\n\nThis will open a modal form for editing movie details.');
    }
}

function deleteMovie(id) {
    const movie = moviesData.find(function(m) { return m.id === id; });
    if (movie) {
        if (confirm('Are you sure you want to delete "' + movie.title + '"?')) {
            alert('Movie "' + movie.title + '" deleted successfully!');
            // In production, this would make an API call to delete the movie
            // Then reload the movies grid
        }
    }
}

// ==================== Showtime Actions ====================
function editShowtime(id) {
    const showtime = showtimesData.find(function(s) { return s.id === id; });
    if (showtime) {
        alert('Edit Showtime: ' + showtime.movie + '\nDate: ' + showtime.date + '\nTime: ' + showtime.time + '\n\nThis will open a modal form for editing showtime details.');
    }
}

function deleteShowtime(id) {
    const showtime = showtimesData.find(function(s) { return s.id === id; });
    if (showtime) {
        if (confirm('Are you sure you want to delete this showtime for "' + showtime.movie + '"?')) {
            alert('Showtime deleted successfully!');
            // In production, this would make an API call to delete the showtime
            // Then reload the showtimes table
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