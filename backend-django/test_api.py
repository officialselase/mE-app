#!/usr/bin/env python
"""
Simple API test script to verify all endpoints are working
Run this with: python test_api.py
"""

import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_endpoint(endpoint, description):
    """Test a GET endpoint"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"✅ {description}: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                print(f"   📊 Found {len(data['results'])} items")
            elif isinstance(data, list):
                print(f"   📊 Found {len(data)} items")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ {description}: Error - {e}")
        return False

def main():
    print("🧪 Testing Portfolio Backend API Endpoints\n")
    
    # Test health check
    test_endpoint('/health/', 'Health Check')
    
    # Test portfolio endpoints
    print("\n📁 Portfolio Endpoints:")
    test_endpoint('/portfolio/projects/', 'Projects')
    test_endpoint('/portfolio/thoughts/', 'Thoughts')
    test_endpoint('/portfolio/work/', 'Work Experience')
    
    # Test shop endpoints
    print("\n🛒 Shop Endpoints:")
    test_endpoint('/shop/products/', 'Products')
    
    # Test learn endpoints
    print("\n📚 Learn Endpoints:")
    test_endpoint('/learn/courses/', 'Courses')
    test_endpoint('/learn/lessons/', 'Lessons')
    test_endpoint('/learn/assignments/', 'Assignments')
    
    print("\n✨ API Test Complete!")

if __name__ == '__main__':
    main()