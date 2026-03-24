import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import jwt, datetime
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(32), nullable=False)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, nullable=False)
    company = db.Column(db.String(256), nullable=False)

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    applicant = db.Column(db.String(256), nullable=False)
    status = db.Column(db.String(32), nullable=False, default='applied')


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
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User exists'}), 400
    user = User(email=email, password=password, role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email, password=password).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    token = jwt.encode({'email': user.email, 'role': user.role, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=10)}, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({'token': token})

@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    auth_required()
    jobs = Job.query.all()
    return jsonify([{'id': j.id, 'title': j.title, 'description': j.description, 'company': j.company} for j in jobs])

@app.route('/api/jobs', methods=['POST'])
def create_job():
    payload = auth_required(role='employer')
    data = request.json
    title = data.get('title')
    description = data.get('description')
    if not title or not description:
        return jsonify({'error': 'Title and description required'}), 400
    job = Job(title=title, description=description, company=payload['email'])
    db.session.add(job)
    db.session.commit()
    return jsonify({'id': job.id, 'title': job.title, 'description': job.description, 'company': job.company}), 201

@app.route('/api/jobs/<int:id>', methods=['PUT'])
def update_job(id):
    payload = auth_required(role='employer')
    job = Job.query.get(id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job.company != payload['email']:
        return jsonify({'error': 'Forbidden'}), 403
    data = request.json
    job.title = data.get('title', job.title)
    job.description = data.get('description', job.description)
    db.session.commit()
    return jsonify({'id': job.id, 'title': job.title, 'description': job.description, 'company': job.company})

@app.route('/api/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    payload = auth_required(role='employer')
    job = Job.query.get(id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job.company != payload['email']:
        return jsonify({'error': 'Forbidden'}), 403
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply_job(id):
    payload = auth_required(role='applicant')
    job = Job.query.get(id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    existing = Application.query.filter_by(job_id=id, applicant=payload['email']).first()
    if existing:
        return jsonify({'error': 'Already applied'}), 400
    application = Application(job_id=id, applicant=payload['email'], status='applied')
    db.session.add(application)
    db.session.commit()
    return jsonify({'id': application.id, 'job_id': application.job_id, 'applicant': application.applicant, 'status': application.status}), 201

@app.route('/api/applications', methods=['GET'])
def list_applications():
    payload = auth_required()
    if payload['role'] == 'employer':
        employer_jobs = [j.id for j in Job.query.filter_by(company=payload['email']).all()]
        apps = Application.query.filter(Application.job_id.in_(employer_jobs)).all()
    else:
        apps = Application.query.filter_by(applicant=payload['email']).all()
    return jsonify([{'id': a.id, 'job_id': a.job_id, 'applicant': a.applicant, 'status': a.status} for a in apps])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
