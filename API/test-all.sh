#!/bin/bash

# TheWay Complete Testing Script
# This script verifies all functions and buttons are working

echo "🚀 TheWay Complete Functionality Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local headers="-H 'Content-Type: application/json'"
    if [ ! -z "$token" ]; then
        headers="$headers -H 'Authorization: Bearer $token'"
    fi
    
    echo -n "Testing $method $endpoint... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "http://localhost:3001$endpoint" $headers)
    else
        response=$(curl -s -X $method "http://localhost:3001$endpoint" $headers -d "$data")
    fi
    
    if echo $response | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "1️⃣  Server Health Check"
echo "----------------------"
test_endpoint "GET" "/health" "" ""
echo ""

echo "2️⃣  Authentication Tests"
echo "------------------------"

# Test registration
echo -n "Testing user registration... "
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:3001/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "nom": "Test",
        "prenom": "User",
        "email": "test'$(date +%s)'@example.com",
        "password": "TestPassword123",
        "telephone": "+33612345678",
        "localisation": "Paris"
    }')

if echo $REGISTER_RESPONSE | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
    
    # Extract token
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $REGISTER_RESPONSE"
    ((FAILED++))
fi

# Test login
echo -n "Testing user login... "
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3001/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "TestPassword123"
    }')

if echo $LOGIN_RESPONSE | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
    LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${YELLOW}⊘ SKIP${NC} (User may not exist)"
    # Use registered token if available
    if [ ! -z "$TOKEN" ]; then
        LOGIN_TOKEN=$TOKEN
    fi
fi

# Test password recovery
test_endpoint "POST" "/auth-password-recovery" '{"email":"test@example.com"}' ""

# Test social login
test_endpoint "POST" "/auth-social" '{"provider":"google","email":"social'$(date +%s)'@example.com","nom":"Test","prenom":"Social"}' ""

echo ""

echo "3️⃣  Draft Management Tests"
echo "---------------------------"
if [ ! -z "$TOKEN" ]; then
    test_endpoint "POST" "/draft-create" '{"name":"Test Draft","page":"/test"}' "$TOKEN"
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED++))
fi
echo ""

echo "4️⃣  Entity Management Tests"
echo "---------------------------"
if [ ! -z "$TOKEN" ]; then
    test_endpoint "POST" "/entity-update" '{"label":"Test Entity","page":"/test"}' "$TOKEN"
    test_endpoint "POST" "/entity-delete" '{"label":"Test Entity","page":"/test"}' "$TOKEN"
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED+=2))
fi
echo ""

echo "5️⃣  Opportunity Tests"
echo "---------------------"
if [ ! -z "$TOKEN" ]; then
    test_endpoint "POST" "/opportunity-bookmark" '{"saved":true,"page":"/test"}' "$TOKEN"
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED++))
fi

echo -n "Testing get opportunities... "
response=$(curl -s -X GET "http://localhost:3001/api/opportunities")
if echo $response | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

echo "6️⃣  Integration Tests"
echo "---------------------"
if [ ! -z "$TOKEN" ]; then
    test_endpoint "POST" "/integration-connect" '{"label":"Test Integration","page":"/test"}' "$TOKEN"
    test_endpoint "POST" "/integration-disconnect" '{"label":"Test Integration","page":"/test"}' "$TOKEN"
    test_endpoint "POST" "/integration-update" '{"label":"Test Integration","page":"/test"}' "$TOKEN"
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED+=3))
fi
echo ""

echo "7️⃣  Process Tests"
echo "------------------"
if [ ! -z "$TOKEN" ]; then
    test_endpoint "POST" "/process-run" '{"action":"refresh","label":"Test","page":"/test"}' "$TOKEN"
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED++))
fi
echo ""

echo "8️⃣  Skills Tests"
echo "----------------"
echo -n "Testing get skills... "
if [ ! -z "$TOKEN" ]; then
    response=$(curl -s -X GET "http://localhost:3001/api/skills" -H "Authorization: Bearer $TOKEN")
else
    response=$(curl -s -X GET "http://localhost:3001/api/skills")
fi
if echo $response | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi
echo ""

echo "9️⃣  Profile Tests"
echo "------------------"
if [ ! -z "$TOKEN" ]; then
    echo -n "Testing get profile... "
    response=$(curl -s -X GET "http://localhost:3001/api/profile" -H "Authorization: Bearer $TOKEN")
    if echo $response | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
    
    echo -n "Testing update profile... "
    response=$(curl -s -X PUT "http://localhost:3001/api/profile" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"nom":"Updated","prenom":"Name","telephone":"+33123456789"}')
    if echo $response | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No auth token)"
    ((FAILED+=2))
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "✓ Passed: ${GREEN}$PASSED${NC}"
echo -e "✗ Failed: ${RED}$FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi
