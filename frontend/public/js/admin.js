
let moviesData = []; 

let showtimesData = [];

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

function initializeButtons() {
    const addMovieBtn = document.getElementById('addMovieBtn');

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Clicked on add movie button");
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the add-movie section
            document.getElementById('add-movie-section').classList.add('active');
            
            // Update page title
            document.querySelector('.page-title').textContent = 'Add New Movie';
            
            // Make the sidebar "Add Movie" link active
            const addMovieLink = document.querySelector('.nav-link[data-tab="add-movie"]');
            if (addMovieLink) {
                addMovieLink.classList.add('active');
            }
            
            // Reset form to add mode (clear any edit data)
            resetFormToAddMode();
        });
    }


}

async function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    if (!moviesGrid) return;
    
    moviesGrid.innerHTML = '<p>Loading movies...</p>';

    try {
        const response = await fetch("http://localhost:8080/api/getallmovies");
        if (!response.ok) {
            throw new Error("Failed to fetch movies");
        }

        moviesData = await response.json();
        moviesGrid.innerHTML = '';

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
    
    card.onclick = function(e) {
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
        padding-top: 150%;
        overflow: hidden;
        background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
    `;
    
    const posterImg = document.createElement('img');
    posterImg.src = movie.poster_url ? `http://localhost:8080/public${movie.poster_url}` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%231a1a1a" width="200" height="300"/%3E%3Ctext fill="%23444" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Poster%3C/text%3E%3C/svg%3E';
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
    posterDiv.appendChild(posterImg);
    
    card.onmouseenter = function() {
        posterImg.style.transform = 'scale(1.1)';
        this.style.transform = 'translateY(-8px)';
        this.style.boxShadow = '0 20px 40px rgba(229, 9, 20, 0.4)';
    };
    
    card.onmouseleave = function() {
        posterImg.style.transform = 'scale(1)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.6)';
    };

    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info';
    infoDiv.style.cssText = `padding: 20px;`;
    
    const title = document.createElement('h3');
    title.className = 'movie-title';
    title.textContent = movie.title || 'Untitled';
    
    const genre = document.createElement('div');
    genre.className = 'movie-genre';
    genre.textContent = movie.genre || 'Unknown';
    
    const description = document.createElement('p');
    description.className = 'movie-description';
    description.textContent = movie.description || 'No description available.';
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'movie-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.onclick = function(e) { 
        e.stopPropagation();
        editMovie(movie.id); 
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.onclick = function(e) { 
        e.stopPropagation();
        deleteMovie(movie.id); 
    };
    
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
    genreBadge.textContent = movie.genre || 'Unknown Genre';
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

function editMovie(movieId) { 
    console.log("Edit movie called with ID:", movieId);
    
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found:", movieId);
        alert("Movie not found");
        return;
    }

    const addMovieLink = document.querySelector('[data-tab="add-movie"]');
    if (addMovieLink) {
        addMovieLink.click();
    }

    setTimeout(() => {
        const titleInput = document.getElementById("movieTitle");
        const genreInput = document.getElementById("movieGenre");
        const descriptionInput = document.getElementById("movieDescription");
        const ratingInput = document.getElementById("movieRating");
        const durationInput = document.getElementById("movieDuration");
        const releaseDateInput = document.getElementById("movieReleaseDate");
        const languageInput = document.getElementById("movieLanguage");
        const posterPreview = document.getElementById("posterPreview");

        // ===== Fill form inputs =====
        if (titleInput) titleInput.value = movie.title || "";
        if (genreInput) genreInput.value = movie.genre || "";
        if (descriptionInput) descriptionInput.value = movie.description || "";
        if (ratingInput) ratingInput.value = movie.rating || "";

        let durationValue = movie.duration || "";
        if (typeof durationValue === 'string') {
            durationValue = parseInt(durationValue) || "";
        }
        if (durationInput) durationInput.value = durationValue;

        // Fix release date (convert 2025-12-01T00:00:00Z → 2025-12-01)
        if (releaseDateInput) {
            let rawDate = movie.release_date || "";
            if (rawDate.includes("T")) {
                rawDate = rawDate.slice(0, 10);
            }
            releaseDateInput.value = rawDate;
        }

        if (languageInput) languageInput.value = movie.language || "";

        const posterInput = document.getElementById("moviePoster");
        if (posterInput) posterInput.value = "";  // cannot prefill file input

        // ======== Poster Preview for Edit Mode ========
        if (posterPreview) {
            if (movie.poster_url) {
                posterPreview.innerHTML = `
                    <img src="http://localhost:8080/public${movie.poster_url}" 
                         alt="Poster Preview" class="preview-img">
                `;
            } else {
                posterPreview.innerHTML = "";
            }
        }

        // ======== Update text preview (title, genre, rating, duration) ========
        if (typeof updatePreview === "function") {
            updatePreview();  // live preview without user touching fields
        }

        // ===== Hidden ID to identify edit mode =====
        let movieIdField = document.getElementById("editMovieId");
        if (!movieIdField) {
            movieIdField = document.createElement("input");
            movieIdField.type = "hidden";
            movieIdField.id = "editMovieId";
            const form = document.getElementById("addMovieForm");
            if (form) form.appendChild(movieIdField);
        }
        movieIdField.value = movieId;

        // ===== Replace submit handler with updateMovie() =====
        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Movie';

            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

            newSubmitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                updateMovie(movieId);
            });
        }

        // ===== Optional: Change form title =====
        const formTitle = document.getElementById("movieFormTitle");
        if (formTitle) {
            formTitle.textContent = "Edit Movie";
        }

        console.log("Form populated for editing movie ID:", movieId);

    }, 100);
}

