package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func writeJSONError(w http.ResponseWriter, message string, statusCode int) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(map[string]string{
        "error": message,
    })
}

func Login(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPost {
        writeJSONError(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

	var req Users
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil{
		writeJSONError(w, "invalid request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var user Users
	err = db.QueryRow("SELECT password_hash, role FROM users WHERE email = $1",req.Email).Scan(&user.Password,&user.Role)
	if err != nil{
		if err == sql.ErrNoRows{
			writeJSONError(w, "Invalid Email or Password", http.StatusUnauthorized)
			return
		}
		writeJSONError(w, "internal server error", http.StatusInternalServerError)
		return
	}
	
	err = bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(req.Password))
	if err != nil{
		writeJSONError(w, "Invalid Email or Password", http.StatusUnauthorized)
		return
	}

	if req.Role != user.Role{
		writeJSONError(w, "select correct role", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
    	"message": "login successful",
	})
}

func Signup(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPost{
		writeJSONError(w,"Invalid request method",http.StatusMethodNotAllowed)
		return
	}

	var user Users
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil{
		writeJSONError(w,"Invalid Request",http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT FROM users WHERE email=$1)", user.Email).Scan(&exists)
	if err != nil {
		writeJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}
	if exists {
		writeJSONError(w, "Email already exists", http.StatusConflict) // 409
		return
	}
	
	user.Created_at = time.Now()
	user.Updated_at = time.Now()
	hashed_password,err := bcrypt.GenerateFromPassword([]byte(user.Password),bcrypt.DefaultCost)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	_,err = db.Exec("INSERT INTO users(name,email,password_hash,role,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6)",user.Name,user.Email,hashed_password,user.Role,user.Created_at,user.Updated_at)
	if err != nil{
		writeJSONError(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message":"data saved succesfully",
	})

}