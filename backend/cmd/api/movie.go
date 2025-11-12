package main

import "time"

type Movies struct {
	Id          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Genre       string    `json:"genre,omitempty"`
	Duration    int       `json:"duration"`
	ReleaseDate time.Time `json:"release_date,omitempty"`
	PosterURL   string    `json:"poster_url,omitempty"`
	Rating      float32   `json:"rating,omitempty"`
	Language    string    `json:"language,omitempty"`
	Status      string    `json:"status,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Input struct {
	Id          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Genre       string    `json:"genre,omitempty"`
	Duration    int       `json:"duration"`
	ReleaseDate string    `json:"release_date,omitempty"`
	PosterURL   string    `json:"poster_url,omitempty"`
	Rating      float32   `json:"rating,omitempty"`
	Language    string    `json:"language,omitempty"`
	Status      string    `json:"status,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
