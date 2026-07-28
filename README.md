# Family Recipes

A monorepo application for managing family recipes, built with Nx, Next.js, and Express.js.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, or pnpm

### Installation

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Running the Applications

### Development Servers

Start the web application (Next.js):

```bash
npx nx run web:serve
```

This will start the web app on [http://localhost:3000](http://localhost:3000).

Start the API server (Express.js):

```bash
npx nx run api:serve
```

This will start the API on [http://localhost:4001](http://localhost:4001).

To run both applications simultaneously:

```bash
npx nx run-many -t serve
```

## Building

Build the web application:

```bash
npx nx build web
```

Build the API:

```bash
npx nx build api
```

Build all applications:

```bash
npx nx run-many -t build
```

## Linting and Formatting

Lint the code:

```bash
npx nx run-many -t lint
```

Format the code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

## Project Structure

This is an Nx monorepo with the following apps:

- `apps/web`: Next.js frontend application
- `apps/api`: Express.js backend API

## Learn More

- [Nx Documentation](https://nx.dev) - Learn about Nx monorepos and build tools
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [Express.js Documentation](https://expressjs.com/) - Learn about Express.js

## Deploy on Vercel

The web application can be deployed on Vercel. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