async function updateMovie(movieId) {
    console.log("Updating movie ID:", movieId);
    
    const titleInput = document.getElementById("movieTitle");
    const genreInput = document.getElementById("movieGenre");
    const descriptionInput = document.getElementById("movieDescription");
    const ratingInput = document.getElementById("movieRating");
    const durationInput = document.getElementById("movieDuration");
    const releaseDateInput = document.getElementById("movieReleaseDate");
    const languageInput = document.getElementById("movieLanguage");
    const posterInput = document.getElementById("moviePoster");

    const title = titleInput?.value.trim();
    const genre = genreInput?.value.trim();
    const description = descriptionInput?.value.trim();
    const rating = parseFloat(ratingInput?.value);
    const duration = parseInt(durationInput?.value);
    const releaseDate = releaseDateInput?.value.trim();
    const language = languageInput?.value.trim();
    const posterFile = posterInput?.files[0];

    if (!title || !genre || !description || isNaN(rating) || isNaN(duration) || !releaseDate || !language) {
        alert("Please fill all fields correctly");
        return;
    }

    try {
        const currentMovie = moviesData.find(m => m.id === movieId);
        let posterUrl = currentMovie?.poster_url || null;

        if (posterFile) {
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
        }

        const movieData = {
            title: title,
            genre: genre,  
            description: description,
            rating: rating,
            duration: duration,
            release_date: releaseDate,
            language: language,
            poster_url: posterUrl  
        };

        const response = await fetch(`http://localhost:8080/api/updatemovie/${movieId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            throw new Error("Failed to update movie");
        }

        alert("Movie updated successfully!");
        
        const form = document.getElementById("addMovieForm");
        if (form) form.reset();
        
        const movieIdField = document.getElementById("editMovieId");
        if (movieIdField) movieIdField.remove();
        
        resetFormToAddMode();
        
        const moviesLink = document.querySelector('[data-tab="movies"]');
        if (moviesLink) moviesLink.click();
        
        await loadMovies();
        resetForm();

    } catch (error) {
        console.error("Error updating movie:", error);
        alert("Failed to update movie: " + error.message);
    }
}

function resetFormToAddMode() {
    const form = document.getElementById("addMovieForm");
    if (form) form.reset();
    
    const movieIdField = document.getElementById("editMovieId");
    if (movieIdField) movieIdField.remove();
    
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Movie';
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
    }
}

function deleteMovie(id) {
    const movie = moviesData.find(function(m) { return m.id === id; });
    if (movie) {
        if (confirm('Are you sure you want to delete "' + movie.title + '"?')) {
            fetch(`http://localhost:8080/api/deletemovie/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    alert('Movie deleted successfully!');
                    loadMovies();
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

async function loadShowtimes() {
    const showtimesTable = document.getElementById('showtimesTable');
    if (!showtimesTable) return;

    // Show loading row
    showtimesTable.innerHTML = `
        <tr>
            <td colspan="10" style="text-align:center; padding:10px;">Loading showtimes...</td>
        </tr>
    `;

    try {
        const response = await fetch("http://localhost:8080/api/getallshowtime");
        const data = await response.json();

        showtimesData = data;

        // Clear table
        showtimesTable.innerHTML = "";

        if (!response.ok) {
            showNotification("Failed to load showtimes", "error");
            return;
        }

        // If no data
        if (!Array.isArray(data) || data.length === 0) {
            showtimesTable.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center; padding:10px;">No showtimes found</td>
                </tr>
            `;
            return;
        }

        // Loop and insert rows
        data.forEach(showtime => {
            const row = createShowtimeRow(showtime);
            showtimesTable.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading showtimes:", error);
        showNotification("Error loading showtimes", "error");

        showtimesTable.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:10px;">Error loading data</td>
            </tr>
        `;
    }
}

function createShowtimeRow(showtime) {
    console.log(showtime);
    const row = document.createElement("tr");

    // Movie
    const movieCell = document.createElement("td");
    movieCell.innerHTML = `<strong>${showtime.movie_title}</strong>`;

    // Screen  (use screen_id for now)
    const screenCell = document.createElement("td");
    screenCell.textContent = `Screen ${showtime.screen_id}`;

    // Date
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(showtime.show_date);

    // Time (Start - End)
    const timeCell = document.createElement("td");
    timeCell.textContent =
        `${formatTime(showtime.show_time)} - ${formatTime(showtime.end_time)}`;

    // Total Seats
    const totalSeatsCell = document.createElement("td");
    totalSeatsCell.textContent = showtime.total_seats;

    // Available Seats
    const availableSeatsCell = document.createElement("td");
    const availableSpan = document.createElement("span");
    const availableSeats = showtime.available_seats ?? showtime.total_seats;

    availableSpan.textContent = availableSeats;
    availableSpan.style.color = availableSeats < 20 ? "#ffa500" : "#46d369";
    availableSeatsCell.appendChild(availableSpan);

    // Price
    const priceCell = document.createElement("td");
    priceCell.textContent = `₹${showtime.price}`;

    // Actions
    const actionsCell = document.createElement("td");
    actionsCell.className = "table-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => editShowtime(showtime.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon delete";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteShowtime(showtime.id);

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);

    // Append cells to row in the same order as table headers:
    // Movie | Screen | Date | Time | Total Seats | Available Seats | Price | Actions
    row.appendChild(movieCell);
    row.appendChild(screenCell);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(totalSeatsCell);
    row.appendChild(availableSeatsCell);
    row.appendChild(priceCell);
    row.appendChild(actionsCell);

    return row;
}

function drawSimpleChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#242424';
    ctx.fillRect(0, 0, width, height);
    
    const data = [3200, 4100, 3800, 5200, 4900, 6100, 5800, 6800, 7200, 7500];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data);
    const pointSpacing = chartWidth / (data.length - 1);
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
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
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight - (data[i] / maxValue) * chartHeight;
        
        ctx.fillStyle = '#e50914';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#b3b3b3';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + i * pointSpacing;
        ctx.fillText(labels[i], x, height - 10);
    }
}

