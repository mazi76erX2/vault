#!/usr/bin/env python3
"""
Simple backend server for testing  Vault
This is a minimal FastAPI server that provides basic endpoints on port 7860
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import json
import os

app = FastAPI(title=" Vault Backend (Simple)", version="1.0.0")

# CORS middleware to allow frontend connections
origins = [
    "http://localhost:8090",  # Frontend port
    "http://localhost:8081",  # Vite default port
    "http://localhost:3000",  # Common React port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": " Vault Backend is running", "status": "ok", "port": 7860}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "-vault-backend"}

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "api_version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/",
            "/health", 
            "/api/status",
            "/api/config"
        ]
    }

@app.get("/api/config")
async def get_config():
    """Basic configuration endpoint"""
    return {
        "frontend_url": "http://localhost:8090",
        "backend_url": "http://localhost:7860",
        "environment": "development"
    }

# Simple echo endpoint for testing
class EchoRequest(BaseModel):
    message: str

@app.post("/api/echo")
async def echo_message(request: EchoRequest):
    """Echo endpoint for testing"""
    return {"echo": request.message, "received_at": "now"}

if __name__ == "__main__":
    print("🚀 Starting  Vault Backend (Simple) on port 7860...")
    uvicorn.run(app, host="0.0.0.0", port=7860) 