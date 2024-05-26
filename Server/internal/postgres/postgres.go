package postgres

import (
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

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

func GetAllVisitedLocations(db *sql.DB) (rows *sql.Rows) {
	query := "SELECT * FROM visited_locations;"

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	return rows
}

func InsertVisitedLocations(db *sql.DB, locationsToSave []structs.VisitedLocation) {
	var inserts strings.Builder

	for _, location := range locationsToSave {
		if inserts.Len() > 0 {
			inserts.WriteString(", ")
		}
		inserts.WriteString(fmt.Sprintf("('%s')", location.GNIS_ID))
	}

	var fullQuery strings.Builder

	fullQuery.WriteString("INSERT INTO visited_locations (gnis_id) VALUES " + inserts.String() + ";")

	_, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}
}

func DeleteVisitedLocations(db *sql.DB, locationsToDelete []structs.VisitedLocation) {
	var deleteQuery strings.Builder

	for _, location := range locationsToDelete {
		if deleteQuery.Len() > 0 {
			deleteQuery.WriteString(", ")
		}
		deleteQuery.WriteString(fmt.Sprintf("'%s'", location.GNIS_ID))
	}

	var fullQuery strings.Builder

	if deleteQuery.Len() > 0 {
		fullQuery.WriteString("DELETE FROM visited_locations WHERE gnis_id IN (")
		fullQuery.WriteString(deleteQuery.String() + ");")
	}

	_, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}
}
