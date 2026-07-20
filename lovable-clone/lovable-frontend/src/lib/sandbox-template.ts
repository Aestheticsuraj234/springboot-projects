export function normalizeGeneratedFiles(files: Record<string, string>): Record<string, string> {
  const normalized = { ...files }
  const appEntry = Object.entries(normalized).find(([name]) => /^App\.(jsx|tsx)$/i.test(name))

  if (!appEntry) {
    return normalized
  }

  const [, appCode] = appEntry

  if (appCode.includes('./App.css')) {
    if (normalized['styles.css'] && !normalized['App.css']) {
      normalized['App.css'] = normalized['styles.css']
      delete normalized['styles.css']
    }
    normalized['App.css'] ??= `.App {
  font-family: Inter, system-ui, sans-serif;
  padding: 24px;
}`
  } else if (appCode.includes('./styles.css')) {
    if (normalized['App.css'] && !normalized['styles.css']) {
      normalized['styles.css'] = normalized['App.css']
      delete normalized['App.css']
    }
    normalized['styles.css'] ??= `.App {
  font-family: Inter, system-ui, sans-serif;
  padding: 24px;
}`
  }

  return normalized
}

export function buildSandboxFiles(userFiles: Record<string, string>): Record<string, string> {
  const normalized = normalizeGeneratedFiles(userFiles)
  const appFile = Object.keys(normalized).find((name) => /^App\.(jsx|tsx)$/i.test(name))

  if (!appFile) {
    return normalized
  }

  const appCode = normalized[appFile]
  const cssFile = appCode.includes('./App.css')
    ? 'App.css'
    : appCode.includes('./styles.css')
      ? 'styles.css'
      : normalized['App.css']
        ? 'App.css'
        : 'styles.css'

  if (!normalized[cssFile]) {
    normalized[cssFile] = `.App {
  font-family: Inter, system-ui, sans-serif;
  padding: 24px;
}`
  }

  normalized['index.js'] = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./${appFile}";
import "./${cssFile}";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`

  return normalized
}

export function toSandpackFiles(files: Record<string, string>): Record<string, { code: string }> {
  return Object.fromEntries(
    Object.entries(files).map(([path, code]) => [`/${path.replace(/^\//, '')}`, { code }]),
  )
}
