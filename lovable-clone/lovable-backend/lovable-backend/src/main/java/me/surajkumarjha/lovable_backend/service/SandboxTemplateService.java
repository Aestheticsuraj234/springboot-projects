package me.surajkumarjha.lovable_backend.service;

import java.util.LinkedHashMap;
import java.util.Map;

public final class SandboxTemplateService {

    private SandboxTemplateService() {
    }

    public static Map<String, String> normalizeFiles(Map<String, String> files) {
        if (files == null || files.isEmpty()) {
            return Map.of();
        }

        Map<String, String> normalized = new LinkedHashMap<>(files);
        String appFile = normalized.keySet().stream()
                .filter(name -> name.matches("(?i)App\\.(jsx|tsx)"))
                .findFirst()
                .orElse(null);

        if (appFile == null) {
            return Map.of();
        }

        String appCode = normalized.get(appFile);
        if (appCode.contains("./App.css")) {
            if (normalized.containsKey("styles.css") && !normalized.containsKey("App.css")) {
                normalized.put("App.css", normalized.remove("styles.css"));
            }
            normalized.putIfAbsent("App.css", defaultStyles());
        } else if (appCode.contains("./styles.css")) {
            if (normalized.containsKey("App.css") && !normalized.containsKey("styles.css")) {
                normalized.put("styles.css", normalized.remove("App.css"));
            }
            normalized.putIfAbsent("styles.css", defaultStyles());
        } else {
            normalized.putIfAbsent("styles.css", defaultStyles());
        }

        return normalized;
    }

    public static String buildFragmentTitle(Map<String, String> files) {
        if (files.keySet().stream().anyMatch(name -> name.matches("(?i)App\\.(jsx|tsx)"))) {
            return "Generated App Preview";
        }
        return files.keySet().stream()
                .filter(name -> name.matches(".*\\.(jsx|tsx)$"))
                .findFirst()
                .map(name -> name.replaceAll("\\.(jsx|tsx)$", ""))
                .orElse("Generated Preview");
    }

    private static String defaultStyles() {
        return """
                .App {
                  font-family: sans-serif;
                  padding: 24px;
                }
                """;
    }
}
