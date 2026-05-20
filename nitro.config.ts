import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  externals: {
    external: [
      "googleapis",
      "google-auth-library"
    ]
  }
});