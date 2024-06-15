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
	query := "SELECT gnis_id FROM visited_locations;"

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	return
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

func GetAllColors(db *sql.DB) (rows *sql.Rows) {
	query := "SELECT * FROM colors"

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	return
}

func CreateColors(db *sql.DB, colors []structs.Color) (rows *sql.Rows) {
	var values strings.Builder

	for _, color := range colors {
		if values.Len() > 0 {
			values.WriteString(", ")
		}
		values.WriteString(fmt.Sprintf("('%s', '%s')", color.Description, color.HexValue))
	}

	var fullQuery strings.Builder

	fullQuery.WriteString("INSERT INTO colors (description, hex_value) VALUES " + values.String() + ";")

	rows, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}

	return
}

func UpdateColors(db *sql.DB, colors []structs.Color) (rows *sql.Rows) {
	var values strings.Builder

	for _, color := range colors {
		if values.Len() > 0 {
			values.WriteString(", ")
		}
		values.WriteString(fmt.Sprintf("('%s', '%s')", color.Description, color.HexValue))
	}

	var fullQuery strings.Builder

	fullQuery.WriteString(
		`UPDATE colors 
		SET description = newColor.newDescription, hex_value = newColor.newHex_value 
		FROM ( 
			VALUES ` +
			values.String() +
			`) AS newColor(color_id, newDescription, newHex_value) 
		WHERE color.color_id = newColor.color_id;`,
	)

	rows, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}

	return
}

func DeleteColors(db *sql.DB, colors []structs.Color) (rows *sql.Rows) {
	var color_ids strings.Builder

	for _, color := range colors {
		if color_ids.Len() > 0 {
			color_ids.WriteString(", ")
		}
		color_ids.WriteString(fmt.Sprintf("('%d')", color.Color_ID))
	}

	var fullQuery strings.Builder

	fullQuery.WriteString(
		`DELETE FROM colors
		WHERE color_id IN (` + color_ids.String() + `);`,
	)

	rows, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}

	return
}
