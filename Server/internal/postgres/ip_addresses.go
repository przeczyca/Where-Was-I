package postgres

import (
	"database/sql"
	"log"
)

func UpdateOrInsert(db *sql.DB, ipAddress string) {
	txn, _ := db.Begin()
	defer txn.Rollback()

	update, _ := txn.Prepare(`UPDATE ip_addresses SET last_visit = CURRENT_TIMESTAMP WHERE ip_address = $1;`)
	insert, _ := txn.Prepare(`INSERT INTO ip_addresses (ip_address, first_visit, last_visit)
									SELECT CAST($1 AS VARCHAR), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
									WHERE NOT EXISTS (SELECT 1 FROM ip_addresses WHERE ip_address = $1);`)

	_, err := update.Exec(ipAddress)
	if err != nil {
		log.Println("Update ip_addresses")
		log.Println(err)
		return
	}
	_, err = insert.Exec(ipAddress)
	if err != nil {
		log.Println("Insert ip_addresses")
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
