import os
import re

def find_and_remove_specific_emoji(filepath, target_emoji='\U0001f4e6'):
    """[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]"""
    
    if not os.path.exists(filepath):
        print(f"[ERROR] File not found: {filepath}")
        return False
    
    print(f"\n[SCAN] Searching in: {filepath}")
    
    # [EMOJI] [EMOJI]
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    found_emoji = False
    modified_lines = []
    
    # [EMOJI] [EMOJI]
    for line_num, line in enumerate(lines, 1):
        if target_emoji in line:
            # [EMOJI] [EMOJI] ([EMOJI] [EMOJI])
            safe_line = re.sub(r'[\U0001F300-\U0001F9FF\U00002600-\U000027BF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251\U0001FA00-\U0001FAFF]+', '[EMOJI]', line.strip()[:80])
            print(f"  [FOUND] Line {line_num}: {safe_line}...")
            # [EMOJI] [PACKAGE][EMOJI] [EMOJI]
            modified_line = line.replace(target_emoji, '[PACKAGE]')
            modified_lines.append(modified_line)
            found_emoji = True
        else:
            # [EMOJI] [EMOJI] [EMOJI] ([EMOJI])
            emoji_pattern = re.compile(
                "["
                "\U0001F300-\U0001F9FF"
                "\U00002600-\U000027BF"
                "\U0001F600-\U0001F64F"
                "\U0001F680-\U0001F6FF"
                "\U0001F1E0-\U0001F1FF"
                "\U00002702-\U000027B0"
                "\U000024C2-\U0001F251"
                "\U0001FA00-\U0001FAFF"
                "]+",
                flags=re.UNICODE
            )
            
            if emoji_pattern.search(line):
                # [EMOJI] [EMOJI] ([EMOJI] [EMOJI])
                safe_line = emoji_pattern.sub('[EMOJI]', line.strip()[:80])
                print(f"  [FOUND] Other emoji at line {line_num}: {safe_line}...")
                modified_line = emoji_pattern.sub('[EMOJI]', line)
                modified_lines.append(modified_line)
                found_emoji = True
            else:
                modified_lines.append(line)
    
    if found_emoji:
        # [EMOJI] [EMOJI]
        backup_path = filepath + '.emoji_backup'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"  [BACKUP] Created: {backup_path}")
        
        # [EMOJI] [EMOJI] [EMOJI]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(modified_lines)
        print(f"  [FIXED] Emojis removed from {filepath}")
        return True
    else:
        print(f"  [OK] No emojis found in {filepath}")
        return False


def scan_all_python_files(directory):
    """[EMOJI] [EMOJI] [EMOJI] Python [EMOJI] [EMOJI]"""
    
    print("=" * 70)
    print("Complete Python Files Emoji Scanner")
    print("=" * 70)
    
    python_files = []
    for root, dirs, files in os.walk(directory):
        # venv, __pycache__ [EMOJI]
        dirs[:] = [d for d in dirs if d not in ['venv', '__pycache__', '.git']]
        
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                python_files.append(filepath)
    
    print(f"\n[INFO] Found {len(python_files)} Python files")
    
    fixed_count = 0
    for filepath in python_files:
        if find_and_remove_specific_emoji(filepath):
            fixed_count += 1
    
    print("\n" + "=" * 70)
    if fixed_count > 0:
        print(f"[RESULT] Fixed {fixed_count} file(s)")
        print("\n[ACTION] Restart Flask server:")
        print("  1. Press Ctrl+C in Flask terminal")
        print("  2. Run: .\\run-flask-utf8.ps1")
    else:
        print("[RESULT] No emojis found in any Python file")
        print("\n[WARNING] Emoji might be in:")
        print("  - Binary files")
        print("  - Compiled .pyc files")
        print("  - External dependencies")
    print("=" * 70)


if __name__ == "__main__":
    # Python backend [EMOJI] [EMOJI]
    backend_dir = "C:/Users/user/Project/To-From/python-backend"
    
    if os.path.exists(backend_dir):
        scan_all_python_files(backend_dir)
    else:
        print(f"[ERROR] Directory not found: {backend_dir}")
        print("Please update the path in this script.")

