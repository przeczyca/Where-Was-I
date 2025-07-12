package userTracking

import (
	"Where-Was-I-Server/internal/postgres"
	"database/sql"
	"strings"
)

func SaveIPAddress(db *sql.DB, remoteAddr string) {
	ipAddress := strings.Split(remoteAddr, ":")[0]
	postgres.UpdateOrInsert(db, ipAddress)
}
