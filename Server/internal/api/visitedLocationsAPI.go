package api

import (
	"Where-Was-I-Server/internal/postgres"
	"Where-Was-I-Server/internal/structs"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

type VisitedLocationService interface {
	GetVisited(db *sql.DB) (jsonBytes []byte)
	UpdateVisited(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte)
}

func GetVisited(db *sql.DB) (jsonBytes []byte) {
	rows := postgres.GetAllVisitedLocations(db)
	defer rows.Close()

	jsonBytes, err := json.Marshal(gnis_idsToVisitedLocationsSlice(rows))
	if err != nil {
		log.Fatal(err)
	}

	return
}

func UpdateVisited(db *sql.DB, w http.ResponseWriter, r *http.Request) (jsonBytes []byte) {
	visited := decodeIncomingJSON(w, r)

	locationsToDelete, locationsToSave, savedIDs := filterLocationsToSaveAndDelete(visited)

	if len(locationsToDelete) > 0 {
		postgres.DeleteVisitedLocations(db, locationsToDelete)
	}
	if len(locationsToSave) > 0 {
		postgres.InsertVisitedLocations(db, locationsToSave)
	}

	jsonBytes, err := json.Marshal(savedIDs)
	if err != nil {
		internalServerErrorHandler(w)
		return
	}

	return
}

func internalServerErrorHandler(w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("500 Internal Server Error"))
}

func gnis_idsToVisitedLocationsSlice(rows *sql.Rows) (savedLocations []structs.VisitedLocation) {
	for rows.Next() {
		var location structs.VisitedLocation
		location.Saved = true
		location.Action = "selected"
		if err := rows.Scan(&location.GNIS_ID); err != nil {
			log.Fatal(err)
		}

		savedLocations = append(savedLocations, location)
	}

	return
}

func filterLocationsToSaveAndDelete(visited []structs.VisitedLocation) (locationsToDelete []structs.VisitedLocation, locationsToSave []structs.VisitedLocation, savedIDs []structs.VisitedLocation) {
	for _, location := range visited {
		if location.Action == "selected" {
			savedIDs = append(savedIDs, structs.VisitedLocation{GNIS_ID: location.GNIS_ID, Saved: true, Action: "selected"})
			if !location.Saved {
				locationsToSave = append(locationsToSave, location)
			}
		} else {
			locationsToDelete = append(locationsToDelete, location)
		}
	}

	return
}

func decodeIncomingJSON(w http.ResponseWriter, r *http.Request) (visited []structs.VisitedLocation) {
	if err := json.NewDecoder(r.Body).Decode(&visited); err != nil {
		internalServerErrorHandler(w)
		log.Fatal(err)
	}

	return
}
