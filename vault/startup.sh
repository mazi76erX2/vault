RUN printf '%s\n' \
'#!/bin/sh' \
'echo "Starting  Vault..."' \
'echo "Waiting for database..."' \
'sleep 5' \
'python scripts/setupsupabasedatabase.py --verify || echo "Database verification failed"' \
'exec python -m uvicorn app.main:app --host 0.0.0.0 --port 7860' \
> /app/startup.sh \
&& chmod +x /app/startup.sh

CMD ["/app/startup.sh"]
