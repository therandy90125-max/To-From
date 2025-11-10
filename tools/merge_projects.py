#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔄 Project Merge Tool
두 프로젝트를 자동으로 병합하고 상세 리포트를 생성합니다.
"""

import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import json

class ProjectMerger:
    def __init__(self, folder_a: str, folder_b: str, output_folder: str):
        self.folder_a = Path(folder_a).resolve()
        self.folder_b = Path(folder_b).resolve()
        self.output_folder = Path(output_folder).resolve()
        
        self.merge_log = []
        self.statistics = {
            'copied': 0,
            'added': 0,
            'replaced': 0,
            'merged': 0,
            'skipped': 0
        }
        
        # 무시할 패턴
        self.ignore_patterns = {
            'node_modules', '__pycache__', '.git', '.venv', 'venv',
            'target', 'dist', 'build', '.next', '.cache', 'coverage',
            '.idea', '.vscode', '.DS_Store', 'package-lock.json',
            'yarn.lock', 'pnpm-lock.yaml', '.mvn', 'mvnw', 'mvnw.cmd'
        }
        
        # 병합 가능한 파일
        self.mergeable_files = {
            'requirements.txt',
            'package.json',
            '.gitignore',
            'README.md'
        }
    
    def should_ignore(self, path: Path) -> bool:
        """무시해야 할 경로인지 확인"""
        for part in path.parts:
            if part in self.ignore_patterns:
                return True
        return False
    
    def log(self, message: str, level: str = 'INFO'):
        """로그 기록"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        log_entry = f"[{timestamp}] [{level}] {message}"
        self.merge_log.append(log_entry)
        print(f"  {message}")
    
    def copy_base_project(self):
        """기존 프로젝트(A)를 출력 폴더로 복사"""
        print("\n[Step 1] 기존 프로젝트 (A) 복사중...")
        
        if self.output_folder.exists():
            print(f"  ⚠️  Output folder already exists: {self.output_folder}")
            response = input("  Overwrite? (y/N): ").strip().lower()
            if response != 'y':
                print("  ❌ Merge cancelled.")
                sys.exit(0)
            shutil.rmtree(self.output_folder)
        
        shutil.copytree(
            self.folder_a,
            self.output_folder,
            ignore=shutil.ignore_patterns(*self.ignore_patterns),
            dirs_exist_ok=True
        )
        
        self.log(f"Base project copied from {self.folder_a}")
        self.statistics['copied'] = sum(1 for _ in self.output_folder.rglob('*') if _.is_file())
        print(f"  ✅ Base project copied ({self.statistics['copied']} files)")
    
    def merge_folder_b(self):
        """폴더 B의 파일을 병합"""
        print("\n[Step 2] 신규 프로젝트 (B) 파일 병합...")
        
        for file_b in self.folder_b.rglob('*'):
            if file_b.is_file() and not self.should_ignore(file_b):
                self.merge_file(file_b)
    
    def merge_file(self, file_b: Path):
        """개별 파일 병합"""
        relative_path = file_b.relative_to(self.folder_b)
        output_file = self.output_folder / relative_path
        
        # 파일명만 비교 (경로 무시)
        file_name = file_b.name
        
        # 출력 폴더에 동일한 파일명이 있는지 확인
        existing_files = list(self.output_folder.rglob(file_name))
        
        if not existing_files:
            # 새 파일 추가
            output_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_b, output_file)
            self.log(f"Added: {relative_path}", 'ADD')
            print(f"  ✅ Added: {file_name}")
            self.statistics['added'] += 1
            
        elif file_name in self.mergeable_files:
            # 병합 가능한 파일 (requirements.txt, package.json 등)
            self.merge_config_file(file_b, existing_files[0])
            self.statistics['merged'] += 1
            
        else:
            # 기존 파일 교체 (선택적)
            # 파일 크기나 수정 시간으로 판단
            if file_b.stat().st_mtime > existing_files[0].stat().st_mtime:
                shutil.copy2(file_b, existing_files[0])
                self.log(f"Replaced: {existing_files[0].relative_to(self.output_folder)} (newer version)", 'REPLACE')
                print(f"  🔄 Replaced: {file_name} (newer)")
                self.statistics['replaced'] += 1
            else:
                self.log(f"Skipped: {file_name} (older or same)", 'SKIP')
                self.statistics['skipped'] += 1
    
    def merge_config_file(self, file_b: Path, existing_file: Path):
        """설정 파일 병합 (requirements.txt, package.json)"""
        file_name = file_b.name
        print(f"  🔄 Merging {file_name}...")
        
        if file_name == 'requirements.txt':
            self.merge_requirements(file_b, existing_file)
        elif file_name == 'package.json':
            self.merge_package_json(file_b, existing_file)
        elif file_name == '.gitignore':
            self.merge_gitignore(file_b, existing_file)
        elif file_name == 'README.md':
            self.merge_readme(file_b, existing_file)
        
        self.log(f"Merged: {file_name}", 'MERGE')
        print(f"  📝 Merged: {file_name}")
    
    def merge_requirements(self, file_b: Path, existing_file: Path):
        """requirements.txt 병합"""
        # 기존 의존성
        existing_deps = set()
        if existing_file.exists():
            existing_deps = set(existing_file.read_text(encoding='utf-8').strip().split('\n'))
        
        # 신규 의존성
        new_deps = set(file_b.read_text(encoding='utf-8').strip().split('\n'))
        
        # 병합 (중복 제거, 정렬)
        all_deps = existing_deps | new_deps
        all_deps = sorted([d for d in all_deps if d.strip() and not d.startswith('#')])
        
        # 저장
        existing_file.write_text('\n'.join(all_deps) + '\n', encoding='utf-8')
    
    def merge_package_json(self, file_b: Path, existing_file: Path):
        """package.json 병합"""
        import json
        
        # 기존 설정
        existing_data = json.loads(existing_file.read_text(encoding='utf-8'))
        
        # 신규 설정
        new_data = json.loads(file_b.read_text(encoding='utf-8'))
        
        # 의존성 병합
        for dep_type in ['dependencies', 'devDependencies']:
            if dep_type in new_data:
                if dep_type not in existing_data:
                    existing_data[dep_type] = {}
                existing_data[dep_type].update(new_data[dep_type])
        
        # 저장
        existing_file.write_text(
            json.dumps(existing_data, indent=2, ensure_ascii=False) + '\n',
            encoding='utf-8'
        )
    
    def merge_gitignore(self, file_b: Path, existing_file: Path):
        """.gitignore 병합"""
        existing_lines = set(existing_file.read_text(encoding='utf-8').strip().split('\n'))
        new_lines = set(file_b.read_text(encoding='utf-8').strip().split('\n'))
        
        all_lines = existing_lines | new_lines
        all_lines = sorted([l for l in all_lines if l.strip()])
        
        existing_file.write_text('\n'.join(all_lines) + '\n', encoding='utf-8')
    
    def merge_readme(self, file_b: Path, existing_file: Path):
        """README.md 병합 (B의 내용을 섹션으로 추가)"""
        existing_content = existing_file.read_text(encoding='utf-8')
        new_content = file_b.read_text(encoding='utf-8')
        
        merged_content = existing_content + '\n\n---\n\n'
        merged_content += '## 🔄 Merged Features from Folder B\n\n'
        merged_content += new_content
        
        existing_file.write_text(merged_content, encoding='utf-8')
    
    def generate_report(self):
        """병합 리포트 생성"""
        print("\n[Step 3] 병합 리포트 생성중...")
        
        report_file = self.output_folder / 'MERGE_REPORT.md'
        
        report = f"""# 🔄 Project Merge Report

## Source Projects

- **Folder A (Base):** `{self.folder_a}`
- **Folder B (Additions):** `{self.folder_b}`

## Merge Output

- **Path:** `{self.output_folder}`
- **Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Statistics

- Total files copied: {self.statistics['copied']}
- Files added: {self.statistics['added']}
- Files replaced: {self.statistics['replaced']}
- Files merged: {self.statistics['merged']}
- Files skipped: {self.statistics['skipped']}

## Actions Taken

"""
        
        # 로그를 카테고리별로 분류
        actions = {'ADD': [], 'REPLACE': [], 'MERGE': [], 'SKIP': []}
        for log in self.merge_log:
            for action_type in actions.keys():
                if f'[{action_type}]' in log:
                    message = log.split(']')[-1].strip()
                    actions[action_type].append(message)
        
        for action_type, messages in actions.items():
            if messages:
                report += f"\n### {action_type}\n\n"
                for msg in messages:
                    report += f"- {msg}\n"
        
        report += f"""

## Next Steps

1. ✅ Review this report
2. 🧪 Test the merged project:
   ```bash
   cd {self.output_folder}
   ./start_services.ps1
   ```
3. 🔍 Compare performance with original
4. 📝 Make final decision (keep merged or rollback)

## Rollback

If you need to rollback, the original projects are untouched:

- Original Folder A: `{self.folder_a}`
- Original Folder B: `{self.folder_b}`

Simply delete this merged folder: `{self.output_folder}`

---

Generated by `merge_projects.py` on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        report_file.write_text(report, encoding='utf-8')
        self.log(f"Report generated: {report_file}")
        print(f"  📝 Report: {report_file.name}")
    
    def merge(self):
        """전체 병합 프로세스 실행"""
        print("\n" + "🔄 Project Merge Tool".center(80))
        print("=" * 80)
        
        try:
            self.copy_base_project()
            self.merge_folder_b()
            self.generate_report()
            
            print("\n" + "="*80)
            print("✅ Merge complete!")
            print("="*80)
            print(f"\n📁 Output: {self.output_folder}")
            print(f"📝 Report: {self.output_folder / 'MERGE_REPORT.md'}")
            print("\n🚀 Next: Review the report and test the merged project\n")
            
        except Exception as e:
            print(f"\n❌ Error during merge: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


def main():
    print("\n" + "🔄 Project Merge Tool".center(80))
    print("=" * 80 + "\n")
    
    # 입력 받기
    if len(sys.argv) >= 4:
        folder_a = sys.argv[1]
        folder_b = sys.argv[2]
        output_folder = sys.argv[3]
    else:
        folder_a = input("Folder A (기존 경로): ").strip()
        folder_b = input("Folder B (신규 경로): ").strip()
        output_folder = input("Output folder (결과 저장 위치): ").strip()
    
    # 경로 검증
    if not Path(folder_a).exists():
        print(f"❌ Error: Folder A not found: {folder_a}")
        sys.exit(1)
    
    if not Path(folder_b).exists():
        print(f"❌ Error: Folder B not found: {folder_b}")
        sys.exit(1)
    
    # 병합 실행
    merger = ProjectMerger(folder_a, folder_b, output_folder)
    merger.merge()


if __name__ == '__main__':
    main()

