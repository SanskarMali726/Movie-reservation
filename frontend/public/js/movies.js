// ==================== Initialize Add Movie Form ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeAddMovieForm();
});

function initializeAddMovieForm() {
    const form = document.getElementById('addMovieForm');
    const posterInput = document.getElementById('moviePoster');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const resetBtn = document.getElementById('resetBtn');
    
    if (!form) return; // Exit if form doesn't exist on this page
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // File upload handling
    posterInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    
    // Reset button
    resetBtn.addEventListener('click', resetForm);
    
    // Real-time preview updates
    document.getElementById('movieTitle').addEventListener('input', updatePreview);
    document.getElementById('movieGenre').addEventListener('change', updatePreview);
    document.getElementById('movieDuration').addEventListener('input', updatePreview);
    document.getElementById('movieRating').addEventListener('input', updatePreview);
    
    // Enter key support (except for textarea)
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            form.requestSubmit();
        }
    });
}

// ==================== Form Submission ====================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const form = e.target;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        // Step 1: Upload poster
        const posterFile = document.getElementById('moviePoster').files[0];
        
        // Validate file before upload
        if (!validateFile(posterFile)) {
            throw new Error('Invalid file. Please select a JPG, JPEG, or PNG image under 5MB.');
        }
        
        const posterUrl = await uploadPoster(posterFile);
        
        if (!posterUrl) {
            throw new Error('Failed to upload poster');
        }
        
        // Step 2: Create movie with poster URL
        const movieData = {
            title: document.getElementById('movieTitle').value.trim(),
            description: document.getElementById('movieDescription').value.trim(),
            genre: document.getElementById('movieGenre').value,
            duration: parseInt(document.getElementById('movieDuration').value),
            rating: parseFloat(document.getElementById('movieRating').value),
            release_date: document.getElementById('movieReleaseDate').value,
            language: document.getElementById('movieLanguage').value.trim(),
            poster_url: posterUrl
        };
        console.log(movieData);
        const success = await addMovie(movieData);
        
        if (success) {
            showNotification('Movie added successfully!', 'success');
            resetForm();
            
            // Update movies grid if on same page
            if (typeof loadMovies === 'function') {
                setTimeout(loadMovies, 1000);
            }
        } else {
            throw new Error('Failed to add movie');
        }
        
    } catch (error) {
        console.error('Error adding movie:', error);
        showNotification(error.message || 'Failed to add movie. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// ==================== Upload Poster API ====================
async function uploadPoster(file) {
    const formData = new FormData();
    formData.append('poster', file);

    try {
        const response = await fetch('http://localhost:8080/api/addposter', {
            method: 'POST',
            body: formData
        });

        // Parse JSON safely
        const data = await response.json();

        // If response is not OK (status != 200–299), show server message
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong on server');
        }

        // Success case: return poster URL directly
        return data.poster_url;

    } catch (err) {
        // This handles both network errors and server messages
        alert('Upload failed: ' + err.message);
        console.error('Error:', err);
        throw err;
    }
}

// ==================== Add Movie API ====================
async function addMovie(movieData) {
    try {
        const response = await fetch('http://localhost:8080/api/addmovie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong on server');
        }

        return true;

    } catch (err) {
        console.error('Error adding movie:', err);
        alert('Failed to add movie: ' + err.message);
        throw err;
    }
}

// ==================== File Validation ====================
function validateFile(file) {
    if (!file) {
        return false;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        return false;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        return false;
    }
    
    return true;
}

// ==================== File Upload Handlers ====================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        if (validateFile(file)) {
            displayFileName(file);
            previewPoster(file);
        } else {
            showNotification('Invalid file. Please select a JPG, JPEG, or PNG image under 5MB.', 'error');
            e.target.value = ''; // Clear the input
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('fileUploadArea').classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('fileUploadArea').classList.remove('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('fileUploadArea').classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            const posterInput = document.getElementById('moviePoster');
            posterInput.files = files;
            displayFileName(file);
            previewPoster(file);
        } else {
            showNotification('Invalid file. Please select a JPG, JPEG, or PNG image under 5MB.', 'error');
        }
    }
}

function displayFileName(file) {
    const fileNameDiv = document.getElementById('fileName');
    const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
    fileNameDiv.textContent = 'Selected: ' + file.name + ' (' + fileSize + ' KB)';
    fileNameDiv.classList.add('show');
}

function previewPoster(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const posterPreview = document.getElementById('posterPreview');
        posterPreview.innerHTML = '<img src="' + e.target.result + '" alt="Poster Preview">';
    };
    
    reader.readAsDataURL(file);
}

// ==================== Real-time Preview Updates ====================
function updatePreview() {
    const title = document.getElementById('movieTitle').value || '-';
    const genre = document.getElementById('movieGenre').value || '-';
    const duration = document.getElementById('movieDuration').value;
    const rating = document.getElementById('movieRating').value;
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewGenre').textContent = genre;
    document.getElementById('previewDuration').textContent = duration ? duration + ' min' : '-';
    document.getElementById('previewRating').textContent = rating ? rating + ' / 5' : '-';
}

// ==================== Reset Form ====================
function resetForm() {
    document.getElementById('addMovieForm').reset();
    
    // Reset poster preview
    const posterPreview = document.getElementById('posterPreview');
    posterPreview.innerHTML = '<i class="fas fa-image"></i><p>No poster selected</p>';
    
    // Reset file name display
    const fileNameDiv = document.getElementById('fileName');
    fileNameDiv.classList.remove('show');
    fileNameDiv.textContent = '';
    
    // Reset preview info
    document.getElementById('previewTitle').textContent = '-';
    document.getElementById('previewGenre').textContent = '-';
    document.getElementById('previewDuration').textContent = '-';
    document.getElementById('previewRating').textContent = '-';
}

// ==================== Notification System ====================
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const messageSpan = notification.querySelector('.notification-message');
    
    messageSpan.textContent = message;
    notification.className = 'notification ' + type + ' show';
    
    // Auto hide after 5 seconds
    setTimeout(function() {
        notification.classList.remove('show');
    }, 5000);
}

// ==================== Input Validation Helpers ====================
document.addEventListener('DOMContentLoaded', function() {
    // Validate rating input (0-5 range)
    const ratingInput = document.getElementById('movieRating');
    if (ratingInput) {
        ratingInput.addEventListener('input', function() {
            if (this.value > 5) this.value = 5;
            if (this.value < 0) this.value = 0;
        });
    }
    
    // Validate duration input (positive numbers only)
   const durationInput = document.getElementById('movieDuration');
    if (durationInput) {
        durationInput.addEventListener('input', function() {
            // Remove any letters or symbols (only numbers allowed)
            this.value = this.value.replace(/[^0-9]/g, '');

            // Allow user to clear input
            if (this.value === '') return;

            // Convert to number and validate
            let val = parseInt(this.value, 10);
            if (isNaN(val) || val < 1) {
                this.value = 1;
            }
        });
    }
});



