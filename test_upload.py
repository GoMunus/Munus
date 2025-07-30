#!/usr/bin/env python3
import requests
import os
from PIL import Image
import io

# Create a simple test image
def create_test_image():
    # Create a 100x100 red image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_upload():
    # Test the upload endpoint
    url = "http://localhost:8000/api/v1/upload/avatar"
    
    # Create test image
    img_bytes = create_test_image()
    
    # Prepare the file
    files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
    
    # Add headers (you'll need to get a valid token)
    headers = {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'  # Replace with actual token
    }
    
    try:
        response = requests.post(url, files=files, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Upload successful!")
        else:
            print("❌ Upload failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_upload() 