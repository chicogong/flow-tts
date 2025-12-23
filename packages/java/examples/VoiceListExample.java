import com.flowtts.FlowTTS;
import com.flowtts.FlowTTSConfig;
import com.flowtts.model.Voice;

import java.util.List;

/**
 * Example of listing available voices.
 */
public class VoiceListExample {
    public static void main(String[] args) {
        // Create a minimal config (credentials not needed for voice listing)
        FlowTTSConfig config = FlowTTSConfig.builder()
                .secretId("dummy")
                .secretKey("dummy")
                .sdkAppId(1)
                .build();

        FlowTTS client = new FlowTTS(config);

        try {
            // List voices for flow-01-turbo model
            System.out.println("=== Voices for flow-01-turbo ===\n");
            List<Voice> turboVoices = client.getVoices("flow-01-turbo");
            System.out.println("Total voices: " + turboVoices.size() + "\n");

            for (Voice voice : turboVoices) {
                System.out.println("ID: " + voice.getId());
                System.out.println("Name: " + voice.getName());
                System.out.println("Description: " + voice.getDescription());
                System.out.println();
            }

            // List voices for flow-01-ex model
            System.out.println("\n=== Voices for flow-01-ex ===\n");
            List<Voice> exVoices = client.getVoices("flow-01-ex");
            System.out.println("Total voices: " + exVoices.size() + "\n");

            // Just show first 10
            int count = 0;
            for (Voice voice : exVoices) {
                if (count++ >= 10) {
                    System.out.println("... and " + (exVoices.size() - 10) + " more voices");
                    break;
                }
                System.out.println("ID: " + voice.getId());
                System.out.println("Name: " + voice.getName());
                System.out.println("Description: " + voice.getDescription());
                System.out.println();
            }

            // OpenAI voice mapping
            System.out.println("\n=== OpenAI Voice Mapping ===\n");
            System.out.println("The following OpenAI voice names are supported:");
            System.out.println("  alloy    -> male-qn-qingse (Young Youthful Voice)");
            System.out.println("  echo     -> male-qn-jingying (Young Elite Voice)");
            System.out.println("  fable    -> male-qn-badao (Young Dominant Voice)");
            System.out.println("  onyx     -> male-qn-daxuesheng (Young College Student Voice)");
            System.out.println("  nova     -> female-shaonv (Girl Female Voice)");
            System.out.println("  shimmer  -> female-yujie (Mature Female Voice)");

        } finally {
            client.close();
        }
    }
}
