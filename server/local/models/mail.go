package models

import (
	"database/sql"
	"time"
)

type Mail struct {
	ID        uint
	FID       sql.NullString `gorm:"column:fid"`
	To        string
	Subject   string
	Body      string
	Error     string
	CreatedAt time.Time
}
