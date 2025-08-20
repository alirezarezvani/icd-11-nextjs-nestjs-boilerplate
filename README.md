# ICD-11 Healthcare Boilerplate Platform

## 🚀 Quick Start with CLI Tool

Create a new ICD-11 healthcare application instantly:

```bash
npx create-icd11-app my-healthcare-app
```

**✨ What you get:**
- Complete ICD-11 healthcare application with custom branding
- WHO API integration with OAuth2 authentication  
- Production-ready deployment configurations (Docker, AWS, Azure, GCP)
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Redis caching and comprehensive testing setup

[📚 CLI Documentation](./packages/cli/README.md) | [🚀 Deployment Guide](./packages/cli/docs/DEPLOYMENT.md)

---

## Overview
A comprehensive full-stack platform for building production-ready ICD-11 healthcare applications. This project serves as both a complete ICD-11 search application and a powerful CLI tool (`create-icd11-app`) for generating customized healthcare applications.

## Features

### 🏥 Healthcare Application Platform
- **Fast ICD-11 Search**: Search the full ICD-11 database efficiently
- **Hierarchical Navigation**: Full support for ICD-11 code hierarchy with breadcrumbs
- **Flexible Search Options**: Advanced search with filtering and pagination
- **Optimized Performance**: Redis caching for improved response times
- **User-friendly Interface**: Clean, responsive design for all devices
- **Full-stack TypeScript**: Type safety throughout the application

### 🛠️ CLI Tool (`create-icd11-app`)
- **Interactive Setup Wizard**: Guided setup with healthcare provider branding
- **Multiple Templates**: Full-stack, frontend-only, API-only, and minimal options
- **Custom Branding**: Organization colors, logos, and contact information
- **WHO API Integration**: Secure credential configuration with validation
- **Deployment Ready**: Docker, AWS, Azure, GCP templates with CI/CD pipelines
- **Redis Configuration**: Automatic Docker setup or custom Redis configuration

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