package main

import (
	"Where-Was-I-Server/internal/httpServer"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// default dev path
	envPath := "../internal/configs/.env"
	startupArg := os.Args
	if len(startupArg) > 1 && startupArg[1] == "prod" {
		envPath = "/app/internal/configs/.env"
	}

	err := godotenv.Load(envPath)
	if err != nil {
		log.Fatal(err)
	}

	httpServer.StartHttpServer()
}
