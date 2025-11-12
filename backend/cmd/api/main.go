package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/cors"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var db *sql.DB

func main() {
	err :=godotenv.Load(".env")
	if err != nil{
		log.Fatalln("Error while loading env",err)
	}
	port := os.Getenv("SERVER_PORT")

	db = ConnectDB()

	router := mux.NewRouter()
	
	router.HandleFunc("/api/login",Login).Methods("POST")
	router.HandleFunc("/api/signup",Signup).Methods("POST")
	router.HandleFunc("/api/addposter",Addposter).Methods("POST")
	router.HandleFunc("/api/addmovie",Addmovie).Methods("POST")
	router.HandleFunc("/api/totalmovie",TotalMovies).Methods("GET")
	router.HandleFunc("/api/totalusers",TotalUsers).Methods("GET")
	router.HandleFunc("/api/getallmovies",GetAllMovies).Methods("GET")
	router.HandleFunc("/api/updateposter/{id}",UpdateMoviePoster).Methods("PUT")
	router.HandleFunc("/api/updatemovie/{id}",EditMovie).Methods("PUT")
	router.HandleFunc("/api/deletemovie/{id}",DeleteMovies).Methods("DELETE")


	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/login.html")
	})
	
	router.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/signup.html")
	})

	router.PathPrefix("/public/").Handler(
    http.StripPrefix("/public/", http.FileServer(http.Dir("./frontend/public/"))),
)

	

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},  
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	fmt.Println("started to listen and serve",port)
	err = http.ListenAndServe(port,handler)
	if err != nil{
		log.Fatal(err)
	}

}