#!/usr/bin/env bash
set -euo pipefail

# Colors for output
red() { printf "\033[31m%s\033[0m\n" "$*"; }
grn() { printf "\033[32m%s\033[0m\n" "$*"; }
yel() { printf "\033[33m%s\033[0m\n" "$*"; }

echo "=============================="
echo "API Validation Tests"
echo "=============================="

API_URL="${API_URL:-http://localhost:3001}"

# Test 1: Health check
echo ""
yel "Test 1: Health check endpoint"
RESPONSE=$(curl -s "${API_URL}/api/health")
if echo "$RESPONSE" | grep -q "healthy"; then
    grn "✅ Health check passed"
else
    red "❌ Health check failed"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 2: Chat endpoint (non-streaming)
echo ""
yel "Test 2: Chat endpoint (non-streaming)"
RESPONSE=$(curl -s -X POST "${API_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "سلام", "stream": false}')

if echo "$RESPONSE" | grep -q "response"; then
    grn "✅ Chat endpoint (non-streaming) passed"
else
    red "❌ Chat endpoint failed"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 3: Temperature validation
echo ""
yel "Test 3: Temperature validation (should fail)"
RESPONSE=$(curl -s -X POST "${API_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "test", "temperature": 0.9, "stream": false}')

if echo "$RESPONSE" | grep -q "error.*true"; then
    grn "✅ Temperature validation works"
else
    red "❌ Temperature validation failed"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 4: Missing message validation
echo ""
yel "Test 4: Missing message validation (should fail)"
RESPONSE=$(curl -s -X POST "${API_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"temperature": 0.3, "stream": false}')

if echo "$RESPONSE" | grep -q "error.*true"; then
    grn "✅ Missing message validation works"
else
    red "❌ Missing message validation failed"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 5: Valid temperature range
echo ""
yel "Test 5: Valid temperature (0.2-0.4)"
RESPONSE=$(curl -s -X POST "${API_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "test", "temperature": 0.3, "stream": false}')

if echo "$RESPONSE" | grep -q "response"; then
    grn "✅ Valid temperature accepted"
else
    red "❌ Valid temperature rejected"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "=============================="
grn "✅ ALL API TESTS PASSED"
echo "=============================="
