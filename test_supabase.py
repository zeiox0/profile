import requests
import os

# إعدادات Supabase من ملف config.js
SUPABASE_URL = "https://mtdevelmgoinumifpcpb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ"
BUCKET_NAME = "Abdallah"

def test_upload():
    # استخدام ملف فيديو حقيقي موجود في المستودع
    test_file_path = "/home/ubuntu/profile/test-video.mp4"
    if not os.path.exists(test_file_path):
        print(f"❌ File not found: {test_file_path}")
        return

    # رابط الرفع
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/test_video_{os.urandom(4).hex()}.mp4"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "video/mp4"
    }

    print(f"Attempting to upload to: {upload_url}")
    
    try:
        with open(test_file_path, "rb") as f:
            response = requests.post(upload_url, headers=headers, data=f)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Upload successful!")
        else:
            print("❌ Upload failed. Check bucket name and policies.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        pass

if __name__ == "__main__":
    test_upload()
