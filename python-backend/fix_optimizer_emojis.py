import re
import os

def fix_optimizer_file():
    """optimizer.py[EMOJI] [EMOJI] [EMOJI] [EMOJI]"""
    
    filepath = "C:/Users/user/Project/To-From/python-backend/optimizer.py"
    
    if not os.path.exists(filepath):
        print(f"[ERROR] [EMOJI] [EMOJI] [EMOJI] [EMOJI]: {filepath}")
        return False
    
    # [EMOJI] [EMOJI]
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # [EMOJI] [EMOJI]
    backup_path = filepath + '.backup'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] [EMOJI] [EMOJI]: {backup_path}")
    
    # [EMOJI] [EMOJI] [EMOJI]
    replacements = {
        '[EMOJI]': '[START]',
        '[PACKAGE]': '[PACKAGE]',
        '[EMOJI]': '[OK]',
        '[EMOJI]': '[ERROR]',
        '[EMOJI]': '[WARNING]',
        '[EMOJI]': '[TARGET]',
        '[EMOJI]': '[CONFIG]',
        '[EMOJI]': '[DATA]',
        '[EMOJI]': '[TEST]',
        '[EMOJI]': '[INFO]',
        '⏱[EMOJI]': '[TIME]',
        '[EMOJI]': '[SEARCH]',
        '[EMOJI]': '[LOG]',
        '[EMOJI]': '[WEB]',
        '[EMOJI]': '[LINK]',
        '[EMOJI]': '[CHART]',
        '[EMOJI]': '[DOWN]',
        '‼[EMOJI]': '[!!]',
        '[EMOJI]': '[FAST]',
    }
    
    # [EMOJI] [EMOJI]
    original_content = content
    for emoji, replacement in replacements.items():
        content = content.replace(emoji, replacement)
    
    # [EMOJI] [EMOJI] [EMOJI] [EMOJI] ([EMOJI] [EMOJI])
    emoji_pattern = re.compile(
        "["
        "\U0001F300-\U0001F9FF"  # [EMOJI] & [EMOJI]
        "\U00002600-\U000027BF"  # [EMOJI] [EMOJI]
        "\U0001F600-\U0001F64F"  # [EMOJI]
        "\U0001F680-\U0001F6FF"  # [EMOJI] & [EMOJI]
        "\U0001F1E0-\U0001F1FF"  # [EMOJI]
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001FA00-\U0001FAFF"  # [EMOJI] [EMOJI]
        "]+",
        flags=re.UNICODE
    )
    content = emoji_pattern.sub('[EMOJI]', content)
    
    # [EMOJI] [EMOJI]
    if content != original_content:
        # [EMOJI] [EMOJI] [EMOJI]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] [EMOJI] [EMOJI] [EMOJI]: {filepath}")
        print(f"[OK] [EMOJI] [EMOJI] [EMOJI]: {len(original_content) - len(content)}")
        return True
    else:
        print(f"[INFO] [EMOJI] [EMOJI] [EMOJI]: {filepath}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("optimizer.py [EMOJI] [EMOJI] [EMOJI]")
    print("=" * 60)
    
    success = fix_optimizer_file()
    
    if success:
        print("\n[OK] [EMOJI]! Flask [EMOJI] [EMOJI].")
        print("  PowerShell[EMOJI]: Ctrl+C -> .\\run-flask-utf8.ps1")
    else:
        print("\n[WARNING] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].")

