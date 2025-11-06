#!/bin/bash

# =======================================================================
# Phase 4 Integration Testing Script
# ICD-11 Healthcare Platform - Complete End-to-End Testing
# =======================================================================

set -e  # Exit on any error

BASE_URL="http://localhost:3003/api"
TEST_EMAIL="integration-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
RESULTS_FILE="/tmp/phase4-test-results.json"

echo "🚀 Starting Phase 4 Integration Testing"
echo "========================================"
echo "Test Email: $TEST_EMAIL"
echo "Base URL: $BASE_URL"
echo ""

# Initialize results file
echo '{"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "tests": {}}' > $RESULTS_FILE

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local response="$3"
    local expected="$4"
    
    echo "📋 Test: $test_name"
    echo "   Status: $status"
    if [ ! -z "$expected" ]; then
        echo "   Expected: $expected"
    fi
    if [ ! -z "$response" ]; then
        echo "   Response: $(echo $response | jq -r '.statusCode // .error // "unknown"' 2>/dev/null || echo "invalid json")"
    fi
    echo ""
    
    # Add to results file
    local temp_file=$(mktemp)
    jq --arg name "$test_name" --arg status "$status" --arg response "$response" \
       '.tests[$name] = {"status": $status, "response": $response}' \
       $RESULTS_FILE > $temp_file && mv $temp_file $RESULTS_FILE
}

# Function to wait for rate limit
wait_for_rate_limit() {
    echo "⏳ Waiting for rate limit reset (60 seconds)..."
    sleep 60
}

# Test 1: Server Health Check
echo "1️⃣ Testing Server Health"
echo "------------------------"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/" || echo '{"error": "connection_failed"}')
if echo "$HEALTH_RESPONSE" | jq -e '.data.status == "healthy"' >/dev/null 2>&1; then
    log_test "server_health" "✅ PASS" "$HEALTH_RESPONSE" "status: healthy"
else
    log_test "server_health" "❌ FAIL" "$HEALTH_RESPONSE" "status: healthy"
    echo "❌ Server is not healthy. Exiting."
    exit 1
fi

# Test 2: User Registration
echo "2️⃣ Testing User Registration"
echo "----------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"firstName\": \"Integration\",
        \"lastName\": \"Test\",
        \"role\": \"user\"
    }" || echo '{"error": "request_failed"}')

if echo "$REGISTER_RESPONSE" | jq -e '.statusCode == 201' >/dev/null 2>&1; then
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken')
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')
    log_test "user_registration" "✅ PASS" "$REGISTER_RESPONSE" "statusCode: 201"
elif echo "$REGISTER_RESPONSE" | jq -e '.statusCode == 429' >/dev/null 2>&1; then
    log_test "user_registration" "⚠️  RATE_LIMITED" "$REGISTER_RESPONSE" "statusCode: 201"
    wait_for_rate_limit
    # Retry registration
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\",
            \"firstName\": \"Integration\",
            \"lastName\": \"Test\",
            \"role\": \"user\"
        }")
    
    if echo "$REGISTER_RESPONSE" | jq -e '.statusCode == 201' >/dev/null 2>&1; then
        ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
        REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken')
        USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')
        log_test "user_registration_retry" "✅ PASS" "$REGISTER_RESPONSE" "statusCode: 201"
    else
        log_test "user_registration_retry" "❌ FAIL" "$REGISTER_RESPONSE" "statusCode: 201"
        echo "❌ Cannot proceed without valid authentication. Exiting."
        exit 1
    fi
else
    log_test "user_registration" "❌ FAIL" "$REGISTER_RESPONSE" "statusCode: 201"
    echo "❌ Cannot proceed without valid authentication. Exiting."
    exit 1
fi

# Test 3: User Authentication Profile
echo "3️⃣ Testing Authentication Profile"
echo "---------------------------------"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN" || echo '{"error": "request_failed"}')

if echo "$PROFILE_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "auth_profile" "✅ PASS" "$PROFILE_RESPONSE" "statusCode: 200"
else
    log_test "auth_profile" "❌ FAIL" "$PROFILE_RESPONSE" "statusCode: 200"
fi

