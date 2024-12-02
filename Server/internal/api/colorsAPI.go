package api

import (
	"Where-Was-I-Server/internal/postgres"
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

func GetColors(db *sql.DB) (jsonBytes []byte, err error) {
	rows := postgres.GetAllColors(db)
	defer rows.Close()

	var colors []structs.Color
	for rows.Next() {
		var color structs.Color
		if err = rows.Scan(&color.Color_ID, &color.Description, &color.HexValue); err != nil {
			log.Println(err)
			return
		}
		if color.Color_ID == 1 {
			color.Action = "default"
		} else {
			color.Action = "saved"
		}
		colors = append(colors, color)
	}

	jsonBytes, err = json.Marshal(colors)
	if err != nil {
		log.Println(err)
		return
	}

	return
}

func PatchColor(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte, err error) {
	var colorsToPatch []structs.Color
	if err = decodeIncomingJSON(r, &colorsToPatch); err != nil {
		log.Println(err)
		return
	}

	response := postgres.PatchColor(db, colorsToPatch)

	jsonBytes, err = json.Marshal(response)
	if err != nil {
		return
	}

	return
}
