import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// When the dev server runs behind the cluster ingress (Tilt sets
// PUBLIC_HOST), the page is served at https://<host> while Vite listens
// on 5173 — HMR must be told to dial wss://<host>:443 or it tries the
// dev-server port and hot reload silently dies.
const publicHost = process.env.PUBLIC_HOST

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: publicHost
    ? {
        host: true,
        allowedHosts: [publicHost],
        hmr: { host: publicHost, protocol: "wss", clientPort: 443 },
      }
    : undefined,
})
