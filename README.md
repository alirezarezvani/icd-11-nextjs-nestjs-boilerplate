# ICD-11 Search Application

## Overview
A full-stack application for searching WHO ICD-11 medical codes, built with Next.js frontend and NestJS backend. Features Redis caching for performance optimization.

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
   git clone https://github.com/alirezarezvani/icd11-nextjs-nestjs-boilerplate.git
   cd icd11-nextjs-nestjs-boilerplate
   ```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env` and update with your credentials
   - Copy `frontend/.env.example` to `frontend/.env.local` and update as needed

### Running with Docker

The easiest way to run the application is using Docker:

```bash
docker-compose up -d
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:3003
- Redis service at localhost:6379

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

The backend will be available at http://localhost:3003

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
http://localhost:3003/api/docs
```

## Project Structure

- Please find more information in the /docs folder.

## Creator

This boilerplate was created by Alireza Rezvani CTO @ LINDERA, a Senior Solution Architect and Senior Fullstack Software Engineer. With extensive experience in modern web & mobile technologies, Sec- & DevOps, and healthcare systems integration, Alireza developed this boilerplate to provide a robust foundation for ICD-11 code search applications.

- Feel free to fork and develope your own application on top of that. Happy shipping


```