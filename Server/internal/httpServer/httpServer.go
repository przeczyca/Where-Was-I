package httpServer

import (
	"Where-Was-I-Server/internal/api"
	"Where-Was-I-Server/internal/postgres"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func StartHttpServer() {
	err := godotenv.Load("../internal/configs/.env")
	if err != nil {
		log.Fatal(err)
	}

	db := postgres.ConnectToDB()

	mux := http.NewServeMux()

	mux.Handle("/visited", &VisitedHandler{db})
	mux.Handle("/visited/", &VisitedHandler{db})

	http.ListenAndServe(os.Getenv("SERVER_URL"), mux)
}

type VisitedHandler struct {
	db *sql.DB
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
}

func InternalServerErrorHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte("500 Internal Server Error"))
}

func (h *VisitedHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	switch {
	case r.Method == http.MethodGet:
		w.Write(api.GetVisited(h.db))
	case r.Method == http.MethodPost:
		w.Write(api.UpdateVisited(h.db, w, r))
	}
}
