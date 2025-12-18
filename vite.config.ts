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
      // IMPORTANT: use an ordered alias array so specific subpaths (e.g. react-dom/client)
      // are resolved before their parent package aliases (e.g. react-dom).
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "./src") },

        // Force a single React instance across the entire app
        { find: "react/jsx-runtime", replacement: path.resolve(__dirname, "./node_modules/react/jsx-runtime.js") },
        { find: "react/jsx-dev-runtime", replacement: path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime.js") },
        { find: "react", replacement: path.resolve(__dirname, "./node_modules/react") },

        { find: "react-dom/client", replacement: path.resolve(__dirname, "./node_modules/react-dom/client.js") },
        { find: "react-dom", replacement: path.resolve(__dirname, "./node_modules/react-dom") },

        { find: "scheduler", replacement: path.resolve(__dirname, "./node_modules/scheduler") },
      ],
      dedupe: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-dom/server",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "scheduler",
        "@tanstack/react-query",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "scheduler",
        "@tanstack/react-query",
      ],
      exclude: [],
      force: true,
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
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
