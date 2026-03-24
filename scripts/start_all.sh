#!/bin/bash
set -e

echo "===== Start full-stack Job App (backend + frontend) ====="

# Backend setup
cd "$(dirname "$0")/.." || exit 1
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r backend/requirements.txt

# .env default
if [ ! -f backend/.env ]; then
  cat > backend/.env <<EOD
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobapp
SECRET_KEY=supersecretkey
EOD
  echo "Created backend/.env with default values. Make updates in backend/.env as needed."
fi

# DB migrate
cd backend
if [ ! -d migrations ]; then
  flask db init
fi
flask db migrate -m "Auto run script migration"
flask db upgrade

# Start backend in background
echo "Starting backend on http://localhost:5000 ..."
nohup flask run --host=0.0.0.0 --port=5000 > ../backend.log 2>&1 &
BACKEND_PID=$!

# Frontend setup
cd ../frontend
npm install

# Start frontend in background (Vite)
echo "Starting frontend on http://localhost:5173 ..."
nohup npm run dev -- --host 0.0.0.0 > ../frontend.log 2>&1 &
FRONTEND_PID=$!

cat > ../scripts/pids.txt <<EOD
BACKEND_PID=$BACKEND_PID
FRONTEND_PID=$FRONTEND_PID
EOD

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "All set. Visit http://localhost:5173/ and log in."
