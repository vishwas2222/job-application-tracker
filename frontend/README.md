# Arnifi Job Application Tracker

## Backend

- `cd backend`
- `python3 -m venv ../venv` (already created)
- `source ../venv/bin/activate`
- `pip install -r requirements.txt`
- `python app.py`

## Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

## Features

- Signup/login with role (applicant/employer)
- Auth guard + role guard
- Jobs CRUD for employer
- Job application for applicant
- Application list for each user

## API endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/jobs`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `POST /api/jobs/:id/apply`
- `GET /api/applications`