# Test 4: Search History Creation
echo "4️⃣ Testing Search History Creation"
echo "----------------------------------"
SEARCH_HISTORY_RESPONSE=$(curl -s -X POST "$BASE_URL/search-history" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "searchTerm": "diabetes mellitus",
        "language": "en",
        "resultsCount": 25,
        "filters": {
            "categories": ["endocrine"],
            "scope": "descendants"
        }
    }' || echo '{"error": "request_failed"}')

if echo "$SEARCH_HISTORY_RESPONSE" | jq -e '.statusCode == 201' >/dev/null 2>&1; then
    SEARCH_HISTORY_ID=$(echo "$SEARCH_HISTORY_RESPONSE" | jq -r '.data.id')
    log_test "search_history_creation" "✅ PASS" "$SEARCH_HISTORY_RESPONSE" "statusCode: 201"
else
    log_test "search_history_creation" "❌ FAIL" "$SEARCH_HISTORY_RESPONSE" "statusCode: 201"
fi

# Test 5: Search History Retrieval
echo "5️⃣ Testing Search History Retrieval"
echo "-----------------------------------"
GET_HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/search-history?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN" || echo '{"error": "request_failed"}')

if echo "$GET_HISTORY_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "search_history_retrieval" "✅ PASS" "$GET_HISTORY_RESPONSE" "statusCode: 200"
else
    log_test "search_history_retrieval" "❌ FAIL" "$GET_HISTORY_RESPONSE" "statusCode: 200"
fi

# Test 6: Entity Bookmark Creation
echo "6️⃣ Testing Entity Bookmark Creation"
echo "-----------------------------------"
ENTITY_BOOKMARK_RESPONSE=$(curl -s -X POST "$BASE_URL/bookmarks/entity" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "entityId": "334423054",
        "title": "Type 2 diabetes mellitus",
        "description": "Non-insulin-dependent diabetes mellitus",
        "tags": ["diabetes", "endocrine", "metabolism"],
        "notes": "Important for patient care protocols"
    }' || echo '{"error": "request_failed"}')

if echo "$ENTITY_BOOKMARK_RESPONSE" | jq -e '.statusCode == 201' >/dev/null 2>&1; then
    ENTITY_BOOKMARK_ID=$(echo "$ENTITY_BOOKMARK_RESPONSE" | jq -r '.data.id')
    log_test "entity_bookmark_creation" "✅ PASS" "$ENTITY_BOOKMARK_RESPONSE" "statusCode: 201"
else
    log_test "entity_bookmark_creation" "❌ FAIL" "$ENTITY_BOOKMARK_RESPONSE" "statusCode: 201"
fi

# Test 7: Search Bookmark Creation
echo "7️⃣ Testing Search Bookmark Creation"
echo "-----------------------------------"
SEARCH_BOOKMARK_RESPONSE=$(curl -s -X POST "$BASE_URL/bookmarks/search" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "searchTerm": "diabetes mellitus",
        "language": "en",
        "filters": {
            "categories": ["endocrine"],
            "scope": "descendants"
        },
        "title": "Diabetes Research Query",
        "description": "Comprehensive diabetes search for research",
        "tags": ["research", "diabetes", "endocrine"]
    }' || echo '{"error": "request_failed"}')

if echo "$SEARCH_BOOKMARK_RESPONSE" | jq -e '.statusCode == 201' >/dev/null 2>&1; then
    SEARCH_BOOKMARK_ID=$(echo "$SEARCH_BOOKMARK_RESPONSE" | jq -r '.data.id')
    log_test "search_bookmark_creation" "✅ PASS" "$SEARCH_BOOKMARK_RESPONSE" "statusCode: 201"
else
    log_test "search_bookmark_creation" "❌ FAIL" "$SEARCH_BOOKMARK_RESPONSE" "statusCode: 201"
fi

# Test 8: Bookmark Retrieval
echo "8️⃣ Testing Bookmark Retrieval"
echo "-----------------------------"
GET_BOOKMARKS_RESPONSE=$(curl -s -X GET "$BASE_URL/bookmarks?page=1&limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN" || echo '{"error": "request_failed"}')

if echo "$GET_BOOKMARKS_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "bookmark_retrieval" "✅ PASS" "$GET_BOOKMARKS_RESPONSE" "statusCode: 200"
else
    log_test "bookmark_retrieval" "❌ FAIL" "$GET_BOOKMARKS_RESPONSE" "statusCode: 200"
