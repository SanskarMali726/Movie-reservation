// ==================== Dummy Data ====================
let moviesData = []; // Changed from const to let

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
            
            // Reset form when switching away from add-movie tab
            if (targetTab !== 'add-movie') {
                resetFormToAddMode();
            }
        });
    });
}

// ==================== Sidebar Toggle ====================
function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
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
}

// ==================== Load Movies ====================
async function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    if (!moviesGrid) return;
    
    moviesGrid.innerHTML = '<p>Loading movies...</p>';

    try {
        const response = await fetch("http://localhost:8080/api/getallmovies");
        if (!response.ok) {
            throw new Error("Failed to fetch movies");
        }

        moviesData = await response.json(); // Store data for later editing
        moviesGrid.innerHTML = ''; // Clear loading text

        if (moviesData.length === 0) {
            moviesGrid.innerHTML = '<p>No movies available.</p>';
            return;
        }

        moviesData.forEach(function(movie) {
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        moviesGrid.innerHTML = '<p style="color:red;">Failed to load movies. Please check if the server is running.</p>';
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.cssText = `
        background: #181818;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 280px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        position: relative;
        cursor: pointer;
    `;
    
    // Click handler to open modal
    card.onclick = function(e) {
        // Don't open modal if clicking edit or delete buttons
        if (e.target.closest('.btn-edit') || e.target.closest('.btn-delete')) {
            return;
        }
        openMovieModal(movie);
    };
    
    const posterDiv = document.createElement('div');
    posterDiv.className = 'movie-poster';
    posterDiv.style.cssText = `
        position: relative;
        width: 100%;
        padding-top: 50%;
        overflow: hidden;
        background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
    `;
    
    const gradientOverlay = document.createElement('div');
    gradientOverlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to top, rgba(24, 24, 24, 0.9) 0%, transparent 100%);
        z-index: 1;
        pointer-events: none;
    `;
    posterDiv.appendChild(gradientOverlay);

    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_url
        ? `http://localhost:8080/public${movie.poster_url}`
        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%231a1a1a"/%3E%3Cstop offset="100%25" stop-color="%230a0a0a"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="200" height="300"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14" font-family="Arial"%3ENo Poster%3C/text%3E%3C/svg%3E';

    posterImg.alt = movie.title;
    posterImg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
    `;
    posterImg.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%231a1a1a"/%3E%3Cstop offset="100%25" stop-color="%230a0a0a"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="200" height="300"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14" font-family="Arial"%3ENo Poster%3C/text%3E%3C/svg%3E';
    };
    posterDiv.appendChild(posterImg);
    
    card.onmouseenter = function() {
        posterImg.style.transform = 'scale(1.1)';
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.boxShadow = '0 20px 40px rgba(229, 9, 20, 0.4)';
        this.style.borderColor = 'rgba(229, 9, 20, 0.3)';
    };
    
    card.onmouseleave = function() {
        posterImg.style.transform = 'scale(1)';
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.6)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    };

    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info';
    infoDiv.style.cssText = `
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        background: #181818;
    `;
    
    const titleGenreWrapper = document.createElement('div');
    titleGenreWrapper.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 2px;
    `;
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.title || 'Untitled';
    title.style.cssText = `
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
        letter-spacing: -0.3px;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    
    const genre = document.createElement('div');
    genre.className = 'movie-genre';
    genre.textContent = movie.gener || 'Unknown';
    genre.style.cssText = `
        color: #e50914;
        background: rgba(229, 9, 20, 0.15);
        font-size: 9px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        border: 1px solid rgba(229, 9, 20, 0.3);
        white-space: nowrap;
        flex-shrink: 0;
    `;
    
    titleGenreWrapper.appendChild(title);
    titleGenreWrapper.appendChild(genre);

    const description = document.createElement('p');
    description.className = 'movie-description';
    description.textContent = movie.description || 'No description available.';
    description.style.cssText = `
        color: rgba(255, 255, 255, 0.6);
        font-size: 11px;
        line-height: 1.4;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    `;
    
    const detailsGrid = document.createElement('div');
    detailsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        padding: 6px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin: 4px 0;
    `;
    
    const rating = document.createElement('div');
    rating.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    `;
    rating.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffd700" style="filter: drop-shadow(0 1px 2px rgba(255, 215, 0, 0.3));">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span style="color: #fff; font-weight: 700; font-size: 12px;">${movie.rating || 'N/A'}</span>
        <span style="color: rgba(255, 255, 255, 0.4); font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Rating</span>
    `;
    
    const duration = document.createElement('div');
    duration.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    `;
    duration.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" style="filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        </svg>
        <span style="color: #fff; font-weight: 600; font-size: 11px;">${movie.duration || 'N/A'}</span>
        <span style="color: rgba(255, 255, 255, 0.4); font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span>
    `;
    
    const language = document.createElement('div');
    language.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    `;
    language.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" style="filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span style="color: #fff; font-weight: 600; font-size: 11px;">${movie.language || 'N/A'}</span>
        <span style="color: rgba(255, 255, 255, 0.4); font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Language</span>
    `;
    
    detailsGrid.appendChild(rating);
    detailsGrid.appendChild(duration);
    detailsGrid.appendChild(language);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'movie-actions';
    actionsDiv.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: auto;
    `;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Edit</span>
    `;
    editBtn.style.cssText = `
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.3s ease;
        letter-spacing: 0.3px;
    `;
    editBtn.onmouseenter = function() { 
        this.style.background = 'rgba(255, 255, 255, 0.15)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.1)';
    };
    editBtn.onmouseleave = function() { 
        this.style.background = 'rgba(255, 255, 255, 0.08)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };
    editBtn.onclick = function(e) { 
        e.stopPropagation();
        editMovie(movie.id); 
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        <span>Delete</span>
    `;
    deleteBtn.style.cssText = `
        padding: 8px 12px;
        background: linear-gradient(135deg, #e50914 0%, #b8070f 100%);
        color: #fff;
        border: 1px solid rgba(229, 9, 20, 0.3);
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.3s ease;
        letter-spacing: 0.3px;
        box-shadow: 0 2px 8px rgba(229, 9, 20, 0.3);
    `;
    deleteBtn.onmouseenter = function() { 
        this.style.background = 'linear-gradient(135deg, #f40612 0%, #c80810 100%)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.5)';
    };
    deleteBtn.onmouseleave = function() { 
        this.style.background = 'linear-gradient(135deg, #e50914 0%, #b8070f 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(229, 9, 20, 0.3)';
    };
    deleteBtn.onclick = function(e) { 
        e.stopPropagation();
        deleteMovie(movie.id); 
    };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    infoDiv.appendChild(titleGenreWrapper);
    infoDiv.appendChild(description);
    infoDiv.appendChild(detailsGrid);
    infoDiv.appendChild(actionsDiv);
    
    card.appendChild(posterDiv);
    card.appendChild(infoDiv);
    
    return card;
}

// Modal function to show full movie details
function openMovieModal(movie) {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
        border-radius: 20px;
        max-width: 1000px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(229, 9, 20, 0.2);
        animation: slideUp 0.3s ease;
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    `;
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(229, 9, 20, 0.2);
        border: 1px solid rgba(229, 9, 20, 0.3);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        transition: all 0.3s ease;
        z-index: 10;
    `;
    closeBtn.onmouseenter = function() {
        this.style.background = 'rgba(229, 9, 20, 0.4)';
        this.style.transform = 'scale(1.1)';
    };
    closeBtn.onmouseleave = function() {
        this.style.background = 'rgba(229, 9, 20, 0.2)';
        this.style.transform = 'scale(1)';
    };
    closeBtn.onclick = function() {
        modalBackdrop.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => document.body.removeChild(modalBackdrop), 300);
    };
    
    // Create content wrapper
    const content = document.createElement('div');
    content.style.cssText = `
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 40px;
        padding: 40px;
    `;
    
    // Poster section
    const posterSection = document.createElement('div');
    posterSection.style.cssText = `
        position: relative;
    `;
    
    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_url ? `http://localhost:8080/public${movie.poster_url}` :'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%231a1a1a"/%3E%3Cstop offset="100%25" stop-color="%230a0a0a"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="200" height="300"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14" font-family="Arial"%3ENo Poster%3C/text%3E%3C/svg%3E';
    posterImg.alt = movie.title;
    posterImg.style.cssText = `
        width: 100%;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    posterImg.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%231a1a1a"/%3E%3Cstop offset="100%25" stop-color="%230a0a0a"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="400" height="600"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="20" font-family="Arial"%3ENo Poster%3C/text%3E%3C/svg%3E';
    };
    posterSection.appendChild(posterImg);
    
    // Info section
    const infoSection = document.createElement('div');
    infoSection.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-right: 40px;
    `;
    
    // Title
    const title = document.createElement('h1');
    title.textContent = movie.title || 'Untitled';
    title.style.cssText = `
        color: #fff;
        font-size: 42px;
        font-weight: 800;
        margin: 0;
        line-height: 1.1;
        letter-spacing: -1px;
    `;
    
    // Genre badge
    const genreBadge = document.createElement('div');
    genreBadge.textContent = movie.gener || 'Unknown Genre';
    genreBadge.style.cssText = `
        display: inline-block;
        color: #e50914;
        background: rgba(229, 9, 20, 0.2);
        font-size: 13px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        border: 1px solid rgba(229, 9, 20, 0.4);
        width: fit-content;
    `;
    
    // Details grid
    const detailsGrid = document.createElement('div');
    detailsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    `;
    
    const ratingDetail = document.createElement('div');
    ratingDetail.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffd700">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style="color: #fff; font-weight: 700; font-size: 24px;">${movie.rating || 'N/A'}</span>
            </div>
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Rating</span>
        </div>
    `;
    
    const durationDetail = document.createElement('div');
    durationDetail.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span style="color: #fff; font-weight: 600; font-size: 20px;">${movie.duration || 'N/A'}</span>
            </div>
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Duration</span>
        </div>
    `;
    
    const languageDetail = document.createElement('div');
    languageDetail.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span style="color: #fff; font-weight: 600; font-size: 20px;">${movie.language || 'N/A'}</span>
            </div>
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Language</span>
        </div>
    `;
    
    detailsGrid.appendChild(ratingDetail);
    detailsGrid.appendChild(durationDetail);
    detailsGrid.appendChild(languageDetail);
    
    // Description
    const descriptionSection = document.createElement('div');
    descriptionSection.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    
    const descTitle = document.createElement('h3');
    descTitle.textContent = 'Description';
    descTitle.style.cssText = `
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
    `;
    
    const description = document.createElement('p');
    description.textContent = movie.description || 'No description available.';
    description.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
        line-height: 1.7;
        margin: 0;
    `;
    
    descriptionSection.appendChild(descTitle);
    descriptionSection.appendChild(description);
    
    // Action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.cssText = `
        display: flex;
        gap: 12px;
        margin-top: auto;
        padding-top: 24px;
    `;
    
    const editButton = document.createElement('button');
    editButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Edit Movie</span>
    `;
    editButton.style.cssText = `
        padding: 14px 28px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
        letter-spacing: 0.3px;
    `;
    editButton.onmouseenter = function() {
        this.style.background = 'rgba(255, 255, 255, 0.15)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.1)';
    };
    editButton.onmouseleave = function() {
        this.style.background = 'rgba(255, 255, 255, 0.1)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };
    editButton.onclick = function() {
        document.body.removeChild(modalBackdrop);
        editMovie(movie.id);
    };
    
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        <span>Delete Movie</span>
    `;
    deleteButton.style.cssText = `
        padding: 14px 28px;
        background: linear-gradient(135deg, #e50914 0%, #b8070f 100%);
        color: #fff;
        border: 1px solid rgba(229, 9, 20, 0.4);
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
        letter-spacing: 0.3px;
        box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    `;
    deleteButton.onmouseenter = function() {
        this.style.background = 'linear-gradient(135deg, #f40612 0%, #c80810 100%)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 24px rgba(229, 9, 20, 0.6)';
    };
    deleteButton.onmouseleave = function() {
        this.style.background = 'linear-gradient(135deg, #e50914 0%, #b8070f 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(229, 9, 20, 0.4)';
    };
    deleteButton.onclick = function() {
        document.body.removeChild(modalBackdrop);
        deleteMovie(movie.id);
    };
    
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);
    
    // Assemble info section
    infoSection.appendChild(title);
    infoSection.appendChild(genreBadge);
    infoSection.appendChild(detailsGrid);
    infoSection.appendChild(descriptionSection);
    infoSection.appendChild(actionButtons);
    
    // Assemble content
    content.appendChild(posterSection);
    content.appendChild(infoSection);
    
    // Assemble modal
    modal.appendChild(closeBtn);
    modal.appendChild(content);
    modalBackdrop.appendChild(modal);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Close on backdrop click
    modalBackdrop.onclick = function(e) {
        if (e.target === modalBackdrop) {
            modalBackdrop.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => document.body.removeChild(modalBackdrop), 300);
        }
    };
    
    // Add to body
    document.body.appendChild(modalBackdrop);
}

// ==================== Load Showtimes ====================
function loadShowtimes() {
    const showtimesTable = document.getElementById('showtimesTable');
    if (!showtimesTable) return;
    
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
    
    // Draw Y-axis labels - FIXED
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i;
           ctx.fillText('$' + Math.round(value), padding - 10, y + 5);
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

// ==================== Movie Actions - FIXED ====================
function editMovie(movieId) {
    console.log("Edit movie called with ID:", movieId);
    
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found:", movieId);
        alert("Movie not found");
        return;
    }

    console.log("Found movie:", movie);

    // Switch to Add Movie tab
    const addMovieLink = document.querySelector('[data-tab="add-movie"]');
    if (addMovieLink) {
        addMovieLink.click();
    }

    // Wait a bit for tab to switch, then populate form
    setTimeout(() => {
        // Get form elements
        const titleInput = document.getElementById("movieTitle");
        const genreInput = document.getElementById("movieGenre");
        const descriptionInput = document.getElementById("movieDescription");
        const ratingInput = document.getElementById("movieRating");
        const durationInput = document.getElementById("movieDuration");
        const releaseDateInput = document.getElementById("movieReleaseDate");
        const languageInput = document.getElementById("movieLanguage");

        // Set all form fields
        if (titleInput) titleInput.value = movie.title || "";
        if (genreInput) genreInput.value = movie.gener || "";
        if (descriptionInput) descriptionInput.value = movie.description || "";
        if (ratingInput) ratingInput.value = movie.rating || "";
        
        // Duration - extract just the number if it includes "min"
        let durationValue = movie.duration || "";
        if (typeof durationValue === 'string') {
            durationValue = parseInt(durationValue) || "";
        }
        if (durationInput) durationInput.value = durationValue;
        
        if (releaseDateInput) releaseDateInput.value = movie.release_date || "";
        if (languageInput) languageInput.value = movie.language || "";
        
        // Clear the file input
        const posterInput = document.getElementById("moviePoster");
        if (posterInput) posterInput.value = "";

        // Store movie ID in a hidden field
        let movieIdField = document.getElementById("editMovieId");
        if (!movieIdField) {
            movieIdField = document.createElement("input");
            movieIdField.type = "hidden";
            movieIdField.id = "editMovieId";
            const form = document.getElementById("addMovieForm");
            if (form) form.appendChild(movieIdField);
        }
        movieIdField.value = movieId;

        // Update submit button
        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Movie';
            
            // Remove any existing onclick handlers
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
            
            // Add new event listener
            newSubmitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                updateMovie(movieId);
            });
        }
        
        console.log("Form populated for editing movie ID:", movieId);
    }, 100);
}

async function updateMovie(movieId) {
    console.log("Updating movie ID:", movieId);
    
    // Get form elements
    const titleInput = document.getElementById("movieTitle");
    const genreInput = document.getElementById("movieGenre");
    const descriptionInput = document.getElementById("movieDescription");
    const ratingInput = document.getElementById("movieRating");
    const durationInput = document.getElementById("movieDuration");
    const releaseDateInput = document.getElementById("movieReleaseDate");
    const languageInput = document.getElementById("movieLanguage");
    const posterInput = document.getElementById("moviePoster");

    // Get form values
    const title = titleInput?.value.trim();
    const genre = genreInput?.value.trim();
    const description = descriptionInput?.value.trim();
    const rating = parseFloat(ratingInput?.value);
    const duration = parseInt(durationInput?.value);
    const releaseDate = releaseDateInput?.value.trim();
    const language = languageInput?.value.trim();
    const posterFile = posterInput?.files[0];

    // Validation
    if (!title || !genre || !description || isNaN(rating) || isNaN(duration) || !releaseDate || !language) {
        alert("Please fill all fields correctly");
        console.error("Validation failed:", { title, genre, description, rating, duration, releaseDate, language });
        return;
    }

    try {
        // Get current movie data to preserve poster_url
        const currentMovie = moviesData.find(m => m.id === movieId);
        let posterUrl = currentMovie?.poster_url || null;
        
        console.log("Current movie poster_url:", posterUrl);

        // Upload new poster if selected
        if (posterFile) {
            console.log("Uploading new poster...");
            const formData = new FormData();
            formData.append("poster", posterFile);

            const posterResponse = await fetch(`http://localhost:8080/api/updateposter/${movieId}`, {
                method: "PUT",
                body: formData
            });

            if (!posterResponse.ok) {
                throw new Error("Failed to upload poster");
            }

            const posterData = await posterResponse.json();
            posterUrl = posterData.posterUrl || posterData.poster_url;
            console.log("New poster uploaded:", posterUrl);
        }

        // Prepare movie data with correct types - MUST include poster_url
        const movieData = {
            title: title,
            gener: genre,  // Note: your backend uses "gener" not "genre"
            description: description,
            rating: rating,  // FLOAT
            duration: duration,  // INTEGER
            release_date: releaseDate,
            language: language,
            poster_url: posterUrl  // CRITICAL: Must include this even if not changed
        };

        console.log("Updated data:", movieData);
        console.log("Data types:", {
            rating: typeof movieData.rating,
            duration: typeof movieData.duration,
            poster_url: movieData.poster_url
        });

        // Send update request
        const response = await fetch(`http://localhost:8080/api/updatemovie/${movieId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(movieData)
        });

        console.log("Update response status:", response.status);
        const responseText = await response.text();
        console.log("Update response:", responseText);

        if (!response.ok) {
            throw new Error(`Failed to update movie: ${responseText}`);
        }

        // Success!
        alert("Movie updated successfully!");
        
        // Reset form
        const form = document.getElementById("addMovieForm");
        if (form) form.reset();
        
        // Remove hidden field
        const movieIdField = document.getElementById("editMovieId");
        if (movieIdField) movieIdField.remove();
        
        // Reset submit button
        resetFormToAddMode();
        
        // Switch back to movies tab and reload
        const moviesLink = document.querySelector('[data-tab="movies"]');
        if (moviesLink) moviesLink.click();
        
        await loadMovies();
        
        console.log("Update completed successfully");

    } catch (error) {
        console.error("Error updating movie:", error);
        alert("Failed to update movie: " + error.message);
    }
}

// Helper function to reset form to "Add" mode
function resetFormToAddMode() {
    const form = document.getElementById("addMovieForm");
    if (form) form.reset();
    
    const movieIdField = document.getElementById("editMovieId");
    if (movieIdField) movieIdField.remove();
    
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Movie';
        
        // Remove update handler and restore add handler
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        // Add back the original add movie handler if you have one
        // newSubmitBtn.addEventListener('click', function(e) {
        //     e.preventDefault();
        //     addMovie(); // Your add movie function
        // });
    }
}

function deleteMovie(id) {
    const movie = moviesData.find(function(m) { return m.id === id; });
    if (movie) {
        if (confirm('Are you sure you want to delete "' + movie.title + '"?')) {
            // Make API call to delete
            fetch(`http://localhost:8080/api/deletemovie/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert('Movie "' + movie.title + '" deleted successfully!');
                    loadMovies(); // Reload after deletion
                } else {
                    alert('Failed to delete movie');
                }
            })
            .catch(error => {
                console.error('Error deleting movie:', error);
                alert('Error deleting movie');
            });
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
            loadShowtimes(); // Reload after deletion
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

function showNotification(message, type = "success") {
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