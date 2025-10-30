package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)



func Addmovie(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPost{
		writeJSONError(w,"Method Not Allowed",http.StatusMethodNotAllowed)
		return
	}
	var input Input
	
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil{
		writeJSONError(w,"Internal server error",http.StatusInternalServerError)
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
	if err != nil{
		writeJSONError(w,"Internal Server Error at query execution",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Movie added successfully",
	})

}

func Addposter(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPost{
		writeJSONError(w,"Method Not Allowed",http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w,r.Body,10 <<20) //Max size of image is 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil{
		writeJSONError(w,"File too large or invalid form data",http.StatusBadRequest)
		return
	}
	
	file , header , err := r.FormFile("poster")
	if err != nil{
		writeJSONError(w,"Poster file is Required",http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		writeJSONError(w, "Only JPG, JPEG and PNG files are allowed", http.StatusBadRequest)
		return
	}

	uploadpath := filepath.Join("frontend","public","uploads")
	err = os.MkdirAll(uploadpath,os.ModePerm)
	if err != nil{
		writeJSONError(w,"Could Not Create File",http.StatusInternalServerError)
		return
	}

	newfilename := fmt.Sprintf("poster_%d%v",time.Now().UnixNano(),ext)
	savePath := filepath.Join(uploadpath,newfilename)

	dst,err := os.Create(savePath)
	if err != nil{
		writeJSONError(w,"Failed to save poster",http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_,err = io.Copy(dst,file)
	if err != nil{
		writeJSONError(w,"Failed to wrtie file",http.StatusInternalServerError)
		return
	}

	posterURL :=  "/uploads/" + newfilename
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"poster_url": posterURL,
	})
}

func EditMovie(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPut{
		writeJSONError(w,"Invalid Request",http.StatusBadRequest)
		return
	}
	var input Input
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
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
        Status:      input.Status,
        UpdatedAt:   time.Now(),
	}

 	_, err = db.Exec(`
        UPDATE movies
        SET title =$1, genre =$2, rating =$3, relese_date =$4,description =$5,duration =$6,language =$7,updated_at=$8,poster_url=$9
        WHERE id=$10`, movie.Title, movie.Genre, movie.Rating, movie.ReleaseDate,movie.Description,movie.Duration,movie.Language,movie.UpdatedAt,movie.PosterURL)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Movie Updated successfully",
	})

}

func TotalMovies(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodGet{
		writeJSONError(w,"Ivalid Method",http.StatusMethodNotAllowed)
		return
	}

	var count int
	err := db.QueryRow("SELECT COUNT(id) FROM movies").Scan(&count)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]int{
        "total_movies": count,
    })

}

func TotalUsers(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodGet{
		writeJSONError(w,"Ivalid Method",http.StatusMethodNotAllowed)
		return
	}

	var count int
	err := db.QueryRow("SELECT COUNT(id) FROM users WHERE role ='user'").Scan(&count)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]int{
        "total_User": count,
    })
}