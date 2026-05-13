import { createServerFn } from '@tanstack/start';
import { google } from 'googleapis';

// This function strictly runs on the server/Node.js environment
export const fetchGoogleSheetData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Safely handle the newline formatting for the private key from your .env
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // 1. Fetch Settings
    const settingsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Settings!A1:B',
    });

    const settingsRows = settingsResponse.data.values || [];
    let settings: Record<string, any> = {};
    settingsRows.forEach(row => {
      settings[row[0]] = row[1];
    });

    // 2. Fetch Products
    const productsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Products!A2:D',
    });

    const productsRows = productsResponse.data.values || [];
    const formattedProducts = productsRows.map(row => ({
      company: row[0],
      name: row[1],
      hsn: row[2],
      unit: row[3]
    }));

    return {
      settings: settings,
      products: formattedProducts
    };

  } catch (error) {
    console.error("Google Sheets API Error:", error);
    throw new Error('Failed to connect to Database');
  }
});