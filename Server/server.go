package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.Handle("/visited", &visitedHandler{})
	mux.Handle("/visited/", &visitedHandler{})

	http.ListenAndServe("localhost:8080", mux)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
}

type visitedHandler struct{}

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

	var visited []string

	if err := json.NewDecoder(r.Body).Decode(&visited); err != nil {
		fmt.Println(err)
		InternalServerErrorHandler(w, r)
		return
	}

	fmt.Print(visited)

	jsonBytes, err := json.Marshal(visited)
	if err != nil {
		InternalServerErrorHandler(w, r)
		return
	}

	w.Write(jsonBytes)
}
