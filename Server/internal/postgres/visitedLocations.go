package postgres

import (
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"fmt"
	"log"
	"strings"
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
	var inserts strings.Builder

	for _, location := range locationsToSave {
		if inserts.Len() > 0 {
			inserts.WriteString(", ")
		}
		inserts.WriteString(fmt.Sprintf("('%s', %v)", location.GNIS_ID, location.Color_ID))
	}

	var fullQuery strings.Builder

	fullQuery.WriteString("INSERT INTO visited_locations (gnis_id, color_id) VALUES " + inserts.String() + ";")

	_, err = db.Query(fullQuery.String())
	if err != nil {
		log.Println(err)
		log.Printf("Query: %s", fullQuery.String())
		return
	}

	return
}

func DeleteVisitedLocations(db *sql.DB, locationsToDelete []structs.VisitedLocation) (err error) {
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

	_, err = db.Query(fullQuery.String())
	if err != nil {
		log.Println(err)
		log.Printf("Query: %s", fullQuery.String())
		return
	}

	return
}
