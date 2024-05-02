package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	_ "github.com/lib/pq"
)

func main() {
	db := connectToDB()

	mux := http.NewServeMux()

	mux.Handle("/visited", &visitedHandler{db})
	mux.Handle("/visited/", &visitedHandler{db})

	http.ListenAndServe("localhost:8080", mux)
}

type VisitedLocation struct {
	GNIS_ID string
	Saved   bool
	Action  string
}

func connectToDB() (db *sql.DB) {
	var conninfo string = "postgresql://postgres:TyrantLizard@69@localhost:5432/postgres?sslmode=disable"

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
	fmt.Println("get visited called")
}

// ToDo: Save all visited locations
func (h *visitedHandler) UpdateVisited(w http.ResponseWriter, r *http.Request) {
	fmt.Println("update visited called")

	var visited []VisitedLocation

	if err := json.NewDecoder(r.Body).Decode(&visited); err != nil {
		fmt.Println(err)
		InternalServerErrorHandler(w, r)
		return
	}

	_, err := fmt.Println(visited)
	if err != nil {
		log.Fatal(err)
	}

	var insertQuery strings.Builder
	var deleteQuery strings.Builder

	lastIndex := len(visited) - 1
	for index, location := range visited {
		if !location.Saved && location.Action == "selected" {
			insertQuery.WriteString(fmt.Sprintf("(%s)", location.GNIS_ID))
			if index < lastIndex {
				insertQuery.WriteString(", ")
			}
		}
	}

	for index, location := range visited {
		if location.Action == "deleted" {
			deleteQuery.WriteString(fmt.Sprintf(location.GNIS_ID))
			fmt.Println(index, lastIndex)
			if index < lastIndex {
				deleteQuery.WriteString(", ")
			}
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

	fmt.Println(fullQuery.String())

	_, err = h.db.Query(fullQuery.String())
	if err != nil {
		log.Fatal(err)
	}

	jsonBytes, err := json.Marshal(visited)
	if err != nil {
		InternalServerErrorHandler(w, r)
		return
	}

	w.Write(jsonBytes)
}
