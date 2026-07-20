package me.surajkumarjha.lovable_backend.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DaytonaPreviewTemplateService {

    public Map<String, String> buildProjectFiles(Map<String, String> generatedFiles) {
        Map<String, String> normalized = SandboxTemplateService.normalizeFiles(generatedFiles);
        Map<String, String> projectFiles = new LinkedHashMap<>();

        projectFiles.put("package.json", PACKAGE_JSON);
        projectFiles.put("vite.config.js", VITE_CONFIG);
        projectFiles.put("index.html", INDEX_HTML);

        String appCode = findAppSource(normalized);
        String cssCode = findCssSource(normalized, appCode);

        projectFiles.put("src/main.jsx", MAIN_JSX);
        projectFiles.put("src/App.jsx", appCode);
        projectFiles.put("src/App.css", cssCode);

        return projectFiles;
    }

    private String findAppSource(Map<String, String> files) {
        return files.entrySet().stream()
                .filter(entry -> entry.getKey().matches("(?i)App\\.(jsx|tsx)"))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(DEFAULT_APP);
    }

    private String findCssSource(Map<String, String> files, String appCode) {
        if (appCode.contains("./App.css") && files.containsKey("App.css")) {
            return files.get("App.css");
        }
        if (files.containsKey("App.css")) {
            return files.get("App.css");
        }
        if (files.containsKey("styles.css")) {
            return files.get("styles.css");
        }
        return DEFAULT_CSS;
    }

    private static final String PACKAGE_JSON = """
            {
              "name": "lovable-preview",
              "private": true,
              "type": "module",
              "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
              },
              "dependencies": {
                "react": "^19.0.0",
                "react-dom": "^19.0.0"
              },
              "devDependencies": {
                "@vitejs/plugin-react": "^4.3.4",
                "vite": "^6.0.0"
              }
            }
            """;

    private static final String VITE_CONFIG = """
            import { defineConfig } from 'vite'
            import react from '@vitejs/plugin-react'

            export default defineConfig({
              plugins: [react()],
              server: {
                host: '0.0.0.0',
                port: 5173,
                strictPort: true,
              },
            })
            """;

    private static final String INDEX_HTML = """
            <!doctype html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Lovable Preview</title>
              </head>
              <body>
                <div id="root"></div>
                <script type="module" src="/src/main.jsx"></script>
              </body>
            </html>
            """;

    private static final String MAIN_JSX = """
            import { StrictMode } from 'react'
            import { createRoot } from 'react-dom/client'
            import App from './App.jsx'
            import './App.css'

            createRoot(document.getElementById('root')).render(
              <StrictMode>
                <App />
              </StrictMode>,
            )
            """;

    private static final String DEFAULT_APP = """
            export default function App() {
              return (
                <div className="App">
                  <h1>Generated Preview</h1>
                  <p>Your app will render here.</p>
                </div>
              )
            }
            """;

    private static final String DEFAULT_CSS = """
            .App {
              font-family: Inter, system-ui, sans-serif;
              padding: 24px;
            }
            """;
}
