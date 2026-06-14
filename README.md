# NexusDAG

NexusDAG is a Next.js and TypeScript demo app for graph-based project planning. It combines role-aware dashboards, Kanban execution, task review tracking, critical path analysis, delay analytics, and Three.js workflow visualization.

## Routes

- `/` - public landing page with Three.js hero preview.
- `/login` - demo login for employer, employee, or client roles.
- `/signup` - demo account creation backed by in-memory data.
- `/dashboard` - API-backed role dashboard.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
```

Demo data is served by typed Next.js API routes and resets when the server restarts.
