# 🚀 DEPLOYMENT CHECKLIST

Use this checklist to ensure a smooth deployment of HICO Vault.

---

## Pre-Deployment

### Infrastructure
- [ ] Server meets minimum requirements (8GB RAM, 20GB disk)
- [ ] Docker and Docker Compose installed
- [ ] Ollama installed on host machine
- [ ] Network ports are accessible (8000, 6333, 5432)
- [ ] SSL certificates obtained (for production)

### Models
- [ ] Ollama models downloaded: `ollama pull llama2`
- [ ] Embedding model downloaded: `ollama pull nomic-embed-text`
- [ ] Models tested: `ollama run llama2 "test"`

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `SECRET_KEY` changed to secure random value
- [ ] `DATABASE_URL` configured correctly
- [ ] `SUPABASE_JWT_SECRET` set
- [ ] `CORS_ORIGINS` configured for frontend URLs
- [ ] Email configuration set (if using email features)

### Database
- [ ] PostgreSQL container started
- [ ] Database migrations run: `python -c "from app.database import init_db; init_db()"`
- [ ] pgvector extension enabled
- [ ] Test connection successful

### Services
- [ ] Qdrant container started
- [ ] Qdrant accessible at http://localhost:6333
- [ ] Ollama service running
- [ ] All services healthy: `docker-compose ps`

---

## Deployment

### Code
- [ ] Latest code pulled from repository
- [ ] Python dependencies installed: `pip install -r requirements.txt`
- [ ] No syntax errors: `python -m py_compile main.py`
- [ ] Import tests pass: `python -c "import app.chat; print('OK')"`

### Data Migration (if upgrading)
- [ ] Backup existing data
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Test sample queries

### Application
- [ ] Backend starts without errors: `uvicorn main:app --host 0.0.0.0 --port 8000`
- [ ] Health endpoint responds: `curl http://localhost:8000/health`
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] Test document storage endpoint
- [ ] Test chat endpoint

---

## Post-Deployment

### Testing
- [ ] Store a test document
- [ ] Query the test document
- [ ] Test chat functionality
- [ ] Test authentication flow
- [ ] Test all user roles (Admin, Validator, Expert, Helper, Collector)
- [ ] Test access control (different security levels)
- [ ] Test WebSocket chat
- [ ] Load test with expected traffic

### Monitoring
- [ ] Application logs are being written
- [ ] Log rotation configured
- [ ] Health check endpoints monitored
- [ ] Disk usage monitored
- [ ] Memory usage monitored
- [ ] CPU usage monitored
- [ ] Set up alerting for critical errors

### Security
- [ ] HTTPS configured (production)
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Input validation tested
- [ ] SQL injection tests passed
- [ ] XSS protection verified
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] Authorization working

### Backup
- [ ] PostgreSQL backup configured
- [ ] Qdrant data backup configured
- [ ] Backup restoration tested
- [ ] Backup schedule documented
- [ ] Off-site backup configured (production)

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Troubleshooting guide reviewed
- [ ] Team trained on new system

---

## Production-Specific

### Performance
- [ ] Database indexes optimized
- [ ] Qdrant collections optimized
- [ ] Connection pooling configured
- [ ] Caching configured (if applicable)
- [ ] CDN configured for static assets
- [ ] Load balancer configured (if using multiple instances)

### High Availability
- [ ] Multiple backend instances (if needed)
- [ ] Qdrant cluster (if needed)
- [ ] PostgreSQL replication (if needed)
- [ ] Health checks configured in load balancer
- [ ] Auto-scaling configured (if using)

### Disaster Recovery
- [ ] Disaster recovery plan documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined
- [ ] Failover procedures tested
- [ ] Backup restoration tested

---

## Rollback Plan

In case of critical issues:

1. **Stop the new deployment**
   ```bash
   docker-compose down
   ```

2. **Restore previous version**
   ```bash
   git checkout <previous-commit>
   docker-compose up -d
   ```

3. **Restore database backup** (if needed)
   ```bash
   psql -U postgres -d hicovault < backup.sql
   ```

4. **Restore Qdrant data** (if needed)
   ```bash
   cp -r qdrant_backup/* qdrant_storage/
   ```

5. **Verify system is operational**

---

## Sign-Off

### Pre-Deployment
- [ ] Development team: _________________ Date: _______
- [ ] QA team: _________________ Date: _______
- [ ] Infrastructure team: _________________ Date: _______

### Post-Deployment
- [ ] Deployment successful: _________________ Date: _______
- [ ] Testing complete: _________________ Date: _______
- [ ] Production sign-off: _________________ Date: _______

---

## Notes

Add any deployment-specific notes here:

```
[Your notes here]
```

---

**Last Updated:** [Date]  
**Deployment Version:** 2.0.0  
**Deployed By:** [Name]