function editShowtime(id) {
    alert('Edit Showtime functionality will be implemented.');
}

async function deleteShowtime(id) {
    id = Number(id)
    const showtime = showtimesData.find(s => s.id === id);
    console.log(id)
    if (!showtime) {
        alert("Showtime not found!");
        return;
    }

    if (!confirm("Are you sure you want to delete this showtime?")) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:8080/api/deleteshowtime/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert("Error deleting showtime: " + errorText);
            return;
        }

        alert("Showtime deleted successfully!");

        // Reload the showtime list
        loadShowtimes();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete showtime.");
    }
}

function formatDate(dateString) {
    if (!dateString) return "";

    const d = new Date(dateString);
    if (isNaN(d)) return "";

    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatTime(timeString) {
    if (!timeString) return "";

    // Handle formats like "YYYY-MM-DDTHH:MM:SSZ" and "HH:MM:SS"
    let raw = timeString;

    // If there's a 'T', take the part after it (time portion)
    if (raw.includes("T")) {
        const parts = raw.split("T");
        raw = parts[1] || "";
    }

    // Remove trailing 'Z' if present
    raw = raw.replace("Z", "");

    const [hourStr, minuteStr] = raw.split(":");
    if (!hourStr || !minuteStr) return "";

    let hours = parseInt(hourStr, 10);
    const minutes = minuteStr.padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/';
    }
}

