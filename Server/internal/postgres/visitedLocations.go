package postgres

import (
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"log"

	"github.com/lib/pq"
)

func GetAllVisitedLocations(db *sql.DB) (rows *sql.Rows, err error) {
	query := "SELECT * FROM visited_locations;"

	rows, err = db.Query(query)
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func InsertVisitedLocations(db *sql.DB, locationsToSave []structs.VisitedLocation) (err error) {
	txn, err := db.Begin()
	if err != nil {
		log.Println(err)
		return
	}

	stmt, err := txn.Prepare(pq.CopyIn("visited_locations", "gnis_id", "color_id"))
	if err != nil {
		log.Println(err)
		return
	}

	for _, location := range locationsToSave {
		_, err = stmt.Exec(location.GNIS_ID, location.Color_ID)
		if err != nil {
			log.Println(err)
			return
		}
	}

	_, err = stmt.Exec()
	if err != nil {
		log.Println(err)
		return
	}

	err = stmt.Close()
	if err != nil {
		log.Println(err)
		return
	}

	err = txn.Commit()
	if err != nil {
		log.Println(err)
		return
	}

	return
}

func DeleteVisitedLocations(db *sql.DB, locationsToDelete []structs.VisitedLocation) (err error) {
	txn, err := db.Begin()
	if err != nil {
		log.Println(err)
		return
	}
	defer txn.Rollback()

	stmt, err := txn.Prepare("DELETE FROM visited_locations WHERE gnis_id = $1")
	if err != nil {
		log.Println(err)
		return
	}

	for _, location := range locationsToDelete {
		_, err = stmt.Exec(location.GNIS_ID)
		if err != nil {
			log.Println(err)
			return
		}
	}

	err = stmt.Close()
	if err != nil {
		log.Println(err)
		return
	}

	err = txn.Commit()
	if err != nil {
		log.Println(err)
		return
	}

	return
}
