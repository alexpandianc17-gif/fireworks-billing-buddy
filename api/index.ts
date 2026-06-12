import server from '../dist/server/server.js';

export default async function handler(request: Request) {
  // Pass the incoming Vercel Request to the TanStack Start / Nitro server 
  return server.fetch(request, process.env, {});
}
