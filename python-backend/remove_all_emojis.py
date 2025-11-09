#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Emoji Remover for Python Files
모든 이모지를 완전히 제거합니다.
"""

import os
import re
from datetime import datetime

def remove_all_emojis(filepath):
    """파일에서 모든 이모지를 완전히 제거"""
    
    if not os.path.exists(filepath):
        print(f"[ERROR] File not found: {filepath}")
        return False
    
    print(f"\n[PROCESS] {os.path.basename(filepath)}")
    
    # 파일 읽기
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  [ERROR] Cannot read file: {e}")
        return False
    
    original_length = len(content)
    
    # 백업 생성
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{filepath}.backup_{timestamp}"
    try:
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [BACKUP] {os.path.basename(backup_path)}")
    except Exception as e:
        print(f"  [WARNING] Backup failed: {e}")
    
    # 모든 이모지 제거 (포괄적 유니코드 범위)
    emoji_pattern = re.compile(
        "["
        "\U0001F1E0-\U0001F1FF"  # 국기
        "\U0001F300-\U0001F5FF"  # 심볼 & 픽토그램
        "\U0001F600-\U0001F64F"  # 감정 이모지
        "\U0001F680-\U0001F6FF"  # 교통 & 지도 심볼
        "\U0001F700-\U0001F77F"  # 알파벳 심볼
        "\U0001F780-\U0001F7FF"  # 기하 도형
        "\U0001F800-\U0001F8FF"  # 추가 화살표
        "\U0001F900-\U0001F9FF"  # 추가 심볼
        "\U0001FA00-\U0001FA6F"  # 확장 심볼
        "\U0001FA70-\U0001FAFF"  # 추가 확장
        "\U00002600-\U000027BF"  # 기타 심볼
        "\U0000FE00-\U0000FE0F"  # Variation Selectors
        "\U0001F900-\U0001F9FF"  # 추가 이모지
        "\U00002702-\U000027B0"  # Dingbats
        "\U000024C2-\U0001F251"  # 기타
        "]+",
        flags=re.UNICODE
    )
    
    # 이모지 찾기
    found_emojis = emoji_pattern.findall(content)
    
    if found_emojis:
        unique_emojis = set(found_emojis)
        print(f"  [FOUND] {len(found_emojis)} emojis ({len(unique_emojis)} unique)")
        
        # 처음 5개만 출력
        for emoji in list(unique_emojis)[:5]:
            print(f"    - {emoji} (U+{ord(emoji[0]):04X})")
        if len(unique_emojis) > 5:
            print(f"    ... and {len(unique_emojis) - 5} more")
    
    # 이모지 제거 (빈 문자열로 교체)
    cleaned_content = emoji_pattern.sub('', content)
    
    # 추가 정리: 연속된 공백을 하나로
    cleaned_content = re.sub(r' +', ' ', cleaned_content)
    
    # 변경사항 확인
    if cleaned_content != content:
        removed_chars = original_length - len(cleaned_content)
        
        # 저장
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            print(f"  [SAVED] Removed {removed_chars} characters")
            print(f"  [OK] File cleaned successfully")
            return True
        except Exception as e:
            print(f"  [ERROR] Cannot save file: {e}")
            return False
    else:
        print(f"  [OK] No emojis found")
        return False


def main():
    """메인 실행 함수"""
    
    print("=" * 70)
    print("Complete Emoji Remover for Python Backend")
    print("=" * 70)
    
    # 처리할 파일들
    base_dir = "C:/Users/user/Project/To-From/python-backend"
    files = [
        os.path.join(base_dir, "app.py"),
        os.path.join(base_dir, "optimizer.py")
    ]
    
    success_count = 0
    for filepath in files:
        if remove_all_emojis(filepath):
            success_count += 1
    
    print("\n" + "=" * 70)
    if success_count > 0:
        print(f"[RESULT] Successfully cleaned {success_count} file(s)")
        print("\n[NEXT STEPS]:")
        print("1. Restart Flask server:")
        print("   cd C:\\Users\\user\\Project\\To-From")
        print("   .\\run-flask-utf8.ps1")
        print("\n2. Test the API:")
        print("   curl http://localhost:5000/api/health")
    else:
        print("[RESULT] No emojis found in any files")
    print("=" * 70)


if __name__ == "__main__":
    main()

