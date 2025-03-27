# ICD-11 Next.js + NestJS Boilerplate

A full-stack application boilerplate for building an ICD-11 search interface using Next.js for the frontend and NestJS for the backend.

## Overview

This project provides a foundation for developing applications that interact with the WHO ICD-11 API. It consists of:

- **Frontend**: Next.js-based web application for searching and displaying ICD-11 data
- **Backend**: NestJS API that handles communication with the WHO ICD-11 API and provides caching

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Redis (for caching)
- WHO API credentials (client ID and secret)

## Project Structure

```
icd11-nextjs-nestjs-boilerplate/
├── frontend/            # Next.js frontend application
│   ├── pages/           # Next.js pages
│   └── .env.example     # Environment variables example
│
├── backend/             # NestJS backend API
│   ├── src/             # Source code
│   └── .env.example     # Environment variables example
```

## Getting Started

### Environment Setup

1. **Backend Configuration**

   Copy the example environment file and add your WHO API credentials:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit the `.env` file to include:
   - WHO_API_CLIENT_ID - Your WHO API client ID
   - WHO_API_CLIENT_SECRET - Your WHO API client secret
   - REDIS_HOST - Redis host (default: redis)
   - REDIS_PORT - Redis port (default: 6379)

2. **Frontend Configuration**

   Copy the example environment file:

   ```bash
   cd frontend
   cp .env.example .env
   ```

   By default, the frontend is configured to connect to the backend at `http://localhost:3001`.

### Installation

1. **Backend Installation**

   ```bash
   cd backend
   npm install
   ```

2. **Frontend Installation**

   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the Backend**

   ```bash
   cd backend
   npm run start:dev
   ```

   The NestJS API will be available at `http://localhost:3001`.

2. **Start the Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   The Next.js application will be available at `http://localhost:3000`.

## Features

- **ICD-11 Integration**: Connect to the WHO ICD-11 API
- **Caching**: Redis-based caching of API responses
- **Type Safety**: TypeScript throughout the entire stack

## Development

### Backend Development

The backend uses NestJS, a progressive Node.js framework for building efficient and scalable server-side applications.

Key files and directories:
- `src/main.ts` - Application entry point

### Frontend Development

The frontend uses Next.js, a React framework with hybrid static & server rendering, TypeScript support, and route pre-fetching.

Key files and directories:
- `pages/index.tsx` - Home page component

## Deployment

For production deployment, consider:

1. Setting up a CI/CD pipeline
2. Using Docker for containerization
3. Configuring environment-specific settings
4. Setting up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [WHO ICD-11 API](https://icd.who.int/icdapi)
- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/) 