import re
from pathlib import Path

print("🔧 Fixing status code constants...\n")

# Find all Python files
files = list(Path("app").rglob("*.py"))

pattern = r'status\.HTTP(\d+)_'
replacement = r'status.HTTP_\1_'

for file in files:
    content = file.read_text()
    original = content
    
    # Fix status codes (add underscore after HTTP)
    content = re.sub(pattern, replacement, content)
    
    if content != original:
        print(f"Fixed: {file}")
        file.write_text(content)

print("\n✅ All status codes fixed!\n")
