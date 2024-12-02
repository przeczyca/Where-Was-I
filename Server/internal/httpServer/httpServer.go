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

func checkForErrorAndWrite(jsonBytes []byte, err error, w http.ResponseWriter) {
	if err != nil {
		InternalServerErrorHandler(w)
	} else {
		w.Write(jsonBytes)
	}
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
		jsonBytes, err := api.GetVisited(h.db)
		checkForErrorAndWrite(jsonBytes, err, w)
	case r.Method == http.MethodPost:
		jsonBytes, err := api.UpdateVisited(h.db, w, r)
		checkForErrorAndWrite(jsonBytes, err, w)
	}
}

func (h *ColorHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet:
		jsonBytes, err := api.GetColors((h.db))
		checkForErrorAndWrite(jsonBytes, err, w)
	case r.Method == http.MethodPatch:
		jsonBytes, err := api.PatchColor(h.db, w, r)
		checkForErrorAndWrite(jsonBytes, err, w)
	}
}
