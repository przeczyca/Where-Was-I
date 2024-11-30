package postgres

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectToDB() (db *sql.DB) {
	var conninfo string = os.Getenv("DATABASE")

	db, err := sql.Open("postgres", conninfo)
	if err != nil {
		log.Fatal(err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}

	return
}
