package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	db := connectToDB()

	mux := http.NewServeMux()

	mux.Handle("/visited", &visitedHandler{db})
	mux.Handle("/visited/", &visitedHandler{db})

	http.ListenAndServe(os.Getenv("SERVER_URL"), mux)
}

type VisitedLocation struct {
	GNIS_ID string
	Saved   bool
	Action  string
}

func connectToDB() (db *sql.DB) {
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

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
}

type visitedHandler struct {
	db *sql.DB
}

func InternalServerErrorHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("500 Internal Server Error"))
}

func (h *visitedHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	switch {
	case r.Method == http.MethodGet:
		h.GetVisited(w, r)
	case r.Method == http.MethodPost:
		h.UpdateVisited(w, r)
	}
}

// ToDo: Get all visited locations
func (h *visitedHandler) GetVisited(w http.ResponseWriter, r *http.Request) {
	query := "SELECT * FROM visited_locations;"

	rows, err := h.db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var savedLocations []VisitedLocation
	for rows.Next() {
		var location VisitedLocation
		location.Saved = true
		location.Action = "selected"
		if err := rows.Scan(&location.GNIS_ID); err != nil {
			log.Fatal(err)
		}

		savedLocations = append(savedLocations, location)
	}

	jsonBytes, err := json.Marshal(savedLocations)
	if err != nil {
		log.Fatal(err)
	}

	w.Write(jsonBytes)
}

// ToDo: Save selected visited locations
func (h *visitedHandler) UpdateVisited(w http.ResponseWriter, r *http.Request) {
	var visited []VisitedLocation

	if err := json.NewDecoder(r.Body).Decode(&visited); err != nil {
		log.Fatal(err)
		InternalServerErrorHandler(w, r)
		return
	}

	var insertQuery strings.Builder
	var deleteQuery strings.Builder

	var savedIDs []VisitedLocation

	lastIndex := len(visited) - 1
	for index, location := range visited {
		if !location.Saved && location.Action == "selected" {
			insertQuery.WriteString(fmt.Sprintf("('%s')", location.GNIS_ID))
			if index < lastIndex {
				insertQuery.WriteString(", ")
			}
		}
	}

	for index, location := range visited {
		if location.Action == "deleted" {
			deleteQuery.WriteString(fmt.Sprintf("'%s'", location.GNIS_ID))
			if index < lastIndex {
				deleteQuery.WriteString(", ")
			}
		} else {
			savedIDs = append(savedIDs, VisitedLocation{location.GNIS_ID, true, "selected"})
		}
	}

	var fullQuery strings.Builder

	if insertQuery.Len() > 0 {
		fullQuery.WriteString("INSERT INTO visited_locations (gnis_id) VALUES ")
		fullQuery.WriteString(insertQuery.String() + ";")
	}

	if deleteQuery.Len() > 0 {
		fullQuery.WriteString("DELETE FROM visited_locations WHERE gnis_id IN (")
		fullQuery.WriteString(deleteQuery.String() + ");")
	}

	_, err := h.db.Query(fullQuery.String())
	if err != nil {
		log.Fatal(err)
	}

	jsonBytes, err := json.Marshal(savedIDs)
	if err != nil {
		InternalServerErrorHandler(w, r)
		return
	}

	w.Write(jsonBytes)
}
