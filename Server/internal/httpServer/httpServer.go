package httpServer

import (
	"Where-Was-I-Server/internal/api"
	"Where-Was-I-Server/internal/postgres"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func StartHttpServer() {
	err := godotenv.Load("/app/internal/configs/.env")
	if err != nil {
		log.Fatal(err)
	}

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

func InternalServerErrorHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("500 Internal Server Error"))
}

func (h *VisitedHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch {
	case r.Method == http.MethodGet:
		w.Write(api.GetVisited(h.db))
	case r.Method == http.MethodPost:
		w.Write(api.UpdateVisited(h.db, w, r))
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
