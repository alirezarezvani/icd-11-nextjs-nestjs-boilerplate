# ICD-11 Search Application

A full-stack application for searching the WHO International Classification of Diseases 11th Revision (ICD-11), built with Next.js and NestJS.

## Features

- **Fast ICD-11 Search**: Search the full ICD-11 database efficiently
- **Flexible Search Options**: Fine-tune your search parameters
- **Optimized Performance**: Redis caching for improved response times
- **User-friendly Interface**: Clean, responsive design for all devices
- **Full-stack TypeScript**: Type safety throughout the application

## Tech Stack

### Frontend
- **Next.js**: React framework with server-side rendering
- **Material UI**: Component library for consistent UI design
- **TypeScript**: For type-safe code
- **React Context**: For state management

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: For type-safe code
- **Redis**: For caching WHO API responses
- **Axios**: For HTTP requests
- **Swagger**: For API documentation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis (local or remote instance)
- WHO ICD-11 API credentials (Client ID and Client Secret)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/icd11-nextjs-nestjs-boilerplate.git
   cd icd11-nextjs-nestjs-boilerplate
   ```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env` and update with your credentials
   - Copy `frontend/.env.example` to `frontend/.env` and update as needed

### Running with Docker

The easiest way to run the application is using Docker:

```bash
docker-compose up -d
```

This will start the frontend, backend, and Redis services.

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

The backend will be available at http://localhost:3001

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## API Documentation

Once the backend is running, you can access the Swagger documentation at:

```
http://localhost:3001/api/docs
```

## Project Structure

```
icd11-nextjs-nestjs-boilerplate/
├── frontend/            # Next.js frontend application
│   ├── pages/           # Routes and page components
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client and services
│   ├── types/           # TypeScript definitions
│   └── styles/          # Global styles
│
├── backend/             # NestJS backend API
│   ├── src/
│   │   ├── main.ts      # Application entry point
│   │   ├── app.module.ts # Root module
│   │   ├── icd11/       # ICD11 module for WHO API
│   │   ├── cache/       # Redis cache module
│   │   └── common/      # Shared utilities and interfaces
│   └── test/            # Test files
│
├── docs/                # Project documentation
└── docker/              # Docker configuration
```

## Data Source

All data is sourced from the [World Health Organization's ICD-11 API](https://icd.who.int/en). This application does not store or modify any of the core ICD-11 data.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- World Health Organization for providing the ICD-11 API
- The Next.js and NestJS teams for their excellent frameworks 