# Book Recommendation System

A modern web application that provides personalized book recommendations based on user search and borrowing history.

## Features

- 🔐 **Authentication**: Secure signup and login system
- 📚 **Book Browsing**: Search books by title, author, or category
- 📖 **Book Borrowing**: Borrow and return books
- 🎯 **Smart Recommendations**: Get personalized book recommendations based on your history
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- React Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mini-project
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/bookstore
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Initialize the database:
```bash
npm run init-db
```

Start the backend server:
```bash
npm start
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
mini-project/
├── frontend/           # Next.js frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # Reusable components
│   │   └── lib/       # Utility functions
│   └── public/        # Static assets
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── controllers/ # Request handlers
│   │   ├── models/    # Database models
│   │   └── middleware/ # Custom middleware
│   └── db/            # Database setup
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books (with search & filter)
- `GET /api/books/:id` - Get book details
- `GET /api/categories` - Get all categories

### Borrowing
- `POST /api/borrows` - Borrow a book
- `GET /api/borrows` - Get user's borrowed books
- `PUT /api/borrows/:id/return` - Return a book

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## Features in Detail

### Recommendation Algorithm
The system recommends books based on:
- Books in categories you've browsed
- Books similar to ones you've borrowed
- Popular books in your favorite categories
- Books you've searched for but haven't borrowed yet

### Search Functionality
- Search by book title
- Search by author
- Filter by category
- Real-time search results

## License

MIT
