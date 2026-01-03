#!/usr/bin/env python3
"""
Find all Supabase API calls that need to be converted to SQLAlchemy
"""
import os
import re
from pathlib import Path

# Patterns to find
PATTERNS = [
    r"supabase\.table\(['\"](\w+)['\"]\)",
    r"supabase\.auth\.",
    r"supabase\.from_\(['\"](\w+)['\"]\)",
    r"\.select\(",
    r"\.insert\(",
    r"\.update\(",
    r"\.delete\(",
    r"\.eq\(",
    r"\.execute\(",
]

def find_supabase_calls(directory: str = "app"):
    """Find all Supabase calls in Python files"""
    results = {}
    
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ and similar
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
        
        for file in files:
            if not file.endswith('.py'):
                continue
            
            filepath = Path(root) / file
            
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
                    
                # Check if file uses supabase
                if 'supabase' in content.lower():
                    matches = []
                    for pattern in PATTERNS:
                        found = re.findall(pattern, content)
                        if found:
                            matches.extend(found)
                    
                    if matches:
                        results[str(filepath)] = {
                            'matches': matches,
                            'lines': []
                        }
                        
                        # Find specific lines
                        for i, line in enumerate(content.split('\n'), 1):
                            if 'supabase' in line.lower():
                                results[str(filepath)]['lines'].append((i, line.strip()))
            
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
    
    return results

if __name__ == "__main__":
    print("🔍 Finding Supabase API calls...\n")
    
    results = find_supabase_calls()
    
    if not results:
        print("✅ No Supabase calls found!")
    else:
        print(f"Found Supabase calls in {len(results)} files:\n")
        
        for filepath, data in results.items():
            print(f"\n📄 {filepath}")
            print("=" * 80)
            for line_num, line in data['lines']:
                print(f"  Line {line_num}: {line}")
