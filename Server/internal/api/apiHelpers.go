package api

import (
	"encoding/json"
	"log"
	"net/http"
)

// Example: decodeIncomingJSON(r, &result)
func decodeIncomingJSON(r *http.Request, result any) (err error) {
	if err = json.NewDecoder(r.Body).Decode(result); err != nil {
		log.Println(err)
		return
	}

	return
}
