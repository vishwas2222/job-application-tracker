from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import jwt, datetime

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'supersecretkey'

users = []
jobs = []
applications = []
next_job_id = 1

def auth_required(role=None):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        abort(401, 'Missing token')
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except Exception as e:
        abort(401, str(e))
    if role and payload.get('role') != role:
        abort(403, 'Forbidden')
    return payload

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'applicant')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    if any(u['email'] == email for u in users):
        return jsonify({'error': 'User exists'}), 400
    users.append({'email': email, 'password': password, 'role': role})
    return jsonify({'message': 'User created'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = next((u for u in users if u['email'] == email and u['password'] == password), None)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    token = jwt.encode({'email': user['email'], 'role': user['role'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=10)}, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({'token': token})

@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    auth_required()  # any authenticated user
    return jsonify(jobs)

@app.route('/api/jobs', methods=['POST'])
def create_job():
    payload = auth_required(role='employer')
    global next_job_id
    data = request.json
    title = data.get('title')
    description = data.get('description')
    if not title or not description:
        return jsonify({'error': 'Title and description required'}), 400
    job = {'id': next_job_id, 'title': title, 'description': description, 'company': payload['email']}
    next_job_id += 1
    jobs.append(job)
    return jsonify(job), 201

@app.route('/api/jobs/<int:id>', methods=['PUT'])
def update_job(id):
    payload = auth_required(role='employer')
    job = next((j for j in jobs if j['id'] == id), None)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job['company'] != payload['email']:
        return jsonify({'error': 'Forbidden'}), 403
    data = request.json
    job['title'] = data.get('title', job['title'])
    job['description'] = data.get('description', job['description'])
    return jsonify(job)

@app.route('/api/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    payload = auth_required(role='employer')
    job = next((j for j in jobs if j['id'] == id), None)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job['company'] != payload['email']:
        return jsonify({'error': 'Forbidden'}), 403
    jobs.remove(job)
    return jsonify({'message': 'Deleted'})

@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply_job(id):
    payload = auth_required(role='applicant')
    job = next((j for j in jobs if j['id'] == id), None)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if any(app['job_id'] == id and app['applicant'] == payload['email'] for app in applications):
        return jsonify({'error': 'Already applied'}), 400
    application = {'id': len(applications) + 1, 'job_id': id, 'applicant': payload['email'], 'status': 'applied'}
    applications.append(application)
    return jsonify(application), 201

@app.route('/api/applications', methods=['GET'])
def list_applications():
    payload = auth_required()
    if payload['role'] == 'employer':
        # employer sees applications for own jobs
        employer_jobs = {j['id'] for j in jobs if j['company'] == payload['email']}
        return jsonify([a for a in applications if a['job_id'] in employer_jobs])
    return jsonify([a for a in applications if a['applicant'] == payload['email']])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
