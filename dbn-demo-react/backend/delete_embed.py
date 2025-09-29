#!/usr/bin/env python3
"""
Simple Python script to delete the problematic embed: dbn-demo__1fNGoMvn
Run this from the backend directory: python delete_embed.py
"""

import requests
import json

def delete_problematic_embed():
    print("🗑️ Deleting problematic embed: dbn-demo__1fNGoMvn")
    
    try:
        # Make the API call to delete the embed
        response = requests.post(
            'http://localhost:3001/api/delete-embed',
            headers={'Content-Type': 'application/json'},
            json={'embedId': 'dbn-demo__1fNGoMvn'}
        )
        
        data = response.json()
        
        if response.ok:
            print("✅ SUCCESS! Embed deleted:", data.get('embedId'))
            print("🎯 Result: No more APP_FILTER_PARAM_ERROR")
            print("📊 Only valid dashboard (dbn-demo) will remain")
            print("\n📋 Details:")
            print(f"  - ID: {data.get('id')}")
            print(f"  - Message: {data.get('message')}")
            if data.get('warning'):
                print(f"  - Warning: {data.get('warning')}")
        else:
            print("❌ FAILED:", data.get('error'))
            print("Details:", data.get('details'))
            
            if 'API Token' in str(data.get('error', '')):
                print("\n💡 Fix: Set your DATABRAIN_API_TOKEN in backend/server.js line 10")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot connect to backend")
        print("💡 Make sure backend is running: npm run dev")
    except Exception as error:
        print(f"❌ Error: {error}")

if __name__ == "__main__":
    delete_problematic_embed()
