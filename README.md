# Hotel Channel PMS

A modern Property Management System (PMS) and Hotel Channel application built with a FastAPI backend and a React + Vite frontend. The platform is designed for hotel operators, property administrators, and staff to manage properties, roles, staff members, and related operational workflows through a role-based dashboard experience.

## Overview

This project combines:

- A secure backend API for authentication, authorization, and business logic
- A responsive frontend for managing hotels, properties, staff, roles, and user profiles
- Role-based access for Super Admin, Hotel Admin, Property Admin, and Staff users

## Key Features

- User authentication and JWT-based authorization
- Role-based dashboards and access control
- Hotel and property management
- Staff and role management
- Tenant logo uploads
- REST API with interactive documentation
- Modern frontend experience with React Router and Tailwind CSS

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast

## Project Structure

```text
Hotel-Channel-App/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── uploads/
│   │   └── tenant_logos/
│   └── Requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
```

## Prerequisites

Before running the application, make sure you have the following installed:

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database
- Git

## Clone the Repository

```bash
git clone <your-repository-url>
cd Hotel-Channel-App
```

## Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

On Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

On macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install Python dependencies:

```bash
pip install -r Requirements.txt
```

4. Create a `.env` file inside the `backend` folder with the required environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hotel_channel_db
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=System Super Admin
APP_NAME=Hotel Channel PMS
DEBUG=true
```

5. Start the backend server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- http://127.0.0.1:8000
- API docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Frontend Setup

1. Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at:

- http://localhost:5173

## Running the Application

To run the full application locally:

1. Start the backend server from the `backend` folder
2. Start the frontend development server from the `frontend` folder
3. Open your browser and visit http://localhost:5173

## Default Login

A super administrator account is created from the values defined in the backend `.env` file. Use the configured `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` to sign in.

## Notes

- Uploaded tenant logo files are stored under `backend/uploads/tenant_logos`
- The backend creates database tables automatically when the application starts
- CORS is enabled for development to allow frontend communication with the API

## Contributing

Contributions are welcome. If you would like to improve the project, please open an issue or submit a pull request with your proposed changes.
