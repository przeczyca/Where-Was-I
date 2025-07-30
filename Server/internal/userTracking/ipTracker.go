package userTracking

import (
	"Where-Was-I-Server/internal/postgres"
	"database/sql"
	"fmt"
	"net/http"
	"strings"
)

func SaveIPAddress(db *sql.DB, r *http.Request) {
	realIP := r.Header.Get("X-Real-IP")
	forwarded := r.Header.Get("X-Forwarded-For")
	remoteAddr := r.RemoteAddr

	ipAddress := ""
	if ipAddress == "" {
		ipAddress = realIP
	}
	if ipAddress == "" {
		forwardedIP := strings.Split(forwarded, ",")[0]
		ipAddress = forwardedIP
	}
	if ipAddress == "" {
		ipAddress = remoteAddr
	}

	fmt.Println("ipAddress: "+ipAddress, len(ipAddress))
	ipAddress = strings.Split(ipAddress, ":")[0]
	postgres.UpdateOrInsert(db, ipAddress, realIP, forwarded, remoteAddr)
}
