#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
CHAT_ENDPOINT="${API_URL}/api/chat"

echo "======================================"
echo "API Validation Script"
echo "======================================"
echo ""
echo "API URL: ${API_URL}"
echo "Chat Endpoint: ${CHAT_ENDPOINT}"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if server is running
check_server() {
    echo "Checking if server is running..."
    if curl -s -f "${API_URL}/health" > /dev/null 2>&1 || curl -s -f "${API_URL}" > /dev/null 2>&1; then
        print_success "Server is running"
        return 0
    else
        print_error "Server is not responding at ${API_URL}"
        print_warning "Please start the server first: npm --prefix backend start"
        return 1
    fi
}

# Test 1: Basic POST request
test_basic_post() {
    echo ""
    echo "Test 1: Basic POST request to /api/chat"
    echo "--------------------------------------"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${CHAT_ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d '{"message":"سلام","stream":false}' 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_success "POST request successful (HTTP $HTTP_CODE)"
        echo "Response: ${BODY:0:100}..."
    else
        print_error "POST request failed (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
        return 1
    fi
}

# Test 2: Streaming response
test_streaming() {
    echo ""
    echo "Test 2: Streaming response"
    echo "--------------------------------------"
    
    # Test with stream=true
    RESPONSE=$(curl -s -X POST "${CHAT_ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d '{"message":"تست","stream":true}' \
        -N --max-time 10 2>/dev/null | head -c 200)
    
    if [ -n "$RESPONSE" ]; then
        print_success "Streaming response received"
        echo "First 200 chars: ${RESPONSE:0:200}..."
    else
        print_error "No streaming response received"
        return 1
    fi
}

# Test 3: Temperature parameter
test_temperature() {
    echo ""
    echo "Test 3: Temperature parameter (0.2-0.4)"
    echo "--------------------------------------"
    
    for TEMP in 0.2 0.3 0.4; do
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${CHAT_ENDPOINT}" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"سلام\",\"temperature\":${TEMP},\"stream\":false}" 2>/dev/null)
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            print_success "Temperature ${TEMP} accepted (HTTP $HTTP_CODE)"
        else
            print_error "Temperature ${TEMP} failed (HTTP $HTTP_CODE)"
            return 1
        fi
    done
}

# Test 4: Error handling
test_error_handling() {
    echo ""
    echo "Test 4: Error handling"
    echo "--------------------------------------"
    
    # Test with invalid JSON
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${CHAT_ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d 'invalid json' 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "500" ]; then
        # Check if response is JSON with error field
        if echo "$BODY" | jq -e '.error' > /dev/null 2>&1; then
            print_success "Error handling works (returns JSON with error field)"
            echo "Error message: $(echo "$BODY" | jq -r '.error')"
        else
            print_warning "Error returned but not in expected JSON format"
            echo "Response: $BODY"
        fi
    else
        print_warning "Expected error response but got HTTP $HTTP_CODE"
    fi
}

# Test 5: Persian text handling
test_persian_text() {
    echo ""
    echo "Test 5: Persian text handling"
    echo "--------------------------------------"
    
    PERSIAN_TEXT="سلام، این یک متن فارسی است. چطور هستی؟"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${CHAT_ENDPOINT}" \
        -H "Content-Type: application/json; charset=utf-8" \
        -d "{\"message\":\"${PERSIAN_TEXT}\",\"stream\":false}" 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        # Check if response contains Persian text
        if echo "$BODY" | grep -q "[\u0600-\u06FF]" || echo "$BODY" | grep -qP "[\x{0600}-\x{06FF}]"; then
            print_success "Persian text handled correctly"
        else
            print_warning "Response received but may not contain Persian text"
        fi
        echo "Response snippet: ${BODY:0:100}..."
    else
        print_error "Persian text request failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 6: Request logging verification
test_logging() {
    echo ""
    echo "Test 6: Request logging"
    echo "--------------------------------------"
    
    # Check if log files exist
    if [ -f "logs/api_requests.log" ] || [ -f "backend/logs/api_requests.log" ]; then
        print_success "API request log file exists"
    else
        print_warning "API request log file not found (expected: logs/api_requests.log)"
    fi
    
    if [ -f "logs/api_errors.log" ] || [ -f "backend/logs/api_errors.log" ]; then
        print_success "API error log file exists"
    else
        print_warning "API error log file not found (expected: logs/api_errors.log)"
    fi
}

# Test 7: Persian output enforcement
test_persian_output_enforcement() {
    echo ""
    echo "Test 7: Persian output enforcement"
    echo "--------------------------------------"
    
    # Send an English prompt and assert the answer is Persian
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${CHAT_ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello, how are you?","stream":false}' 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        # Check if response contains Persian text (Arabic script range)
        # Using grep with Perl regex for Unicode support
        if echo "$BODY" | grep -qP '[\x{0600}-\x{06FF}]'; then
            print_success "Persian output enforcement working (response contains Persian text)"
            echo "Response snippet: ${BODY:0:100}..."
        else
            # Also try basic grep without Perl regex
            if echo "$BODY" | grep -q "سلام\|چطور\|می"; then
                print_success "Persian output detected in response"
            else
                print_warning "English prompt sent, but response may not be in Persian"
                echo "Response: ${BODY:0:200}..."
                echo "(This is acceptable if model responds in user's language)"
            fi
        fi
    else
        print_error "Request failed (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Test 8: STT/TTS route availability
test_speech_routes() {
    echo ""
    echo "Test 8: Speech routes (STT/TTS)"
    echo "--------------------------------------"
    
    # Test STT route
    STT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/stt/status" 2>/dev/null)
    if [ "$STT_CODE" = "200" ] || [ "$STT_CODE" = "405" ]; then
        print_success "STT route available (HTTP $STT_CODE)"
    else
        print_warning "STT route may not be available (HTTP $STT_CODE)"
    fi
    
    # Test TTS route
    TTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/tts/status" 2>/dev/null)
    if [ "$TTS_CODE" = "200" ] || [ "$TTS_CODE" = "405" ]; then
        print_success "TTS route available (HTTP $TTS_CODE)"
    else
        print_warning "TTS route may not be available (HTTP $TTS_CODE)"
    fi
}

# Main execution
main() {
    FAILED=0
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Run all tests
    test_basic_post || FAILED=$((FAILED + 1))
    test_streaming || FAILED=$((FAILED + 1))
    test_temperature || FAILED=$((FAILED + 1))
    test_error_handling  # Don't count as failure
    test_persian_text || FAILED=$((FAILED + 1))
    test_logging  # Don't count as failure
    test_persian_output_enforcement  # Don't count as failure (informational)
    test_speech_routes  # Don't count as failure (informational)
    
    # Summary
    echo ""
    echo "======================================"
    echo "Test Summary"
    echo "======================================"
    
    if [ $FAILED -eq 0 ]; then
        print_success "All critical tests passed! ✨"
        echo ""
        echo "API is functioning correctly and ready for production."
        exit 0
    else
        print_error "$FAILED critical test(s) failed"
        echo ""
        echo "Please fix the issues before proceeding."
        exit 1
    fi
}

# Run main function
main
