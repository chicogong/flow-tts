package com.flowtts.model;

import com.google.gson.annotations.SerializedName;

/**
 * Represents a TTS voice.
 */
public class Voice {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("language")
    private String language;

    @SerializedName("description")
    private String description;

    @SerializedName("sampleText")
    private String sampleText;

    public Voice() {
    }

    public Voice(String id, String name, String language, String description, String sampleText) {
        this.id = id;
        this.name = name;
        this.language = language;
        this.description = description;
        this.sampleText = sampleText;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSampleText() {
        return sampleText;
    }

    public void setSampleText(String sampleText) {
        this.sampleText = sampleText;
    }

    @Override
    public String toString() {
        return "Voice{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", language='" + language + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
