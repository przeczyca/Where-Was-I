package httpServer

import (
	"Where-Was-I-Server/internal/api"
	"Where-Was-I-Server/internal/postgres"
	"database/sql"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func StartHttpServer() {

	db := postgres.ConnectToDB()

	mux := http.NewServeMux()

	mux.Handle("/visited", &VisitedHandler{db})
	mux.Handle("/visited/", &VisitedHandler{db})

	mux.Handle("/color", &ColorHandler{db})
	mux.Handle("/color/", &ColorHandler{db})

	handler := cors.AllowAll().Handler(mux)

	http.ListenAndServe(os.Getenv("SERVER_URL"), handler)
}

type VisitedHandler struct {
	db *sql.DB
}

type ColorHandler struct {
	db *sql.DB
}

func InternalServerErrorHandler(w http.ResponseWriter) {
	InternalServerErrorHandlerWithContext(w, "")
}

func InternalServerErrorHandlerWithContext(w http.ResponseWriter, errorContext string) {
	newErrorString := "500 Internal Server Error"
	if len(errorContext) > 0 {
		newErrorString += ": " + errorContext
	}
	http.Error(w, newErrorString, http.StatusInternalServerError)
}

func (h *VisitedHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet:
		if jsonBytes, err := api.GetVisited(h.db); err != nil {
			InternalServerErrorHandlerWithContext(w, "Could not get visited locations")
		} else {
			w.Write(jsonBytes)
		}
	case r.Method == http.MethodPost:
		if jsonBytes, err := api.UpdateVisited(h.db, w, r); err != nil {
			InternalServerErrorHandlerWithContext(w, "Could not update visited locations")
		} else {
			w.Write(jsonBytes)
		}
	}
}

func (h *ColorHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet:
		w.Write(api.GetColors(h.db))
	case r.Method == http.MethodPatch:
		w.Write(api.PatchColor(h.db, w, r))
	}
}
