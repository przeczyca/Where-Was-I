package postgres

import (
	"database/sql"
	"log"
)

func UpdateOrInsert(db *sql.DB, ipAddress string, realIP string, forwarded string, remoteAddr string) {
	txn, _ := db.Begin()
	defer txn.Rollback()

	update, _ := txn.Prepare(`UPDATE ip_address SET last_visit = CURRENT_TIMESTAMP WHERE ip_address = $1;`)
	insert, _ := txn.Prepare(`INSERT INTO ip_address (ip_address, x_real_ip, x_forwarded_for, remote_address, first_visit, last_visit)
									SELECT CAST($1 AS VARCHAR), CAST($2 AS VARCHAR), CAST($3 AS VARCHAR), CAST($4 AS VARCHAR), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
									WHERE NOT EXISTS (SELECT 1 FROM ip_address WHERE ip_address = $1);`)

	_, err := update.Exec(ipAddress)
	if err != nil {
		log.Println("Update ip_address")
		log.Println(err)
		return
	}
	_, err = insert.Exec(ipAddress, realIP, forwarded, remoteAddr)
	if err != nil {
		log.Println("Insert ip_address")
		log.Println(err)
		return
	}

	update.Close()
	insert.Close()

	err = txn.Commit()
	if err != nil {
		log.Println(err)
		return
	}
}
