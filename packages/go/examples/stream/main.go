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

	// Synthesize speech with streaming
	chunkChan, err := client.SynthesizeStream(flowtts.SynthesizeOptions{
		Text:  "你好，世界！这是一个流式合成的示例。",
		Voice: "v-female-R2s4N9qJ",
	})
	if err != nil {
		log.Fatal(err)
	}

	// Collect chunks
	var audioData []byte
	totalChunks := 0

	for chunk := range chunkChan {
		switch chunk.Type {
		case "audio":
			fmt.Printf("Received audio chunk #%d (%d bytes)\n", chunk.Sequence, len(chunk.Data))
			audioData = append(audioData, chunk.Data...)
			totalChunks++

		case "end":
			fmt.Printf("Stream complete: %d total chunks\n", chunk.TotalChunks)
			fmt.Printf("RequestID: %s\n", chunk.RequestID)

		case "error":
			log.Fatal("Stream error")
		}
	}

	// Save to file
	if len(audioData) > 0 {
		if err := os.WriteFile("output-stream.pcm", audioData, 0644); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Saved %d bytes to output-stream.pcm\n", len(audioData))
	}
}
