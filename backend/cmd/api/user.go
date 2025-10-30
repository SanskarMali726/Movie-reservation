package main

import "time"

type Users struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Role       string `json:"role"`
	Created_at time.Time
	Updated_at time.Time
}
