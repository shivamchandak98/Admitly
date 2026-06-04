# Auth Testing Playbook (Emergent Google Auth)

## Test User & Session Setup
```bash
mongosh --eval "
use('test_database');
var userId = 'user_test' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'parent.test.' + Date.now() + '@example.com',
  name: 'Test Parent',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Test Backend APIs
```bash
# Authenticated endpoints use either:
# 1. Cookie: session_token=<token>
# 2. Authorization: Bearer <token>

curl -X GET "$BACKEND/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BACKEND/api/applications" -H "Authorization: Bearer $TOKEN"
curl -X POST "$BACKEND/api/applications" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"school_id":"...","child_name":"Aarav","grade_applying":"Grade 1"}'
```

## Browser Testing (Playwright)
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "your-app.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://your-app.com/dashboard")
```

## Public endpoints (no auth)
- GET /api/schools
- GET /api/schools/meta
- GET /api/schools/{id}

## Protected endpoints (require session_token)
- /api/auth/me, /api/auth/logout
- /api/applications (GET/POST/PATCH/DELETE)
- /api/favourites (GET/POST/DELETE), /api/favourites/ids
