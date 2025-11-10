#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📊 Project Comparison Tool
자동으로 두 프로젝트를 비교하고 병합 전략을 제안합니다.
"""

import os
import sys
from pathlib import Path
import json
from collections import defaultdict
from typing import Dict, List, Tuple

class ProjectComparator:
    def __init__(self, folder_a: str, folder_b: str):
        self.folder_a = Path(folder_a).resolve()
        self.folder_b = Path(folder_b).resolve()
        self.comparison = defaultdict(dict)
        
        # 무시할 디렉토리/파일
        self.ignore_patterns = {
            'node_modules', '__pycache__', '.git', '.venv', 'venv',
            'target', 'dist', 'build', '.next', '.cache', 'coverage',
            '.idea', '.vscode', '.DS_Store', 'package-lock.json',
            'yarn.lock', 'pnpm-lock.yaml'
        }
    
    def should_ignore(self, path: Path) -> bool:
        """무시해야 할 경로인지 확인"""
        for part in path.parts:
            if part in self.ignore_patterns:
                return True
        return False
    
    def scan_directory(self, root_path: Path) -> Dict[str, List[Path]]:
        """디렉토리를 스캔하여 파일을 카테고리별로 분류"""
        categories = defaultdict(list)
        
        for file_path in root_path.rglob('*'):
            if file_path.is_file() and not self.should_ignore(file_path):
                relative_path = file_path.relative_to(root_path)
                
                # 카테고리 결정
                if 'backend' in relative_path.parts or file_path.suffix == '.java':
                    categories['backend'].append(relative_path)
                elif 'frontend' in relative_path.parts or file_path.suffix in ['.jsx', '.tsx', '.js', '.ts']:
                    categories['frontend'].append(relative_path)
                elif 'python' in str(relative_path).lower() or file_path.suffix == '.py':
                    categories['python'].append(relative_path)
                elif file_path.name in ['requirements.txt', 'package.json', 'pom.xml']:
                    categories['config'].append(relative_path)
                else:
                    categories['other'].append(relative_path)
        
        return categories
    
    def analyze_quantum_files(self, folder: Path) -> Dict:
        """양자 최적화 파일 분석"""
        quantum_info = {
            'files': [],
            'reps': None,
            'maxiter': None,
            'algorithms': []
        }
        
        for py_file in folder.rglob('*.py'):
            if self.should_ignore(py_file):
                continue
                
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            
            # QAOA 관련 키워드 검색
            if any(keyword in content.lower() for keyword in ['qaoa', 'quantum', 'qiskit', 'vqe']):
                quantum_info['files'].append(py_file.name)
                
                # reps 파라미터 찾기
                if 'reps=' in content and quantum_info['reps'] is None:
                    try:
                        reps_line = [line for line in content.split('\n') if 'reps=' in line][0]
                        reps_value = reps_line.split('reps=')[1].split(',')[0].split(')')[0].strip()
                        quantum_info['reps'] = int(reps_value)
                    except:
                        pass
                
                # maxiter 파라미터 찾기
                if 'maxiter=' in content and quantum_info['maxiter'] is None:
                    try:
                        maxiter_line = [line for line in content.split('\n') if 'maxiter=' in line][0]
                        maxiter_value = maxiter_line.split('maxiter=')[1].split(',')[0].split(')')[0].strip()
                        quantum_info['maxiter'] = int(maxiter_value)
                    except:
                        pass
                
                # 알고리즘 감지
                if 'qaoa' in content.lower():
                    quantum_info['algorithms'].append('QAOA')
                if 'vqe' in content.lower():
                    quantum_info['algorithms'].append('VQE')
                if 'qmvs' in content.lower():
                    quantum_info['algorithms'].append('QMVS')
        
        quantum_info['algorithms'] = list(set(quantum_info['algorithms']))
        return quantum_info
    
    def compare(self) -> Dict:
        """두 프로젝트 비교"""
        print("\n" + "="*80)
        print("PROJECT COMPARISON")
        print("="*80 + "\n")
        
        # 폴더 A 분석
        print(f"[A] Folder A (Existing): {self.folder_a}")
        categories_a = self.scan_directory(self.folder_a)
        quantum_a = self.analyze_quantum_files(self.folder_a)
        
        for category, files in categories_a.items():
            print(f"  Layer: {category:12s} - {len(files)} files")
        
        if quantum_a['files']:
            reps_str = f"reps={quantum_a['reps']}" if quantum_a['reps'] else "reps=?"
            maxiter_str = f"maxiter={quantum_a['maxiter']}" if quantum_a['maxiter'] else "maxiter=?"
            algo_str = ', '.join(quantum_a['algorithms']) if quantum_a['algorithms'] else 'Unknown'
            print(f"  Quantum: {len(quantum_a['files'])} files ({reps_str}, {maxiter_str}, algo={algo_str})")
        
        print()
        
        # 폴더 B 분석
        print(f"[B] Folder B (New): {self.folder_b}")
        categories_b = self.scan_directory(self.folder_b)
        quantum_b = self.analyze_quantum_files(self.folder_b)
        
        for category, files in categories_b.items():
            print(f"  Layer: {category:12s} - {len(files)} files")
        
        if quantum_b['files']:
            reps_str = f"reps={quantum_b['reps']}" if quantum_b['reps'] else "reps=?"
            maxiter_str = f"maxiter={quantum_b['maxiter']}" if quantum_b['maxiter'] else "maxiter=?"
            algo_str = ', '.join(quantum_b['algorithms']) if quantum_b['algorithms'] else 'Unknown'
            print(f"  Quantum: {len(quantum_b['files'])} files ({reps_str}, {maxiter_str}, algo={algo_str})")
            
            if len(quantum_b['files']) > len(quantum_a['files']):
                print(f"  [!] {len(quantum_b['files']) - len(quantum_a['files'])} more quantum files detected!")
        
        print()
        
        # 병합 전략 생성
        print("="*80)
        print("MERGE STRATEGY")
        print("="*80 + "\n")
        
        strategy = self.generate_strategy(categories_a, categories_b, quantum_a, quantum_b)
        
        for layer, info in strategy.items():
            print(f"[{layer.upper()}]")
            print(f"  Action: {info['action']}")
            print(f"  Priority: {info['priority']}")
            print(f"  Risk: {info['risk']}")
            if 'details' in info and info['details']:
                print(f"  Details:")
                for detail in info['details']:
                    print(f"    {detail}")
            print()
        
        return {
            'folder_a': str(self.folder_a),
            'folder_b': str(self.folder_b),
            'categories_a': {k: len(v) for k, v in categories_a.items()},
            'categories_b': {k: len(v) for k, v in categories_b.items()},
            'quantum_a': quantum_a,
            'quantum_b': quantum_b,
            'strategy': strategy
        }
    
    def generate_strategy(self, cat_a, cat_b, quantum_a, quantum_b) -> Dict:
        """병합 전략 생성"""
        strategy = {}
        
        # Backend 전략
        backend_diff = len(cat_b.get('backend', [])) - len(cat_a.get('backend', []))
        if backend_diff > 0:
            strategy['backend'] = {
                'action': 'Keep existing, cherry-pick improvements',
                'priority': 'MEDIUM',
                'risk': 'LOW',
                'details': [
                    f"✓ {backend_diff} new files in Folder B",
                    '✓ Review for useful additions'
                ]
            }
        else:
            strategy['backend'] = {
                'action': 'Keep Folder A (no improvements detected)',
                'priority': 'LOW',
                'risk': 'NONE'
            }
        
        # Quantum 전략
        quantum_diff = len(quantum_b['files']) - len(quantum_a['files'])
        if quantum_diff > 0 or quantum_b['algorithms'] != quantum_a['algorithms']:
            details = [
                f"✓ New quantum files detected ({quantum_diff} more files)" if quantum_diff > 0 else None,
                f"✓ New algorithms: {', '.join(set(quantum_b['algorithms']) - set(quantum_a['algorithms']))}" if set(quantum_b['algorithms']) - set(quantum_a['algorithms']) else None,
                '✓ Need to benchmark: response time',
                '✓ Need to validate: accuracy within ±5%'
            ]
            strategy['quantum'] = {
                'action': 'Add as /api/optimize-v2',
                'priority': 'CRITICAL [*]',
                'risk': 'MEDIUM (needs testing)',
                'details': [d for d in details if d]
            }
        else:
            strategy['quantum'] = {
                'action': 'Keep Folder A (no changes)',
                'priority': 'LOW',
                'risk': 'NONE'
            }
        
        # Frontend 전략
        frontend_diff = len(cat_b.get('frontend', [])) - len(cat_a.get('frontend', []))
        if frontend_diff > 0:
            strategy['frontend'] = {
                'action': 'Component-level integration',
                'priority': 'MEDIUM',
                'risk': 'LOW',
                'details': [
                    f"✓ {frontend_diff} new components in Folder B",
                    '✓ Review for UI improvements'
                ]
            }
        else:
            strategy['frontend'] = {
                'action': 'Keep Folder A',
                'priority': 'LOW',
                'risk': 'NONE'
            }
        
        return strategy


def main():
    # Windows cp949 encoding fix
    import sys
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print("\n" + "Project Comparison Tool".center(80))
    print("=" * 80 + "\n")
    
    # 입력 받기
    if len(sys.argv) >= 3:
        folder_a = sys.argv[1]
        folder_b = sys.argv[2]
    else:
        folder_a = input("Folder A (기존 QuantaFolio 경로): ").strip()
        folder_b = input("Folder B (신규 Optimizer 경로): ").strip()
    
    # 경로 검증
    if not Path(folder_a).exists():
        print(f"❌ Error: Folder A not found: {folder_a}")
        sys.exit(1)
    
    if not Path(folder_b).exists():
        print(f"❌ Error: Folder B not found: {folder_b}")
        sys.exit(1)
    
    # 비교 실행
    comparator = ProjectComparator(folder_a, folder_b)
    result = comparator.compare()
    
    # 결과 저장
    output_file = Path('comparison_result.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print("="*80)
    print(f"[OK] Comparison complete!")
    print(f"[FILE] Results saved to: {output_file.absolute()}")
    print("="*80 + "\n")
    
    # 다음 단계 안내
    print("[NEXT] Next Steps:")
    print("  1. Review the comparison results above")
    print("  2. If satisfied, run: python tools/merge_projects.py")
    print("  3. Or manually cherry-pick files you want\n")


if __name__ == '__main__':
    main()

