package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

func Addmovie(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var input Input

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		writeJSONError(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	parsedDate, err := time.Parse("2006-01-02", input.ReleaseDate)
	if err != nil {
		writeJSONError(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	movie := &Movies{
		Title:       input.Title,
		Description: input.Description,
		Genre:       input.Genre,
		Duration:    input.Duration,
		ReleaseDate: parsedDate,
		PosterURL:   input.PosterURL,
		Rating:      input.Rating,
		Language:    input.Language,
		Status:      input.Status,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = db.Exec(`INSERT INTO movies(
    title, description, genre, duration, release_date, poster_url, rating, language, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		movie.Title, movie.Description, movie.Genre, movie.Duration,
		movie.ReleaseDate, movie.PosterURL, movie.Rating, movie.Language,
		movie.Status, movie.CreatedAt, movie.UpdatedAt)
	if err != nil {
		writeJSONError(w, "Internal Server Error at query execution", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Movie added successfully",
	})

}

func Addposter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10<<20) //Max size of image is 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		writeJSONError(w, "File too large or invalid form data", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("poster")
	if err != nil {
		writeJSONError(w, "Poster file is Required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		writeJSONError(w, "Only JPG, JPEG and PNG files are allowed", http.StatusBadRequest)
		return
	}

	uploadpath := filepath.Join("frontend", "public", "uploads")
	err = os.MkdirAll(uploadpath, os.ModePerm)
	if err != nil {
		writeJSONError(w, "Could Not Create File", http.StatusInternalServerError)
		return
	}

	newfilename := fmt.Sprintf("poster_%d%v", time.Now().UnixNano(), ext)
	savePath := filepath.Join(uploadpath, newfilename)

	dst, err := os.Create(savePath)
	if err != nil {
		writeJSONError(w, "Failed to save poster", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		writeJSONError(w, "Failed to wrtie file", http.StatusInternalServerError)
		return
	}

	posterURL := "/uploads/" + newfilename
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"poster_url": posterURL,
	})
}

func EditMovie(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		writeJSONError(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	var input Input
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	defer r.Body.Close()

	vars := mux.Vars(r)
	id := vars["id"]

	movieID, err := strconv.Atoi(id)
	if err != nil {
		writeJSONError(w, "Invalid Movie ID", http.StatusBadRequest)
		return
	}

	parsedDate, err := time.Parse("2006-01-02", input.ReleaseDate)
	if err != nil {
		writeJSONError(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	movie := &Movies{
		Title:       input.Title,
		Description: input.Description,
		Genre:       input.Genre,
		Duration:    input.Duration,
		ReleaseDate: parsedDate,
		PosterURL:   input.PosterURL,
		Rating:      input.Rating,
		Language:    input.Language,
		UpdatedAt:   time.Now(),
	}

	_, err = db.Exec(`
        UPDATE movies
        SET title =$1, genre =$2, rating =$3, release_date =$4,description =$5,duration =$6,language =$7,updated_at=$8,poster_url=$9
        WHERE id= $10 `, movie.Title, movie.Genre, movie.Rating, movie.ReleaseDate, movie.Description, movie.Duration, movie.Language, movie.UpdatedAt, movie.PosterURL, movieID)
	if err != nil {
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Movie Updated successfully",
	})

}

func TotalMovies(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, "Ivalid Method", http.StatusMethodNotAllowed)
		return
	}

	var count int
	err := db.QueryRow("SELECT COUNT(id) FROM movies").Scan(&count)
	if err != nil {
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{
		"total_movies": count,
	})

}

func TotalUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, "Ivalid Method", http.StatusMethodNotAllowed)
		return
	}

	var count int
	err := db.QueryRow("SELECT COUNT(id) FROM users WHERE role ='user'").Scan(&count)
	if err != nil {
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{
		"total_users": count,
	})
}

func DeleteMovies(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		writeJSONError(w, "Ivalid Method", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	id := vars["id"]

	movieID, err := strconv.Atoi(id)

	if err != nil {
		writeJSONError(w, "Invalid Movie ID", http.StatusBadRequest)
		fmt.Println(err)
		fmt.Println(id)
		return
	}

	var oldPoster string

	err = db.QueryRow(`SELECT poster_url FROM movies WHERE id = $1`, movieID).Scan(&oldPoster)
	if err != nil {
		writeJSONError(w, "Movie Not Found", http.StatusNotFound)
		return
	}

	_, err = db.Exec(`DELETE FROM movies WHERE id = $1`, movieID)
	if err != nil {
		writeJSONError(w, "Internal server Error", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	if oldPoster != "" {
		oldFilePath := filepath.Join("frontend", "public", oldPoster)
		_, err := os.Stat(oldFilePath)
		if err == nil {
			os.Remove(oldFilePath)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "movie deleted successfully",
	})
}

func GetAllMovies(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query("SELECT id, title, genre,description, rating, duration, release_date ,poster_url,language FROM movies")
	if err != nil {
		writeJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var movies []Movies

	for rows.Next() {
		var m Movies
		err = rows.Scan(&m.Id, &m.Title, &m.Genre, &m.Description, &m.Rating, &m.Duration, &m.ReleaseDate, &m.PosterURL, &m.Language)
		if err != nil {
			writeJSONError(w, "Scan Error", http.StatusInternalServerError)
			return
		}
		movies = append(movies, m)
	}

	json.NewEncoder(w).Encode(movies)
}

func UpdateMoviePoster(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	id := vars["id"]

	movieID, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "Invalid movie ID", http.StatusBadRequest)
		return
	}

	var oldPoster string
	err = db.QueryRow("SELECT poster_url FROM movies WHERE id = $1", movieID).Scan(&oldPoster)
	if err != nil {
		http.Error(w, "Movie not found", http.StatusNotFound)
		return
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("poster")
	if err != nil {
		http.Error(w, "Poster file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(handler.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		writeJSONError(w, "Only JPG, JPEG and PNG files are allowed", http.StatusBadRequest)
		return
	}

	fileName := fmt.Sprintf("poster_%d%v", time.Now().UnixNano(), ext)
	filePath := filepath.Join("frontend", "public", "uploads", fileName)

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, file)

	newPosterPath := "/uploads/" + fileName
	_, err = db.Exec("UPDATE movies SET poster_url = $1 WHERE id = $2", newPosterPath, movieID)
	if err != nil {
		http.Error(w, "Database update failed", http.StatusInternalServerError)
		return
	}

	if oldPoster != "" {
		oldFilePath := filepath.Join("frontend", "public", oldPoster)
		_, err := os.Stat(oldFilePath)
		if err == nil {
			os.Remove(oldFilePath)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":    "Poster updated successfully",
		"poster_url": newPosterPath,
	})
}

func AddShowtime(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, "Invalid Request Method", http.StatusBadRequest)
		return
	}

	var show Showtime
	err := json.NewDecoder(r.Body).Decode(&show)
	if err != nil {
		writeJSONError(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Validate movie
	var exists bool
	err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM movies WHERE id = $1)`, show.MovieID).Scan(&exists)
	if err != nil || !exists {
		writeJSONError(w, "Movie not found", http.StatusNotFound)
		return
	}

	// Validate screen
	err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM screens WHERE screen_id = $1)`, show.ScreenID).Scan(&exists)
	if err != nil || !exists {
		writeJSONError(w, "Screen not found", http.StatusNotFound)
		return
	}

	// Validate date
	if show.ShowDate == "" {
		writeJSONError(w, "Show date is required", http.StatusBadRequest)
		return
	}
	parsedDate, err := time.Parse("2006-01-02", show.ShowDate)
	if err != nil {
		writeJSONError(w, "Invalid show date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	if parsedDate.Before(today) {
		writeJSONError(w, "Show date cannot be in the past", http.StatusBadRequest)
		return
	}

	// Validate time
	if show.ShowTime == "" {
		writeJSONError(w, "Show time is required", http.StatusBadRequest)
		return
	}

	parsedTime, err := time.Parse("15:04", show.ShowTime)
	if err != nil {
		writeJSONError(w, "Invalid show time format. Use HH:MM", http.StatusBadRequest)
		return
	}

	if parsedDate.Equal(today) {
		now := time.Now()
		showDateTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(),
			parsedTime.Hour(), parsedTime.Minute(), 0, 0, now.Location())

		if showDateTime.Before(now) {
			writeJSONError(w, "Show time cannot be in the past", http.StatusBadRequest)
			return
		}
	}

	// Validate repeat
	if show.RepeatDays < 1 {
		writeJSONError(w, "Repeat days must be at least 1", http.StatusBadRequest)
		return
	}
	if show.RepeatDays > 31 {
		writeJSONError(w, "Repeat days too large (max 31)", http.StatusBadRequest)
		return
	}

	// Get movie duration
	var duration int
	err = db.QueryRow(`SELECT duration FROM movies WHERE id=$1`, show.MovieID).Scan(&duration)
	if err != nil {
		writeJSONError(w, "Movie not found", http.StatusBadRequest)
		return
	}

	endTime := parsedTime.Add(time.Duration(duration) * time.Minute)

	checkOverlap := func(date string) (bool, error) {
		var overlap bool
		err := db.QueryRow(`
            SELECT EXISTS (
                SELECT 1
                FROM showtimes
                WHERE screen_id = $1
                  AND show_date = $2
                  AND NOT (
                      $4 <= start_time OR $3 >= end_time
                  )
            )`,
			show.ScreenID,
			date,
			parsedTime.Format("15:04"),
			endTime.Format("15:04"),
		).Scan(&overlap)
		return overlap, err
	}

	insertShowtime := func(date string) error {
		_, err := db.Exec(`
            INSERT INTO showtimes (
                movie_id, screen_id, show_date, start_time, end_time, created_at, updated_at, price
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
			show.MovieID,
			show.ScreenID,
			date,
			show.ShowTime,
			endTime.Format("15:04"),
			time.Now(),
			time.Now(),
			show.Price,
		)
		return err
	}

	// COUNTER: to track successful inserts
	insertedCount := 0

	for i := 0; i < show.RepeatDays; i++ {
		newDate := parsedDate.AddDate(0, 0, i).Format("2006-01-02")

		overlap, err := checkOverlap(newDate)
		if err != nil {
			continue
		}
		if overlap {
			continue
		}

		err = insertShowtime(newDate)
		if err != nil {
			continue
		}

		insertedCount++
	}

	//If NO showtimes were inserted → send error
	if insertedCount == 0 {
		writeJSONError(w, "Showtime Overlap! Cannot add showtime.", http.StatusConflict)
		return
	}

	writeJSONResponse(w, "Showtime(s) Added Successfully", http.StatusCreated)
}

func GetAllShowtime(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query(`
        SELECT 
            s.id,
            s.movie_id,
            m.title AS movie_title,
            s.screen_id,
            sc.total_seats,
			sc.available_seats,
            s.show_date,
            s.start_time,
            s.end_time,
			s.price
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        JOIN screens sc ON s.screen_id = sc.screen_id
        ORDER BY s.show_date, s.start_time;
    `)

	if err != nil {
		writeJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var shows []Showtime

	for rows.Next() {
		var show Showtime
		err = rows.Scan(&show.Id, &show.MovieID, &show.MovieTitle, &show.ScreenID, &show.TotalSeats, &show.AvailableSeats, &show.ShowDate, &show.ShowTime, &show.EndTime, &show.Price)
		if err != nil {
			writeJSONError(w, "Scan Error", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		shows = append(shows, show)
	}

	json.NewEncoder(w).Encode(shows)

}

func DeleteShowtime(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		writeJSONError(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	id := vars["id"]
	showId, err := strconv.Atoi(id)
	if err != nil {
		writeJSONError(w, "Invalid Show ID", http.StatusBadRequest)
		return
	}

	SqlResult, err := db.Exec("DELETE FROM showtimes WHERE id = $1", showId)
	if err != nil {
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := SqlResult.RowsAffected()
	if err != nil {
		writeJSONError(w, "Internal server Error", http.StatusInternalServerError)
		return
	}
	if rowsAffected == 0 {
		writeJSONError(w, "Showtime Not Found", http.StatusNotFound)
		return
	}

	writeJSONResponse(w, "Showtime Deleted Successfully", http.StatusOK)
}

func UpdateShowtime(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPut {
		writeJSONError(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var show Showtime

	err := json.NewDecoder(r.Body).Decode(&show)
	if err != nil {
		fmt.Println(err)
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	vars := mux.Vars(r)
	id := vars["id"]

	showid, err := strconv.Atoi(id)
	if err != nil {
		fmt.Println(err)
		writeJSONError(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Validate movie
	var exists bool
	err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM movies WHERE id = $1)`, show.MovieID).Scan(&exists)
	if err != nil || !exists {
		writeJSONError(w, "Movie not found", http.StatusNotFound)
		return
	}

	// Validate screen
	err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM screens WHERE screen_id = $1)`, show.ScreenID).Scan(&exists)
	if err != nil || !exists {
		writeJSONError(w, "Screen not found", http.StatusNotFound)
		return
	}

	// Validate date
	if show.ShowDate == "" {
		writeJSONError(w, "Show date is required", http.StatusBadRequest)
		return
	}
	parsedDate, err := time.Parse("2006-01-02", show.ShowDate)
	if err != nil {
		writeJSONError(w, "Invalid show date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	if parsedDate.Before(today) {
		writeJSONError(w, "Show date cannot be in the past", http.StatusBadRequest)
		return
	}

	// Validate time
	if show.ShowTime == "" {
		writeJSONError(w, "Show time is required", http.StatusBadRequest)
		return
	}

	parsedTime, err := time.Parse("15:04", show.ShowTime)
	if err != nil {
		writeJSONError(w, "Invalid show time format. Use HH:MM", http.StatusBadRequest)
		return
	}

	if parsedDate.Equal(today) {
		now := time.Now()
		showDateTime := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(),
			parsedTime.Hour(), parsedTime.Minute(), 0, 0, now.Location())

		if showDateTime.Before(now) {
			writeJSONError(w, "Show time cannot be in the past", http.StatusBadRequest)
			return
		}
	}

	// Get movie duration
	var duration int
	err = db.QueryRow(`SELECT duration FROM movies WHERE id=$1`, show.MovieID).Scan(&duration)
	if err != nil {
		writeJSONError(w, "Movie not found", http.StatusBadRequest)
		return
	}

	endTime := parsedTime.Add(time.Duration(duration) * time.Minute)

	var overlap bool
	err = db.QueryRow(`
            SELECT EXISTS (
                SELECT 1
                FROM showtimes
                WHERE screen_id = $1
                  AND show_date = $2
                  AND NOT (
                      $4 <= start_time OR $3 >= end_time
                  )
            )`,
		show.ScreenID,
		show.ShowDate,
		parsedTime.Format("15:04"),
		endTime.Format("15:04"),
	).Scan(&overlap)

	if overlap {
		writeJSONError(w, "Showtime Overlap!,Cannot add show time", http.StatusBadRequest)
		return
	}

	_,err = db.Exec(`UPDATE showtimes 
		SET 
    		movie_id = $1,
    		screen_id = $2,
    		show_date = $3,
    		start_time = $4,
			end_time = $5,
    		price = $6,
    		updated_at = CURRENT_TIMESTAMP
		WHERE 
    	id = $7`,show.MovieID,show.ScreenID,show.ShowDate,show.ShowTime,endTime,show.Price,showid)

	if err != nil {
		fmt.Println(err)
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	writeJSONResponse(w,"Showtime Updated Successfully",http.StatusOK)


}
