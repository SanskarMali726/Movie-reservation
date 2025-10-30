package main

import (
	"database/sql"
	"fmt"
	"log"
	"github.com/sanskarmali726/movie-reservation/config"
	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB{
	dbConfig := config.LoadDBConfig()

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",dbConfig.DBHost, dbConfig.DBPort, dbConfig.DBUser, dbConfig.DBPassword, dbConfig.DBName, dbConfig.SSLMode)

	db , err := sql.Open("postgres",psqlInfo)
	if err != nil{
		log.Fatalln("Errro while Opening database",err)
	}

	err = db.Ping()
	if err != nil{
		log.Fatalln("Error while connecting database ",err)
	}

	fmt.Println("Database connected successfully")

	return db;
}