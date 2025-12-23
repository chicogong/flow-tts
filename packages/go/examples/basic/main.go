package main

import (
	"fmt"
	"log"
	"os"

	flowtts "github.com/chicogong/flow-tts/go"
)

func main() {
	// Get credentials from environment variables
	secretID := os.Getenv("TX_SECRET_ID")
	secretKey := os.Getenv("TX_SECRET_KEY")
	sdkAppID := int64(1400000000) // Replace with your SDK App ID

	if secretID == "" || secretKey == "" {
		log.Fatal("Please set TX_SECRET_ID and TX_SECRET_KEY environment variables")
	}

	// Create client
	client, err := flowtts.NewClient(flowtts.Config{
		SecretID:  secretID,
		SecretKey: secretKey,
		SdkAppID:  sdkAppID,
	})
	if err != nil {
		log.Fatal(err)
	}

	// Synthesize speech
	response, err := client.Synthesize(flowtts.SynthesizeOptions{
		Text:   "你好，世界！",
		Voice:  "v-female-R2s4N9qJ",
		Format: flowtts.AudioFormatWAV,
	})
	if err != nil {
		log.Fatal(err)
	}

	// Save to file
	if err := os.WriteFile("output.wav", response.Audio, 0644); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Generated %d bytes\n", len(response.Audio))
	fmt.Printf("Format: %s\n", response.Format)
	fmt.Printf("RequestID: %s\n", response.RequestID)

	if response.AutoDetected {
		fmt.Printf("Detected language: %s\n", *response.DetectedLanguage)
	}
}
