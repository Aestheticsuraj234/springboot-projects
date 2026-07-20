package me.surajkumarjha.lovable_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class CodeExtractionService {

    private static final Pattern FENCED_BLOCK = Pattern.compile("```([^`\\n]*)\\n?([\\s\\S]*?)```");
    private static final Pattern REACT_COMPONENT = Pattern.compile(
            "(import\\s+React[\\s\\S]*?export\\s+default\\s+App\\s*;?)",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern CSS_BLOCK = Pattern.compile(
            "(\\.[A-Za-z][\\w-]*\\s*\\{[\\s\\S]*?\\}(?:\\s*(?:\\.[A-Za-z][\\w-]*|input|button|ul|li|h1)[\\s\\S]*?\\{[\\s\\S]*?\\})*)"
    );
    private static final Pattern FILENAME = Pattern.compile("^[\\w./-]+\\.\\w+$");

    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;

    public CodeExtractionService(
            ChatClient.Builder chatClientBuilder,
            @Qualifier("lovableObjectMapper") ObjectMapper objectMapper
    ) {
        this.chatClientBuilder = chatClientBuilder;
        this.objectMapper = objectMapper;
    }

    public Map<String, String> extractFiles(String content) {
        Map<String, String> files = extractFromFences(content);
        if (files.isEmpty()) {
            files = extractFromHeuristics(content);
        }
        if (files.isEmpty()) {
            files = extractWithAiFallback(content);
        }
        return SandboxTemplateService.normalizeFiles(files);
    }

    public boolean hasExtractableCode(String content) {
        if (content == null || content.isBlank()) {
            return false;
        }
        Matcher fenceMatcher = FENCED_BLOCK.matcher(content);
        while (fenceMatcher.find()) {
            if (fenceMatcher.group(2) != null && !fenceMatcher.group(2).isBlank()) {
                return true;
            }
        }
        return REACT_COMPONENT.matcher(normalizeMessyContent(content)).find();
    }

    private String normalizeMessyContent(String content) {
        return content
                .replace("```", "\n```")
                .replaceAll("(?i)(?<![.\\w])(javascript|jsx|css|typescript)(?![.\\w])", "\n```$1\n")
                .replace("importReact", "import React")
                .replace("from'react'", "from 'react'")
                .replace("from\"react\"", "from \"react\"")
                .replace("functionApp", "function App")
                .replace("exportdefaultApp", "export default App")
                .replaceAll("(import)([A-Z])", "$1 $2")
                .replaceAll("(from)(['\"])", "$1 $2")
                .replaceAll("(function)([A-Z])", "$1 $2")
                .replaceAll("(export)(default)", "$1 $2")
                .replaceAll("(default)(App)", "$1 $2");
    }

    private Map<String, String> extractFromFences(String content) {
        Map<String, String> files = new LinkedHashMap<>();
        Matcher matcher = FENCED_BLOCK.matcher(normalizeMessyContent(content));
        int index = 0;

        while (matcher.find()) {
            String header = matcher.group(1) == null ? "" : matcher.group(1).trim();
            String code = matcher.group(2) == null ? "" : matcher.group(2).trim();
            if (code.isBlank()) {
                continue;
            }

            String language = header.split("\\s+")[0].toLowerCase();
            String filename = parseFilenameFromHeader(header);
            if (filename == null) {
                filename = parseFilenameFromCode(code);
            }
            if (filename == null) {
                filename = defaultFilename(language, index);
            }

            if (code.lines().findFirst().orElse("").trim().startsWith("//")) {
                String firstLine = code.lines().findFirst().orElse("").trim();
                if (FILENAME.matcher(firstLine.substring(2).trim()).matches()) {
                    String[] lines = code.split("\n", -1);
                    if (lines.length > 1) {
                        code = String.join("\n", java.util.Arrays.copyOfRange(lines, 1, lines.length));
                    }
                }
            }

            filename = dedupeFilename(files, filename, index);
            files.put(filename, code.trim());
            index++;
        }

        return files;
    }

    private Map<String, String> extractFromHeuristics(String content) {
        String normalized = normalizeMessyContent(content);
        Map<String, String> files = new LinkedHashMap<>();

        Matcher reactMatcher = REACT_COMPONENT.matcher(normalized);
        if (reactMatcher.find()) {
            files.put("App.jsx", prettifyCode(reactMatcher.group(1)));
        }

        Matcher cssMatcher = CSS_BLOCK.matcher(normalized);
        if (cssMatcher.find()) {
            String cssFile = normalized.contains("App.css")
                    ? "App.css"
                    : "styles.css";
            files.put(cssFile, cssMatcher.group(1).trim());
        }

        return files;
    }

    private Map<String, String> extractWithAiFallback(String content) {
        try {
            String json = chatClientBuilder.build()
                    .prompt()
                    .system("""
                            Extract runnable React preview files from the assistant text.
                            Return ONLY a JSON object mapping filenames to file contents.
                            Use App.jsx for the main React component and App.css or styles.css for styles.
                            Example: {"App.jsx":"export default function App() { ... }","App.css":".App { ... }"}
                            No markdown, no explanation, only JSON.
                            """)
                    .user(content)
                    .call()
                    .content();

            if (json == null || json.isBlank()) {
                return Map.of();
            }

            String cleaned = json.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```(?:json)?\\n?", "").replaceAll("\\n?```$", "");
            }

            Map<String, String> parsed = objectMapper.readValue(cleaned, new TypeReference<>() {});
            Map<String, String> files = new LinkedHashMap<>();
            parsed.forEach((key, value) -> {
                if (value != null && !value.isBlank()) {
                    files.put(key, value);
                }
            });
            return files;
        } catch (Exception ex) {
            log.warn("AI fallback extraction failed: {}", ex.getMessage());
            return Map.of();
        }
    }

    private String parseFilenameFromHeader(String header) {
        if (FILENAME.matcher(header).matches()) {
            return header;
        }
        for (String part : header.split("\\s+")) {
            String cleaned = part.replaceAll("^[\"'`]|[\"'`]$", "");
            if (FILENAME.matcher(cleaned).matches()) {
                return cleaned;
            }
        }
        Matcher labeled = Pattern.compile("(?:filename|file)[=:\\s]+[\"']?([\\w./-]+\\.\\w+)", Pattern.CASE_INSENSITIVE)
                .matcher(header);
        return labeled.find() ? labeled.group(1) : null;
    }

    private String parseFilenameFromCode(String code) {
        String firstLine = code.lines().findFirst().orElse("").trim();
        if (firstLine.startsWith("//")) {
            String candidate = firstLine.substring(2).trim();
            if (FILENAME.matcher(candidate).matches()) {
                return candidate;
            }
        }
        return null;
    }

    private String defaultFilename(String language, int index) {
        return switch (language) {
            case "tsx" -> index == 0 ? "App.tsx" : "component-" + index + ".tsx";
            case "jsx" -> index == 0 ? "App.jsx" : "component-" + index + ".jsx";
            case "typescript", "ts" -> "file-" + index + ".ts";
            case "javascript", "js" -> index == 0 ? "App.jsx" : "file-" + index + ".js";
            case "css" -> index <= 1 ? "styles.css" : "styles-" + index + ".css";
            case "html" -> "index.html";
            case "json" -> "data.json";
            default -> index == 0 ? "App.jsx" : "file-" + index + ".txt";
        };
    }

    private String dedupeFilename(Map<String, String> files, String filename, int index) {
        if (!files.containsKey(filename)) {
            return filename;
        }
        int dot = filename.lastIndexOf('.');
        if (dot >= 0) {
            return filename.substring(0, dot) + "-" + index + filename.substring(dot);
        }
        return filename + "-" + index;
    }

    private String prettifyCode(String code) {
        return code
                .replace(";", ";\n")
                .replace("{", "{\n")
                .replace("}", "\n}\n")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
