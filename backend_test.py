#!/usr/bin/env python3
"""
Backend API Testing for CyberAI BYOK Assistant
Tests all backend endpoints using curl commands
"""

import subprocess
import json
import sys
import os
from typing import Dict, Any, List

# Get backend URL from frontend .env file
def get_backend_url():
    """Get backend URL from frontend .env file"""
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None
    return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.results = []
        self.failed_tests = []
        
    def run_curl_command(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        """Run a curl command and return the result"""
        url = f"{API_BASE_URL}{endpoint}"
        
        cmd = ["curl", "-s", "-X", method, url]
        
        # Add headers
        if headers:
            for key, value in headers.items():
                cmd.extend(["-H", f"{key}: {value}"])
        
        # Add data for POST requests
        if data and method in ["POST", "PUT", "PATCH"]:
            cmd.extend(["-H", "Content-Type: application/json"])
            cmd.extend(["-d", json.dumps(data)])
        
        # Add response headers and status code
        cmd.extend(["-w", "\n%{http_code}"])
        
        try:
            print(f"Running: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            # Split response body and status code
            output_lines = result.stdout.strip().split('\n')
            if len(output_lines) >= 2:
                response_body = '\n'.join(output_lines[:-1])
                status_code = output_lines[-1]
            else:
                response_body = result.stdout.strip()
                status_code = "000"
            
            return {
                "success": result.returncode == 0,
                "status_code": int(status_code) if status_code.isdigit() else 0,
                "response": response_body,
                "error": result.stderr if result.stderr else None,
                "url": url,
                "method": method
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "status_code": 0,
                "response": "",
                "error": "Request timeout",
                "url": url,
                "method": method
            }
        except Exception as e:
            return {
                "success": False,
                "status_code": 0,
                "response": "",
                "error": str(e),
                "url": url,
                "method": method
            }
    
    def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        print("\\n=== Testing Health Check Endpoint ===")
        
        result = self.run_curl_command("GET", "/")
        
        test_result = {
            "test_name": "Health Check",
            "endpoint": "/api/",
            "method": "GET",
            "expected": "Welcome message",
            "passed": False,
            "details": {}
        }
        
        if result["success"] and result["status_code"] == 200:
            try:
                response_data = json.loads(result["response"])
                if "message" in response_data and "CyberAI" in response_data["message"]:
                    test_result["passed"] = True
                    test_result["details"] = {
                        "status_code": result["status_code"],
                        "response": response_data,
                        "message": "Health check passed successfully"
                    }
                else:
                    test_result["details"] = {
                        "status_code": result["status_code"],
                        "response": response_data,
                        "error": "Response doesn't contain expected CyberAI message"
                    }
            except json.JSONDecodeError:
                test_result["details"] = {
                    "status_code": result["status_code"],
                    "response": result["response"],
                    "error": "Response is not valid JSON"
                }
        else:
            test_result["details"] = {
                "status_code": result["status_code"],
                "response": result["response"],
                "error": result["error"] or "Request failed"
            }
        
        self.results.append(test_result)
        if not test_result["passed"]:
            self.failed_tests.append(test_result)
        
        print(f"Status: {'PASS' if test_result['passed'] else 'FAIL'}")
        print(f"Details: {test_result['details']}")
    
    def test_detect_api_key(self):
        """Test POST /api/keys/detect - Detect API key provider"""
        print("\\n=== Testing API Key Detection Endpoint ===")
        
        test_cases = [
            {
                "name": "OpenAI Key Format",
                "api_key": "sk-proj-test123",
                "expected_provider": "openai"
            },
            {
                "name": "Anthropic Key Format", 
                "api_key": "sk-ant-test123",
                "expected_provider": "anthropic"
            },
            {
                "name": "Google Key Format",
                "api_key": "AIzatest123", 
                "expected_provider": "google"
            },
            {
                "name": "Unknown Key Format",
                "api_key": "invalid-key-format",
                "expected_provider": "unknown"
            }
        ]
        
        for test_case in test_cases:
            print(f"\\nTesting: {test_case['name']}")
            
            data = {"api_key": test_case["api_key"]}
            result = self.run_curl_command("POST", "/keys/detect", data)
            
            test_result = {
                "test_name": f"Detect Key - {test_case['name']}",
                "endpoint": "/api/keys/detect",
                "method": "POST",
                "expected": f"Provider: {test_case['expected_provider']}",
                "passed": False,
                "details": {}
            }
            
            if result["success"] and result["status_code"] == 200:
                try:
                    response_data = json.loads(result["response"])
                    if (response_data.get("provider") == test_case["expected_provider"] and
                        "models" in response_data and
                        "is_valid" in response_data):
                        
                        test_result["passed"] = True
                        test_result["details"] = {
                            "status_code": result["status_code"],
                            "response": response_data,
                            "message": f"Correctly detected {test_case['expected_provider']} provider"
                        }
                    else:
                        test_result["details"] = {
                            "status_code": result["status_code"],
                            "response": response_data,
                            "error": f"Expected provider {test_case['expected_provider']}, got {response_data.get('provider')}"
                        }
                except json.JSONDecodeError:
                    test_result["details"] = {
                        "status_code": result["status_code"],
                        "response": result["response"],
                        "error": "Response is not valid JSON"
                    }
            else:
                test_result["details"] = {
                    "status_code": result["status_code"],
                    "response": result["response"],
                    "error": result["error"] or "Request failed"
                }
            
            self.results.append(test_result)
            if not test_result["passed"]:
                self.failed_tests.append(test_result)
            
            print(f"Status: {'PASS' if test_result['passed'] else 'FAIL'}")
            print(f"Details: {test_result['details']}")
    
    def test_chat_completions(self):
        """Test POST /api/chat/completions - Chat completion endpoint"""
        print("\\n=== Testing Chat Completions Endpoint ===")
        
        test_cases = [
            {
                "name": "Missing API Key",
                "data": {
                    "messages": [{"role": "user", "content": "Hello"}],
                    "provider": "openai",
                    "model": "gpt-4o-mini"
                },
                "expected_status": 400,
                "expected_error": "API key is required"
            },
            {
                "name": "Missing Messages",
                "data": {
                    "api_key": "sk-test123",
                    "provider": "openai", 
                    "model": "gpt-4o-mini"
                },
                "expected_status": 400,
                "expected_error": "Messages are required"
            },
            {
                "name": "Valid Request Structure (will fail without real key)",
                "data": {
                    "api_key": "sk-test123",
                    "messages": [{"role": "user", "content": "What is cybersecurity?"}],
                    "provider": "openai",
                    "model": "gpt-4o-mini",
                    "session_id": "test-session"
                },
                "expected_status": 200,
                "expected_error": None,
                "expect_failure": True  # This will fail without real API key
            }
        ]
        
        for test_case in test_cases:
            print(f"\\nTesting: {test_case['name']}")
            
            result = self.run_curl_command("POST", "/chat/completions", test_case["data"])
            
            test_result = {
                "test_name": f"Chat Completions - {test_case['name']}",
                "endpoint": "/api/chat/completions",
                "method": "POST",
                "expected": test_case.get("expected_error", "Valid response structure"),
                "passed": False,
                "details": {}
            }
            
            if result["success"]:
                try:
                    response_data = json.loads(result["response"])
                    
                    # Check for validation errors (400 status)
                    if test_case["expected_status"] == 400:
                        if (result["status_code"] == 400 and 
                            test_case["expected_error"] in result["response"]):
                            test_result["passed"] = True
                            test_result["details"] = {
                                "status_code": result["status_code"],
                                "response": response_data,
                                "message": f"Correctly returned validation error: {test_case['expected_error']}"
                            }
                        else:
                            test_result["details"] = {
                                "status_code": result["status_code"],
                                "response": response_data,
                                "error": f"Expected 400 status with '{test_case['expected_error']}' error"
                            }
                    
                    # Check for valid request structure (200 status)
                    elif test_case["expected_status"] == 200:
                        if (result["status_code"] == 200 and 
                            "success" in response_data):
                            
                            # For requests with fake API keys, we expect success=False
                            if test_case.get("expect_failure"):
                                if not response_data.get("success"):
                                    test_result["passed"] = True
                                    test_result["details"] = {
                                        "status_code": result["status_code"],
                                        "response": response_data,
                                        "message": "Endpoint structure is correct, failed as expected with fake API key"
                                    }
                                else:
                                    test_result["details"] = {
                                        "status_code": result["status_code"],
                                        "response": response_data,
                                        "error": "Expected failure with fake API key but got success"
                                    }
                            else:
                                test_result["passed"] = True
                                test_result["details"] = {
                                    "status_code": result["status_code"],
                                    "response": response_data,
                                    "message": "Valid response structure"
                                }
                        else:
                            test_result["details"] = {
                                "status_code": result["status_code"],
                                "response": response_data,
                                "error": f"Expected 200 status with success field"
                            }
                
                except json.JSONDecodeError:
                    test_result["details"] = {
                        "status_code": result["status_code"],
                        "response": result["response"],
                        "error": "Response is not valid JSON"
                    }
            else:
                test_result["details"] = {
                    "status_code": result["status_code"],
                    "response": result["response"],
                    "error": result["error"] or "Request failed"
                }
            
            self.results.append(test_result)
            if not test_result["passed"]:
                self.failed_tests.append(test_result)
            
            print(f"Status: {'PASS' if test_result['passed'] else 'FAIL'}")
            print(f"Details: {test_result['details']}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"Starting Backend API Tests for: {API_BASE_URL}")
        print("=" * 60)
        
        # Run all test methods
        self.test_health_check()
        self.test_detect_api_key()
        self.test_chat_completions()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = total_tests - len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\\nFAILED TESTS:")
            print("-" * 40)
            for test in self.failed_tests:
                print(f"❌ {test['test_name']}")
                print(f"   Endpoint: {test['endpoint']}")
                print(f"   Expected: {test['expected']}")
                print(f"   Error: {test['details'].get('error', 'Unknown error')}")
                print()
        
        print("\\nPASSED TESTS:")
        print("-" * 40)
        for test in self.results:
            if test["passed"]:
                print(f"✅ {test['test_name']}")
        
        return len(self.failed_tests) == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)