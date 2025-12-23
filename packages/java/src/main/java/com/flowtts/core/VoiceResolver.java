package com.flowtts.core;

import com.flowtts.model.Voice;
import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Resolves voice names to Tencent Cloud voice IDs.
 * Supports lazy loading and O(1) lookups.
 */
public class VoiceResolver {
    private static final Map<String, String> OPENAI_VOICE_MAP = new HashMap<>();

    static {
        // OpenAI voice name mappings to Tencent Cloud voice IDs
        // These map OpenAI's voice names to similar-sounding Tencent voices
        OPENAI_VOICE_MAP.put("alloy", "v-male-W1tH9jVc");      // Male, versatile
        OPENAI_VOICE_MAP.put("echo", "v-male-Bk7vD3xP");       // Male, authoritative
        OPENAI_VOICE_MAP.put("fable", "v-male-s5NqE0rZ");      // Male, storytelling
        OPENAI_VOICE_MAP.put("onyx", "v-male-Bk7vD3xP");       // Male, deep
        OPENAI_VOICE_MAP.put("nova", "v-female-R2s4N9qJ");     // Female, gentle
        OPENAI_VOICE_MAP.put("shimmer", "v-female-m1KpW7zE");  // Female, expressive
    }

    private final Object lock = new Object();
    private volatile Map<String, Map<String, Voice>> voicesByModel;

    /**
     * Get the singleton instance of VoiceResolver.
     *
     * @return the VoiceResolver instance
     */
    public static VoiceResolver getInstance() {
        return Holder.INSTANCE;
    }

    private static class Holder {
        private static final VoiceResolver INSTANCE = new VoiceResolver();
    }

    private VoiceResolver() {
    }

    /**
     * Resolve a voice name to a Tencent Cloud voice ID.
     *
     * @param voice the voice name (OpenAI name or Tencent voice ID)
     * @param model the model name
     * @return the resolved voice ID
     */
    public String resolve(String voice, String model) {
        // Check if it's an OpenAI voice name
        String openAiMapped = OPENAI_VOICE_MAP.get(voice.toLowerCase());
        if (openAiMapped != null) {
            return openAiMapped;
        }

        // Check if it's a valid Tencent voice ID
        ensureLoaded();
        Map<String, Voice> modelVoices = voicesByModel.get(model);
        if (modelVoices != null && modelVoices.containsKey(voice)) {
            return voice;
        }

        // Fall back to the voice ID as-is
        return voice;
    }

    /**
     * Get a voice by ID for a specific model.
     *
     * @param voiceId the voice ID
     * @param model   the model name
     * @return the Voice object, or null if not found
     */
    public Voice getVoice(String voiceId, String model) {
        ensureLoaded();
        Map<String, Voice> modelVoices = voicesByModel.get(model);
        if (modelVoices == null) {
            return null;
        }
        return modelVoices.get(voiceId);
    }

    /**
     * Get all voices for a specific model.
     *
     * @param model the model name
     * @return a list of voices for the model
     */
    public List<Voice> getVoices(String model) {
        ensureLoaded();
        Map<String, Voice> modelVoices = voicesByModel.get(model);
        if (modelVoices == null) {
            return Collections.emptyList();
        }
        return List.copyOf(modelVoices.values());
    }

    /**
     * Check if a voice ID is valid for a specific model.
     *
     * @param voiceId the voice ID
     * @param model   the model name
     * @return true if the voice is valid
     */
    public boolean isValidVoice(String voiceId, String model) {
        // OpenAI voices are always valid
        if (OPENAI_VOICE_MAP.containsKey(voiceId.toLowerCase())) {
            return true;
        }

        ensureLoaded();
        Map<String, Voice> modelVoices = voicesByModel.get(model);
        return modelVoices != null && modelVoices.containsKey(voiceId);
    }

    private void ensureLoaded() {
        if (voicesByModel == null) {
            synchronized (lock) {
                if (voicesByModel == null) {
                    voicesByModel = loadVoices();
                }
            }
        }
    }

    private Map<String, Map<String, Voice>> loadVoices() {
        Map<String, Map<String, Voice>> result = new HashMap<>();
        Gson gson = new Gson();

        String[] models = {"flow-01-turbo", "flow-01-ex"};
        String[] files = {"voices-flow_01_turbo.json", "voices-flow_01_ex.json"};

        for (int i = 0; i < models.length; i++) {
            String model = models[i];
            String fileName = files[i];

            try (InputStream is = getClass().getClassLoader().getResourceAsStream("data/" + fileName)) {
                if (is == null) {
                    continue;
                }

                String json = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
                        .lines()
                        .collect(Collectors.joining("\n"));

                VoicesFile voicesFile = gson.fromJson(json, VoicesFile.class);
                if (voicesFile != null && voicesFile.voices != null) {
                    Map<String, Voice> voiceMap = new HashMap<>();
                    for (Voice voice : voicesFile.voices) {
                        voiceMap.put(voice.getId(), voice);
                    }
                    result.put(model, voiceMap);
                }
            } catch (IOException e) {
                // Log warning but continue
                System.err.println("Warning: Could not load voices for model " + model + ": " + e.getMessage());
            }
        }

        return result;
    }

    private static class VoicesFile {
        @SerializedName("voices")
        List<Voice> voices;
    }
}
