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

	jsonBytes, err := json.Marshal(gnis_idsToVisitedLocationsSlice(rows))
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
