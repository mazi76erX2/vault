"""
Middleware configuration for the application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def setup_middleware(app: FastAPI):
    """Configure CORS and other middleware."""
    origins = [
        "http://localhost:8081",
        "http://localhost:3000",
        "http://81.28.6.125:8000",
        "http://localhost:8082",
        "https://vaulttesting.highcoordination.de",
        "https://demovault.highcoordination.de",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        max_age=3600,
    )
