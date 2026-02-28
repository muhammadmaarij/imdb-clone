# IMDB Clone - Full Stack Movie Web Application

A full-stack movie web application built with Vue.js frontend and Node.js/Express backend, featuring user authentication, movie management, reviews, and search functionality.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Movie Management**: View, create, edit, and delete movies (authenticated users only)
- **Movie Reviews**: Create, update, and delete reviews for movies (authenticated users only)
- **Movie Search**: Search movies by title
- **Movie Rankings**: Movies ranked by number of reviews
- **Movie Details**: View movie details with trailer and reviews
- **Responsive Design**: Modern, responsive UI inspired by IMDB and TMDB

## Technology Stack

### Frontend

- Vue 3 (Composition API)
- Vue Router
- Pinia (State Management)
- Axios (HTTP Client)
- Vite (Build Tool)
- Vitest (Testing)

### Backend

- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Zod (Validation)
- Jest (Testing)

## Project Structure

```
imdb-clone/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/           # Sequelize models
│   │   ├── types/            # TypeScript type definitions
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── validators/       # Zod validation schemas
│   │   ├── tests/            # Test files
│   │   └── server.ts         # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── views/            # Page views
│   │   ├── router/           # Vue Router configuration
│   │   ├── stores/           # Pinia stores
│   │   ├── services/         # API service
│   │   ├── tests/            # Test files
│   │   └── main.js           # Vue app entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker and Docker Compose (optional)

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd imdb-clone
```

2. Start all services:

```bash
docker-compose up -d
```

3. The application will be available at:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
DB_NAME=imdb_clone
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
PORT=3000
```

4. Start PostgreSQL database and create the database:

```bash
createdb imdb_clone
```

5. Run database migrations to create tables:

```bash
npm run db:migrate
```

This will create all tables (users, movies, reviews) with proper relationships and constraints.

6. Start the development server:

```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. The frontend will be available at http://localhost:5173

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Body: {
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login

```
POST /api/auth/login
Body: {
  "email": "string",
  "password": "string"
}
```

### Movie Endpoints

#### Get All Movies

```
GET /api/movies
```

#### Get Movie by ID

```
GET /api/movies/:id
```

#### Search Movies

```
GET /api/movies/search?q=query
```

#### Create Movie (Authenticated)

```
POST /api/movies
Headers: Authorization: Bearer <token>
Body: {
  "title": "string",
  "releaseDate": "date",
  "description": "string",
  "posterUrl": "string",
  "trailerUrl": "string"
}
```

#### Update Movie (Authenticated)

```
PUT /api/movies/:id
Headers: Authorization: Bearer <token>
Body: {
  "title": "string",
  "releaseDate": "date",
  "description": "string",
  "posterUrl": "string",
  "trailerUrl": "string"
}
```

#### Delete Movie (Authenticated)

```
DELETE /api/movies/:id
Headers: Authorization: Bearer <token>
```

### Review Endpoints

#### Get Reviews for Movie

```
GET /api/reviews/movie/:movieId
```

#### Create Review (Authenticated)

```
POST /api/reviews
Headers: Authorization: Bearer <token>
Body: {
  "movieId": "string",
  "rating": number (1-5),
  "comment": "string"
}
```

#### Update Review (Authenticated)

```
PUT /api/reviews/:id
Headers: Authorization: Bearer <token>
Body: {
  "rating": number (1-5),
  "comment": "string"
}
```

#### Delete Review (Authenticated)

```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
```

## Database Migrations

### Running Migrations

To create database tables, run:

```bash
npm run db:migrate
```

This will execute all pending migrations and create the tables (users, movies, reviews) with proper relationships and constraints.

### Migration Commands

- **Run migrations**: `npm run db:migrate`
- **Undo last migration**: `npm run db:migrate:undo`
- **Undo all migrations**: `npm run db:migrate:undo:all`
- **Check migration status**: `npm run db:migrate:status`

### Manual PostgreSQL Setup

1. Create the database:

```sql
CREATE DATABASE imdb_clone;
```

2. Update `.env` file with your credentials

3. Run migrations:

```bash
npm run db:migrate
```

4. Start the server:

```bash
npm run dev
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Movies Table

- `id` (UUID, Primary Key)
- `title` (String, Unique)
- `releaseDate` (Date)
- `description` (Text)
- `posterUrl` (String)
- `trailerUrl` (String)
- `userId` (UUID, Foreign Key to Users)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Reviews Table

- `id` (UUID, Primary Key)
- `movieId` (UUID, Foreign Key to Movies)
- `userId` (UUID, Foreign Key to Users)
- `rating` (Integer, 1-5)
- `comment` (Text)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Key Features Implementation

1. **Movie Ranking**: Movies are ranked by the number of reviews using SQL aggregation
2. **Unique Movie Names**: Database constraint and validation prevent duplicate movie titles
3. **Image URLs**: Movie posters use image URLs (e.g., from Unsplash)
4. **Video Trailers**: Trailers are embedded using iframe (YouTube/Vimeo links)
5. **Search**: Backend search endpoint filters movies by title (case-insensitive)
6. **Authentication**: JWT tokens stored in localStorage, sent in Authorization header
7. **Type Safety**: Full TypeScript implementation with strict mode, no `any` types

## Security Features

- Password hashing with bcrypt (salt rounds: 10+)
- JWT token-based authentication
- Input validation with Zod schemas
- SQL injection protection via Sequelize ORM
- CORS configuration
- Environment variables for sensitive data

## Development

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Building for Production

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

## Environment Variables

### Backend (.env)

- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `BCRYPT_SALT_ROUNDS`: Bcrypt salt rounds
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port

## License

This project is for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
