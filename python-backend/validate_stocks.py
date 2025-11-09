#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
주식 데이터 JSON 파일 검증 스크립트
"""
import json
import os
import sys
from pathlib import Path

# Windows 콘솔 UTF-8 인코딩 설정
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def validate_korean_stocks(file_path):
    """한국 주식 데이터 검증"""
    print(f"\n{'='*60}")
    print(f"한국 주식 데이터 검증: {file_path}")
    print(f"{'='*60}")
    
        if not os.path.exists(file_path):
            print(f"[ERROR] 파일이 존재하지 않습니다: {file_path}")
            return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            print("[ERROR] JSON 파일이 배열 형식이 아닙니다")
            return False
        
        total = len(data)
        print(f"[OK] 총 주식 수: {total}개")
        
        # 필수 필드 검증
        required_fields = ['ticker', 'name_en', 'name_ko', 'market']
        errors = []
        
        for i, stock in enumerate(data):
            for field in required_fields:
                if field not in stock:
                    errors.append(f"항목 {i+1}: 필수 필드 '{field}' 누락")
        
        if errors:
            print(f"\n❌ 검증 실패 ({len(errors)}개 오류):")
            for error in errors[:10]:  # 최대 10개만 표시
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... 외 {len(errors) - 10}개 오류")
            return False
        
        # 티커 형식 검증 (6자리 숫자)
        ticker_errors = []
        for i, stock in enumerate(data):
            ticker = stock.get('ticker', '')
            if not ticker.isdigit() or len(ticker) != 6:
                ticker_errors.append(f"항목 {i+1}: 티커 '{ticker}'는 6자리 숫자가 아닙니다")
        
        if ticker_errors:
            print(f"\n[WARNING] 티커 형식 오류 ({len(ticker_errors)}개):")
            for error in ticker_errors[:10]:
                print(f"  - {error}")
            if len(ticker_errors) > 10:
                print(f"  ... 외 {len(ticker_errors) - 10}개 오류")
        
        # 시장별 통계
        kospi_count = sum(1 for s in data if s.get('market') == 'KOSPI')
        kosdaq_count = sum(1 for s in data if s.get('market') == 'KOSDAQ')
        other_count = total - kospi_count - kosdaq_count
        
        print(f"\n📊 시장별 통계:")
        print(f"  - KOSPI: {kospi_count}개")
        print(f"  - KOSDAQ: {kosdaq_count}개")
        if other_count > 0:
            print(f"  - 기타: {other_count}개")
        
        # 섹터별 통계
        sectors = {}
        for stock in data:
            sector = stock.get('sector', '미분류')
            sectors[sector] = sectors.get(sector, 0) + 1
        
        print(f"\n📊 섹터별 통계 (상위 10개):")
        for sector, count in sorted(sectors.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  - {sector}: {count}개")
        
        # 최소 요구사항 확인
        min_required = 200
        min_kospi = 100
        min_kosdaq = 100
        
        print(f"\n[CHECK] 최소 요구사항 확인:")
        print(f"  - 총 {min_required}개 이상: {'[OK]' if total >= min_required else '[FAIL]'} ({total}/{min_required})")
        print(f"  - KOSPI {min_kospi}개 이상: {'[OK]' if kospi_count >= min_kospi else '[FAIL]'} ({kospi_count}/{min_kospi})")
        print(f"  - KOSDAQ {min_kosdaq}개 이상: {'[OK]' if kosdaq_count >= min_kosdaq else '[FAIL]'} ({kosdaq_count}/{min_kosdaq})")
        
        if total >= min_required and kospi_count >= min_kospi and kosdaq_count >= min_kosdaq:
            print(f"\n[OK] 모든 검증 통과!")
            return True
        else:
            print(f"\n[WARNING] 최소 요구사항 미달")
            return False
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON 파싱 오류: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        return False

def validate_us_stocks(file_path):
    """미국 주식/ETF 데이터 검증"""
    print(f"\n{'='*60}")
    print(f"미국 주식/ETF 데이터 검증: {file_path}")
    print(f"{'='*60}")
    
        if not os.path.exists(file_path):
            print(f"[ERROR] 파일이 존재하지 않습니다: {file_path}")
            return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            print("[ERROR] JSON 파일이 배열 형식이 아닙니다")
            return False
        
        total = len(data)
        print(f"[OK] 총 종목 수: {total}개")
        
        # 필수 필드 검증
        required_fields = ['symbol', 'name', 'type']
        errors = []
        
        for i, stock in enumerate(data):
            for field in required_fields:
                if field not in stock:
                    errors.append(f"항목 {i+1}: 필수 필드 '{field}' 누락")
        
        if errors:
            print(f"\n❌ 검증 실패 ({len(errors)}개 오류):")
            for error in errors[:10]:
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... 외 {len(errors) - 10}개 오류")
            return False
        
        # 타입별 통계
        stock_count = sum(1 for s in data if s.get('type') == 'STOCK')
        etf_count = sum(1 for s in data if s.get('type') == 'ETF')
        other_count = total - stock_count - etf_count
        
        print(f"\n📊 타입별 통계:")
        print(f"  - STOCK: {stock_count}개")
        print(f"  - ETF: {etf_count}개")
        if other_count > 0:
            print(f"  - 기타: {other_count}개")
        
        # 섹터별 통계
        sectors = {}
        for stock in data:
            sector = stock.get('sector', '미분류')
            sectors[sector] = sectors.get(sector, 0) + 1
        
        print(f"\n📊 섹터별 통계 (상위 10개):")
        for sector, count in sorted(sectors.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  - {sector}: {count}개")
        
        # 최소 요구사항 확인
        min_required = 600
        min_stocks = 500  # S&P 500
        min_etfs = 100
        
        print(f"\n[CHECK] 최소 요구사항 확인:")
        print(f"  - 총 {min_required}개 이상: {'[OK]' if total >= min_required else '[FAIL]'} ({total}/{min_required})")
        print(f"  - 주식 {min_stocks}개 이상: {'[OK]' if stock_count >= min_stocks else '[FAIL]'} ({stock_count}/{min_stocks})")
        print(f"  - ETF {min_etfs}개 이상: {'[OK]' if etf_count >= min_etfs else '[FAIL]'} ({etf_count}/{min_etfs})")
        
        if total >= min_required and stock_count >= min_stocks and etf_count >= min_etfs:
            print(f"\n[OK] 모든 검증 통과!")
            return True
        else:
            print(f"\n[WARNING] 최소 요구사항 미달")
            return False
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON 파싱 오류: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        return False

if __name__ == '__main__':
    base_dir = Path(__file__).parent / 'data'
    
    korean_file = base_dir / 'korean_stocks.json'
    us_file = base_dir / 'us_stocks.json'
    
    print("="*60)
    print("주식 데이터 검증 스크립트")
    print("="*60)
    
    korean_ok = validate_korean_stocks(korean_file)
    us_ok = validate_us_stocks(us_file)
    
    print(f"\n{'='*60}")
    print("최종 결과:")
    print(f"  - 한국 주식: {'[OK] 통과' if korean_ok else '[FAIL] 실패'}")
    print(f"  - 미국 주식/ETF: {'[OK] 통과' if us_ok else '[FAIL] 실패' if os.path.exists(us_file) else '[WARNING] 파일 없음'}")
    print(f"{'='*60}\n")

