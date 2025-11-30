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
	CreatedAt   time.Time 
	UpdatedAt   time.Time 
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
	CreatedAt   time.Time 
	UpdatedAt   time.Time 
}

type Showtime struct {
	MovieID        int    `json:"movie_id"`
	ScreenID       int    `json:"screen_id"`
	ShowDate       string `json:"show_date"`
	ShowTime       string `json:"show_time"`
	TotalSeats     int    `json:"total_seats"`
	AvailableSeats int    `json:"available_seats"`
	Price          int    `json:"price"`
	RepeatDays     int    `json:"repeat_days"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
