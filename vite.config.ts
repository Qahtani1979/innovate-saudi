import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Force a single React instance across all deps (fixes "Invalid hook call")
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime.js"),
        "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime.js"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
      ],
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL || "https://wneorgiqyvkkjmqootpe.supabase.co"
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZW9yZ2lxeXZra2ptcW9vdHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDc3NDksImV4cCI6MjA4MDc4Mzc0OX0.sG8en2_gRniPGgxdUETZy0N592mQ8YtSPyp8zcbPkAE"
      ),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        env.VITE_SUPABASE_PROJECT_ID || "wneorgiqyvkkjmqootpe"
      ),
    },
  };
});
