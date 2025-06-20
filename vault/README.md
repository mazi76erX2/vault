# HICO Vault - Enterprise Document Management

Simple, secure document management with LDAP integration.

## 🚀 Quick Start

```bash
# 1. Set up the database
python scripts/setup_supabase_database.py --setup

# 2. Verify it's working
python scripts/setup_supabase_database.py --verify
```

## Commands

- `--setup` - Set up database
- `--verify` - Verify setup  
- `--ldap config.json` - Add LDAP connector

## Requirements

- Python 3.8+
- Supabase CLI
- PostgreSQL

## Environment Setup

Copy `.env.example` to `.env` and configure your database settings.

## LDAP Configuration

Create a JSON file with your LDAP settings:

```json
{
  "name": "MyCompany-LDAP",
  "host": "ldap.mycompany.com",
  "username": "CN=service,DC=company,DC=com",
  "password": "your_password"
}
```

Then run:
```bash
python scripts/setup_supabase_database.py --ldap myconfig.json
```

## Support

- Check the scripts in `scripts/` folder
- Review database migrations in `supabase/migrations/`
- Check logs for errors

---

**HICO Vault** - Clean, Simple, Secure
 