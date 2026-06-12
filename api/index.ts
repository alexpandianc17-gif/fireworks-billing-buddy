// @ts-ignore (Fixes the TS7016 implicitly any type error during Vercel build)
import server from '../dist/server/server.js';

export default async function handler(req: any, res: any) {
  try {
    // 1. Convert Vercel's classic Node Request to a standard Web Request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);
    
    const init: RequestInit = {
      method: req.method,
      headers: req.headers as HeadersInit,
    };
    
    // Handle Vercel's automatically parsed body
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = typeof req.body === 'string' || Buffer.isBuffer(req.body) 
        ? req.body 
        : JSON.stringify(req.body);
    }
    
    const request = new Request(url.href, init);
    
    // 2. Call the TanStack Start Server
    const response: Response = await server.fetch(request, process.env, {});
    
    // 3. Convert the Web Response back to Vercel's Node ServerResponse
    res.statusCode = response.status;
    response.headers.forEach((val: string, key: string) => {
      res.setHeader(key, val);
    });
    
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Vercel Server Wrapper Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
