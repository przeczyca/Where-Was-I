package postgres

import (
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"fmt"
	"log"
	"strings"
)

func GetAllColors(db *sql.DB) (rows *sql.Rows) {
	query := "SELECT * FROM colors;"

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}

	return
}

func PatchColor(db *sql.DB, colors []structs.Color) (rows *sql.Rows) {
	// Filter colors by action
	var createdColorIds strings.Builder
	var updatedColorIds strings.Builder
	var deletedColorIds strings.Builder

	for _, color := range colors {
		if color.Action == "created" {
			if createdColorIds.Len() > 0 {
				createdColorIds.WriteString(", ")
			}
			createdColorIds.WriteString(fmt.Sprintf("('%s', '%s')", color.Description, color.HexValue))
		} else if color.Action == "updated" {
			if updatedColorIds.Len() > 0 {
				updatedColorIds.WriteString(", ")
			}
			updatedColorIds.WriteString(fmt.Sprintf("(%v, '%s', '%s')", color.Color_ID, color.Description, color.HexValue))
		} else if color.Action == "deleted" {
			if deletedColorIds.Len() > 0 {
				deletedColorIds.WriteString(", ")
			}
			deletedColorIds.WriteString(fmt.Sprintf("('%d')", color.Color_ID))
		}
	}

	// Add new colors
	var fullQuery strings.Builder

	if createdColorIds.Len() > 0 {
		fullQuery.WriteString("INSERT INTO colors (description, hex_value) VALUES " + createdColorIds.String() + ";")
	}

	// Updating existing colors
	if updatedColorIds.Len() > 0 {
		fullQuery.WriteString(
			`UPDATE colors 
			SET description = newColor.newDescription, hex_value = newColor.newHex_value 
			FROM ( 
				VALUES ` +
				updatedColorIds.String() +
				`) AS newColor(color_id, newDescription, newHex_value) 
			WHERE colors.color_id = newColor.color_id;`,
		)
	}

	if deletedColorIds.Len() > 0 {
		// Update all selected areas with colors to delete to default color
		fullQuery.WriteString(
			`UPDATE visited_locations SET color_id = 1
			WHERE color_id IN (` + deletedColorIds.String() + `);`,
		)

		// Delete colors

		fullQuery.WriteString(
			`DELETE FROM colors
			WHERE color_id IN (` + deletedColorIds.String() + `);`,
		)
	}

	rows, err := db.Query(fullQuery.String())
	if err != nil {
		fmt.Println(fullQuery.String())
		log.Fatal(err)
	}

	return
}
