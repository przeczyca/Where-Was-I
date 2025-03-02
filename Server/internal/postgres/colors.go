package postgres

import (
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"log"
)

func GetAllColors(db *sql.DB) (rows *sql.Rows, err error) {
	query := "SELECT * FROM colors;"

	rows, err = db.Query(query)
	if err != nil {
		log.Println(err)
		return
	}

	return
}

func PatchColor(db *sql.DB, colors []structs.Color) (rows *sql.Rows, err error) {
	txn, err := db.Begin()
	if err != nil {
		log.Println(err)
		return
	}
	defer txn.Rollback()

	newColorsStmt, err := txn.Prepare("INSERT INTO colors (description, hex_value) VALUES ($1, $2)")
	if err != nil {
		log.Println(err)
		return
	}

	updateColorsStmt, err := txn.Prepare(
		`UPDATE colors
		SET description = $2, hex_value = $3
		WHERE colors.color_id = $1`,
	)
	if err != nil {
		log.Println(err)
		return
	}

	deleteColorStmt, err := txn.Prepare(
		`DELETE FROM colors
		WHERE color_id = $1`,
	)
	if err != nil {
		log.Println(err)
		return
	}

	updateVisitedStmt, err := txn.Prepare(
		`UPDATE visited_locations SET color_id = 1
		WHERE color_id = $1`,
	)
	if err != nil {
		log.Println(err)
		return
	}

	for _, color := range colors {
		if color.Action == "created" {
			_, err = newColorsStmt.Exec(color.Description, color.HexValue)
			if err != nil {
				log.Println(err)
				return
			}
		} else if color.Action == "updated" {
			_, err = updateColorsStmt.Exec(color.Color_ID, color.Description, color.HexValue)
			if err != nil {
				log.Println(err)
				return
			}
		} else if color.Action == "deleted" {
			_, err = deleteColorStmt.Exec(color.Color_ID)
			if err != nil {
				log.Println(err)
				return
			}
			_, err = updateVisitedStmt.Exec(color.Color_ID)
			if err != nil {
				log.Println(err)
				return
			}
		}
	}

	err = newColorsStmt.Close()
	if err != nil {
		log.Println(err)
		return
	}
	err = updateColorsStmt.Close()
	if err != nil {
		log.Println(err)
		return
	}
	err = deleteColorStmt.Close()
	if err != nil {
		log.Println(err)
		return
	}
	err = updateVisitedStmt.Close()
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
