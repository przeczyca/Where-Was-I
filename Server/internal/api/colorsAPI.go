package api

import (
	"Where-Was-I-Server/internal/postgres"
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

func GetColors(db *sql.DB) (jsonBytes []byte) {
	rows := postgres.GetAllColors(db)
	defer rows.Close()

	var colors []structs.Color
	for rows.Next() {
		var color structs.Color
		if err := rows.Scan(&color.Color_ID, &color.Description, &color.HexValue); err != nil {
			log.Fatal(err)
		}
		if color.Color_ID == 1 {
			color.Action = "default"
		} else {
			color.Action = "saved"
		}
		colors = append(colors, color)
	}

	jsonBytes, err := json.Marshal(colors)
	if err != nil {
		log.Fatal(err)
	}

	return
}

func CreateColors(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte) {
	var newColors []structs.Color
	if err := json.NewDecoder(r.Body).Decode(&newColors); err != nil {
		internalServerErrorHandler(w)
		log.Fatal(err)
	}

	response := postgres.CreateColors(db, newColors)

	jsonBytes, err := json.Marshal(response)
	if err != nil {
		internalServerErrorHandler(w)
		return
	}

	return
}

func UpdateColors(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte) {
	var colorsToUpdate []structs.Color
	if err := json.NewDecoder(r.Body).Decode(&colorsToUpdate); err != nil {
		internalServerErrorHandler(w)
		log.Fatal(err)
	}

	response := postgres.UpdateColors(db, colorsToUpdate)

	jsonBytes, err := json.Marshal(response)
	if err != nil {
		internalServerErrorHandler(w)
		return
	}

	return
}

func DeleteColor(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte) {
	var colorsToDelete []structs.Color
	if err := json.NewDecoder(r.Body).Decode(&colorsToDelete); err != nil {
		internalServerErrorHandler(w)
		log.Fatal(err)
	}

	response := postgres.DeleteColors(db, colorsToDelete)

	jsonBytes, err := json.Marshal(response)
	if err != nil {
		internalServerErrorHandler(w)
		return
	}

	return
}

func PatchColor(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte) {
	var colorsToPatch []structs.Color
	if err := json.NewDecoder(r.Body).Decode(&colorsToPatch); err != nil {
		internalServerErrorHandler(w)
		log.Fatal(err)
	}

	response := postgres.PatchColor(db, colorsToPatch)

	jsonBytes, err := json.Marshal(response)
	if err != nil {
		internalServerErrorHandler(w)
		return
	}

	return
}
