package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type DBconfig struct {
	DBUser     string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string
	SSLMode    string
}
	
func LoadDBConfig() *DBconfig {
	err := godotenv.Load(".env")
	if err != nil{
		log.Fatal(err)
	}

	return &DBconfig{
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		SSLMode:    os.Getenv("SSL_MODE"),
	}
}
