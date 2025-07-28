#!/bin/bash

echo "🧪 Testing Vocali API Endpoints..."
echo

# 1. Health Check
echo "1. 🏥 Testing Health Check..."
curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
echo -e "\n✅ Health check completed\n"

# 2. Register new user
echo "2. 👤 Testing User Registration..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@vocali.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }' | jq . 2>/dev/null || curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@vocali.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
echo -e "\n✅ Registration test completed\n"

# 3. Login with the user
echo "3. 🔐 Testing User Login..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@vocali.com",
    "password": "TestPassword123!"
  }')

echo "$TOKEN_RESPONSE" | jq . 2>/dev/null || echo "$TOKEN_RESPONSE"
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")
echo -e "\n✅ Login test completed\n"

# 4. Test protected endpoint (if token exists)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "4. 🛡️  Testing Protected Endpoint..."
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me | jq . 2>/dev/null || curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me
  echo -e "\n✅ Protected endpoint test completed\n"
else
  echo "4. ⚠️  Skipping protected endpoint test (no token received)\n"
fi

echo "🎉 API Testing completed!"
echo
echo "📋 Summary:"
echo "✅ Server endpoints tested"
echo "✅ Check above responses for detailed results"
echo "✅ API documentation available at http://localhost:3000/api-docs"
