import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function dubaothoitietPlugin(): Plugin {
  const handler = async (_req: any, res: any) => {
    try {
      const response = await globalThis.fetch("https://dubaothoitiet.edu.vn/dak-nong/dak-song", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        },
      });

      if (!response.ok) {
        res.statusCode = response.status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: `Upstream error ${response.status}` }));
        return;
      }

      const html = await response.text();

      const hi = html.match(/class=["']metro-weather-hi["'][\s\S]*?<strong>(\d+(?:\.\d+)?)°<\/strong>/i);
      const lo = html.match(/class=["']metro-weather-lo["'][\s\S]*?<strong>(\d+(?:\.\d+)?)°<\/strong>/i);
      const desc = html.match(
        /class=["']metro-weather-overview-block metro-weather-overview-block-description["'][\s\S]*?<p>(.*?)<\/p>/i
      );
      const hum = html.match(/Độ ẩm\s*<strong>([\d.]+)%/i);
      const wind = html.match(/Gió\s*<strong>([\d.]+)\s*m\/s/i);
      const dew = html.match(/Điểm ngưng\s*<strong>([\d.]+)°/i);
      const uv = html.match(/UV\s*<strong>([\d.]+)/i);

      const tempVal = hi ? parseFloat(hi[1]) : 25;
      const apparentVal = lo ? parseFloat(lo[1]) : tempVal;
      const descVal = desc ? desc[1].trim() : "Mưa vừa";
      const humVal = hum ? parseFloat(hum[1]) : 96;
      const windVal = wind ? parseFloat(wind[1]) : 1.0;
      const dewVal = dew ? parseFloat(dew[1]) : 24;
      const uvVal = uv ? parseFloat(uv[1]) : 0.1;

      let type: "rainy" | "cloudy" | "sunny" = "rainy";
      const lower = descVal.toLowerCase();
      if (lower.includes("nắng") || lower.includes("quang")) type = "sunny";
      else if (lower.includes("mây") && !lower.includes("mưa")) type = "cloudy";

      const data = {
        type,
        temperature: tempVal,
        apparentTemperature: apparentVal,
        humidity: humVal,
        windSpeed: windVal,
        dewPoint: dewVal,
        uvIndex: uvVal,
        description: descVal.charAt(0).toUpperCase() + descVal.slice(1),
        tempMax: Math.max(tempVal, apparentVal),
        tempMin: Math.min(tempVal, 22),
        rainProbability: lower.includes("mưa") ? 95 : 20,
        source: "dubaothoitiet",
        sourceUrl: "https://dubaothoitiet.edu.vn/dak-nong/dak-song",
        locationName: "Đắk Song (dubaothoitiet.edu.vn)",
        updatedAt: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        isRealtime: true,
      };

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.end(JSON.stringify(data));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: err?.message || "Lỗi lấy dữ liệu thời tiết" }));
    }
  };

  return {
    name: "dubaothoitiet-live-proxy",
    configureServer(server) {
      server.middlewares.use("/api/weather/dak-song", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/weather/dak-song", handler);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), dubaothoitietPlugin()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.module.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});