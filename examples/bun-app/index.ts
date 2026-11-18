// The app itself. Its plan lives in plan/x-matrix.md.
const server = Bun.serve({ port: 3000, fetch: () => new Response('Hello from bun-app') });
console.log(`Listening on ${server.url}`);
