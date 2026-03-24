import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as c:
        yield c

def test_signup_and_login(client):
    r = client.post('/api/auth/signup', json={'email': 'a@example.com', 'password': '1234', 'role': 'applicant'})
    assert r.status_code == 201
    r = client.post('/api/auth/login', json={'email': 'a@example.com', 'password': '1234'})
    assert r.status_code == 200
    assert 'token' in r.get_json()

# further tests to assert job flow and applications should be added
