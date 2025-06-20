import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


#Security config
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
