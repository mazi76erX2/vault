# app/logger_config.py

import logging
import logging.config
import os
from logging.handlers import RotatingFileHandler

def setup_logging(
    default_level=logging.INFO,
    log_file='backend_logs.log',
    max_bytes=5 * 1024 * 1024,  # 5 MB
    backup_count=3
):
    """
    Sets up logging for the application.
    """
    logger = logging.getLogger()
    logger.setLevel(default_level)

    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(name)s - %(message)s'
    )

    # Rotating File Handler
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count
    )
    file_handler.setLevel(default_level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Stream Handler (Console)
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(default_level)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)