fi

# Test 9: Search Suggestions (Public)
echo "9️⃣ Testing Search Suggestions (Public)"
echo "--------------------------------------"
PUBLIC_SUGGESTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/search-suggestions/public?q=diab&limit=5" \
    || echo '{"error": "request_failed"}')

if echo "$PUBLIC_SUGGESTIONS_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "public_search_suggestions" "✅ PASS" "$PUBLIC_SUGGESTIONS_RESPONSE" "statusCode: 200"
else
    log_test "public_search_suggestions" "❌ FAIL" "$PUBLIC_SUGGESTIONS_RESPONSE" "statusCode: 200"
fi

# Test 10: Search Suggestions (User)
echo "🔟 Testing Search Suggestions (User)"
echo "------------------------------------"
USER_SUGGESTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/search-suggestions/user?q=diab&limit=5" \
    -H "Authorization: Bearer $ACCESS_TOKEN" || echo '{"error": "request_failed"}')

if echo "$USER_SUGGESTIONS_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "user_search_suggestions" "✅ PASS" "$USER_SUGGESTIONS_RESPONSE" "statusCode: 200"
else
    log_test "user_search_suggestions" "❌ FAIL" "$USER_SUGGESTIONS_RESPONSE" "statusCode: 200"
fi

# Test 11: User Analytics
echo "1️⃣1️⃣ Testing User Analytics"
echo "---------------------------"
USER_ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/search-analytics/user" \
    -H "Authorization: Bearer $ACCESS_TOKEN" || echo '{"error": "request_failed"}')

if echo "$USER_ANALYTICS_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    log_test "user_analytics" "✅ PASS" "$USER_ANALYTICS_RESPONSE" "statusCode: 200"
else
    log_test "user_analytics" "❌ FAIL" "$USER_ANALYTICS_RESPONSE" "statusCode: 200"
fi

# Test 12: Security Test - Unauthorized Access
echo "1️⃣2️⃣ Testing Unauthorized Access Protection"
echo "--------------------------------------------"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/search-history" \
    || echo '{"error": "request_failed"}')

if echo "$UNAUTHORIZED_RESPONSE" | jq -e '.statusCode == 401' >/dev/null 2>&1; then
    log_test "unauthorized_protection" "✅ PASS" "$UNAUTHORIZED_RESPONSE" "statusCode: 401"
else
    log_test "unauthorized_protection" "❌ FAIL" "$UNAUTHORIZED_RESPONSE" "statusCode: 401"
fi

# Test 13: Token Refresh
echo "1️⃣3️⃣ Testing Token Refresh"
echo "-------------------------"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" || echo '{"error": "request_failed"}')

if echo "$REFRESH_RESPONSE" | jq -e '.statusCode == 200' >/dev/null 2>&1; then
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.accessToken')
    log_test "token_refresh" "✅ PASS" "$REFRESH_RESPONSE" "statusCode: 200"
else
    log_test "token_refresh" "❌ FAIL" "$REFRESH_RESPONSE" "statusCode: 200"
fi

# Generate Test Summary
echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo "Results saved to: $RESULTS_FILE"
echo ""

# Count passed and failed tests
TOTAL_TESTS=$(jq '.tests | length' $RESULTS_FILE)
PASSED_TESTS=$(jq '[.tests[] | select(.status | contains("✅"))] | length' $RESULTS_FILE)
FAILED_TESTS=$(jq '[.tests[] | select(.status | contains("❌"))] | length' $RESULTS_FILE)
RATE_LIMITED=$(jq '[.tests[] | select(.status | contains("⚠️"))] | length' $RESULTS_FILE)

echo "📈 Total Tests: $TOTAL_TESTS"
echo "✅ Passed: $PASSED_TESTS"
echo "❌ Failed: $FAILED_TESTS"
echo "⚠️  Rate Limited: $RATE_LIMITED"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Phase 4 integration is working correctly."
else
    echo "⚠️  Some tests failed. Review the results for details."
fi

echo ""
echo "🔍 Detailed Results:"
jq '.tests' $RESULTS_FILE

echo ""
echo "✅ Integration testing complete!"