"use server";

import { createServerFn } from "@tanstack/react-start";
import { google } from "googleapis";

export const getProductsAndSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      // 1. Authenticate using Environment Variables
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // Replace literal '\n' characters so the private key formats correctly
        key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!sheetId) {
        throw new Error("GOOGLE_SHEET_ID is not defined");
      }

      // 2. Fetch Settings from the "Settings" tab
      const settingsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Settings!A1:B",
      });

      const settingsRows = settingsResponse.data.values || [];
      let settings: Record<string, any> = {};
      settingsRows.forEach((row) => {
        if (row[0]) {
          settings[row[0]] = row[1];
        }
      });

      // 3. Fetch Products from the "Products" tab
      const productsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Products!A2:D", // Starts at A2 to skip the header row
      });

      const productsRows = productsResponse.data.values || [];
      const formattedProducts = productsRows
        .filter(row => row[1]) // Ensure product name exists
        .map((row) => ({
          company: row[0] || "",
          name: row[1] || "",
          hsn: row[2] || "",
          unit: row[3] || "",
        }));

      return {
        settings: settings,
        products: formattedProducts,
      };
    } catch (error) {
      console.error("Google Sheets API Error:", error);
      throw new Error("Failed to connect to Database");
    }
  });
