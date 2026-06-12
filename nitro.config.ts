import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  externals: {
    external: [
      "googleapis",
      "google-auth-library"
    ]
  }
});