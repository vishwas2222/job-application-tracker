PostgreSQL setup for backend:

1. Install PostgreSQL (Debian/Ubuntu):
   sudo apt update
   sudo apt install postgresql postgresql-contrib

2. Start service:
   sudo systemctl start postgresql
   sudo systemctl enable postgresql

3. Create database & user:
   sudo -u postgres psql
   CREATE DATABASE jobapp;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE jobapp TO postgres;
   \q

4. Set .env:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobapp
   SECRET_KEY=your-secret

5. Initialize DB:
   cd /home/vishwas/Arnifi/backend
   source ../venv/bin/activate
   pip install -r requirements.txt
   flask db init
   flask db migrate -m "Initial schema"
   flask db upgrade

6. Run app:
   flask run --host=0.0.0.0 --port=5000
