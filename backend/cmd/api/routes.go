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
		fmt.Println(err)
		return 
	}
	defer r.Body.Close()

	vars := mux.Vars(r)
	id := vars["id"]

	movieID,err := strconv.Atoi(id)
	if err != nil{
		writeJSONError(w,"Invalid Movie ID",http.StatusBadRequest)
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
        WHERE id= '$10' `, movie.Title, movie.Genre, movie.Rating, movie.ReleaseDate,movie.Description,movie.Duration,movie.Language,movie.UpdatedAt,movie.PosterURL,movieID)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		fmt.Println(err)
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

func DeleteMovies(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodDelete{
		writeJSONError(w,"Ivalid Method",http.StatusMethodNotAllowed)
		return
	}
	
	vars := mux.Vars(r)
	id := vars["id"]

	movieID,err := strconv.Atoi(id)
	
	if err != nil{
		writeJSONError(w,"Invalid Movie ID",http.StatusBadRequest)
		fmt.Println(err)
		fmt.Println(id)
		return
	}
	
	
	result,err := db.Exec(`DELETE FROM movies WHERE id = $1`,movieID)
	if err != nil{
		writeJSONError(w,"Internal server Error",http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	rowsAffected, _ := result.RowsAffected()
    if rowsAffected == 0 {
        writeJSONError(w, "Movie not found", http.StatusNotFound)
        return
    }

	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message":"movie deleted successfully",
    })
}

func GetAllMovies(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodGet{
		writeJSONError(w,"Invalid Method",http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query("SELECT id, title, genre,description, rating, duration, release_date ,poster_url,language FROM movies")
    if err != nil {
        writeJSONError(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

	var movies []Movies

	for rows.Next(){
		var m Movies
		err = rows.Scan(&m.Id,&m.Title,&m.Genre,&m.Description, &m.Rating,&m.Duration,&m.ReleaseDate,&m.PosterURL,&m.Language)
		if err != nil{
			writeJSONError(w,"Scan Error",http.StatusInternalServerError)
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

    fileName := fmt.Sprintf("poster_%d%v",time.Now().UnixNano(),ext)
    filePath := filepath.Join("frontend","public", "uploads", fileName)

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
        oldFilePath := filepath.Join("frontend","public", "uploads", oldPoster)
        _, err := os.Stat(oldFilePath)
		if err == nil {
            os.Remove(oldFilePath)
        }
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Poster updated successfully",
        "poster_url":  newPosterPath,
    })
}
