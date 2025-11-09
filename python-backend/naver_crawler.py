#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
네이버 금융 크롤러
KOSPI/KOSDAQ 주식 목록 수집 및 JSON 파일 생성
"""
import requests
from bs4 import BeautifulSoup
import json
import time
import sys
from pathlib import Path

# Windows 콘솔 UTF-8 인코딩 설정
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def crawl_kospi(max_pages=5):
    """KOSPI 주식 목록 크롤링 (여러 페이지)"""
    all_stocks = []
    
    for page in range(1, max_pages + 1):
        url = f"https://finance.naver.com/sise/sise_market_sum.naver?sosok=0&page={page}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        # 네이버는 euc-kr 또는 utf-8 사용 (페이지에 따라 다름)
        if 'charset' in response.headers.get('content-type', ''):
            if 'euc-kr' in response.headers.get('content-type', '').lower():
                response.encoding = 'euc-kr'
            else:
                response.encoding = 'utf-8'
        else:
            # 기본값: euc-kr 시도
            try:
                response.encoding = 'euc-kr'
            except:
                response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 모든 테이블 찾기
        tables = soup.find_all('table')
        table = None
        for t in tables:
            # type_1, type_2, item_list 등 다양한 클래스 시도
            if t.get('class') and ('type' in str(t.get('class')) or 'item' in str(t.get('class'))):
                table = t
                break
        
        if not table and tables:
            table = tables[0]  # 첫 번째 테이블 사용
        
            if not table:
                print(f"[WARNING] KOSPI 페이지 {page} 테이블을 찾을 수 없습니다.")
                break
            
            page_stocks = []
        for row in table.find_all('tr')[1:]:  # 헤더 제외
            cols = row.find_all('td')
            if len(cols) < 2:
                continue
            
            # 첫 번째 열: 티커 (링크에서 추출 시도)
            ticker = None
            ticker_link = cols[0].find('a')
            if ticker_link:
                href = ticker_link.get('href', '')
                # href에서 티커 추출: /item/main.naver?code=005930
                if 'code=' in href:
                    ticker = href.split('code=')[1].split('&')[0].strip()
                else:
                    ticker = cols[0].text.strip()
            else:
                ticker = cols[0].text.strip()
            
            # 두 번째 열: 회사명
            name_ko = cols[1].text.strip() if len(cols) > 1 else ""
            
            # 빈 값 제외
            if not ticker or not name_ko:
                continue
            
            # 티커가 6자리 숫자인지 확인
            if ticker.isdigit() and len(ticker) == 6:
                # 중복 체크
                if not any(s['ticker'] == ticker for s in all_stocks):
                    page_stocks.append({
                        "ticker": ticker,
                        "name_ko": name_ko,
                        "name_en": "",  # 나중에 매핑
                        "market": "KOSPI",
                        "sector": ""  # 나중에 추가
                    })
        
            if not page_stocks:
                # 더 이상 데이터가 없으면 중단
                break
            
            all_stocks.extend(page_stocks)
            print(f"  페이지 {page}: {len(page_stocks)}개 수집")
            time.sleep(0.5)  # 요청 간격
        
        except Exception as e:
            print(f"[ERROR] KOSPI 페이지 {page} 크롤링 오류: {e}")
            break
    
    return all_stocks

def crawl_kosdaq(max_pages=10):
    """KOSDAQ 주식 목록 크롤링 (여러 페이지)"""
    all_stocks = []
    
    for page in range(1, max_pages + 1):
        url = f"https://finance.naver.com/sise/sise_market_sum.naver?sosok=1&page={page}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            # 네이버는 euc-kr 또는 utf-8 사용 (페이지에 따라 다름)
            if 'charset' in response.headers.get('content-type', ''):
                if 'euc-kr' in response.headers.get('content-type', '').lower():
                    response.encoding = 'euc-kr'
                else:
                    response.encoding = 'utf-8'
            else:
                # 기본값: euc-kr 시도
                try:
                    response.encoding = 'euc-kr'
                except:
                    response.encoding = 'utf-8'
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 모든 테이블 찾기
            tables = soup.find_all('table')
            table = None
            for t in tables:
                # type_1, type_2, item_list 등 다양한 클래스 시도
                if t.get('class') and ('type' in str(t.get('class')) or 'item' in str(t.get('class'))):
                    table = t
                    break
            
            if not table and tables:
                table = tables[0]  # 첫 번째 테이블 사용
            
            if not table:
                print(f"[WARNING] KOSDAQ 페이지 {page} 테이블을 찾을 수 없습니다.")
                break
            
            page_stocks = []
            for row in table.find_all('tr')[1:]:  # 헤더 제외
                cols = row.find_all('td')
                if len(cols) < 2:
                    continue
                
                # 첫 번째 열: 티커 (링크에서 추출 시도)
                ticker = None
                ticker_link = cols[0].find('a')
                if ticker_link:
                    href = ticker_link.get('href', '')
                    # href에서 티커 추출: /item/main.naver?code=005930
                    if 'code=' in href:
                        ticker = href.split('code=')[1].split('&')[0].strip()
                    else:
                        ticker = cols[0].text.strip()
                else:
                    ticker = cols[0].text.strip()
                
                # 두 번째 열: 회사명
                name_ko = cols[1].text.strip() if len(cols) > 1 else ""
                
                # 빈 값 제외
                if not ticker or not name_ko:
                    continue
                
                # 티커가 6자리 숫자인지 확인
                if ticker.isdigit() and len(ticker) == 6:
                    # 중복 체크
                    if not any(s['ticker'] == ticker for s in all_stocks):
                        page_stocks.append({
                            "ticker": ticker,
                            "name_ko": name_ko,
                            "name_en": "",  # 나중에 매핑
                            "market": "KOSDAQ",
                            "sector": ""  # 나중에 추가
                        })
            
            if not page_stocks:
                # 더 이상 데이터가 없으면 중단
                break
            
            all_stocks.extend(page_stocks)
            print(f"  페이지 {page}: {len(page_stocks)}개 수집")
            time.sleep(0.5)  # 요청 간격
        
        except Exception as e:
            print(f"[ERROR] KOSDAQ 페이지 {page} 크롤링 오류: {e}")
            break
    
    return all_stocks

def load_existing_mapping():
    """기존 JSON 파일에서 영문명 매핑 로드"""
    data_dir = Path(__file__).parent / 'data'
    json_file = data_dir / 'korean_stocks.json'
    
    if not json_file.exists():
        return {}
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        
        # {ticker: (name_en, name_ko)} 형식으로 변환
        mapping = {}
        for stock in existing_data:
            ticker = stock.get('ticker', '')
            if ticker:
                mapping[ticker] = {
                    'name_en': stock.get('name_en', ''),
                    'name_ko': stock.get('name_ko', ''),
                    'sector': stock.get('sector', '')
                }
        
        return mapping
    except Exception as e:
        print(f"기존 매핑 로드 오류: {e}")
        return {}

def enrich_with_existing_data(crawled_stocks, existing_mapping):
    """크롤링된 데이터에 기존 영문명/섹터 정보 추가"""
    enriched = []
    
    for stock in crawled_stocks:
        ticker = stock['ticker']
        
        if ticker in existing_mapping:
            # 기존 데이터 사용
            stock['name_en'] = existing_mapping[ticker]['name_en']
            stock['sector'] = existing_mapping[ticker]['sector']
            # name_ko는 크롤링된 최신 데이터 사용
        else:
            # 영문명이 없으면 한글명 사용
            stock['name_en'] = stock['name_ko']
        
        enriched.append(stock)
    
    return enriched

def save_to_json(stocks, filename='korean_stocks_crawled.json'):
    """JSON 파일로 저장"""
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(exist_ok=True)
    
    json_file = data_dir / filename
    
    # 티커 기준 정렬
    stocks_sorted = sorted(stocks, key=lambda x: x['ticker'])
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(stocks_sorted, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 저장 완료: {json_file}")
    print(f"   총 {len(stocks_sorted)}개 주식")

def merge_with_existing():
    """크롤링된 데이터와 기존 데이터 병합"""
    data_dir = Path(__file__).parent / 'data'
    crawled_file = data_dir / 'korean_stocks_crawled.json'
    existing_file = data_dir / 'korean_stocks.json'
    
    # 크롤링된 데이터 로드
    if not crawled_file.exists():
        print("[ERROR] 크롤링된 데이터 파일이 없습니다.")
        return
    
    with open(crawled_file, 'r', encoding='utf-8') as f:
        crawled = json.load(f)
    
    # 기존 데이터 로드
    existing = []
    if existing_file.exists():
        with open(existing_file, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    
    # 병합: 크롤링된 데이터 우선, 기존 데이터의 영문명/섹터 정보 보존
    existing_dict = {s['ticker']: s for s in existing}
    merged = []
    merged_tickers = set()
    
    # 크롤링된 데이터 추가 (영문명/섹터 정보 보존)
    for stock in crawled:
        ticker = stock['ticker']
        if ticker in existing_dict:
            # 기존 데이터의 영문명/섹터 사용
            stock['name_en'] = existing_dict[ticker].get('name_en', stock['name_ko'])
            stock['sector'] = existing_dict[ticker].get('sector', '')
        merged.append(stock)
        merged_tickers.add(ticker)
    
    # 기존 데이터 중 크롤링되지 않은 항목 추가
    for stock in existing:
        if stock['ticker'] not in merged_tickers:
            merged.append(stock)
    
    # 최종 저장
    save_to_json(merged, 'korean_stocks.json')
    
    # 통계 출력
    kospi_count = sum(1 for s in merged if s['market'] == 'KOSPI')
    kosdaq_count = sum(1 for s in merged if s['market'] == 'KOSDAQ')
    
    print(f"\n📊 최종 통계:")
    print(f"   - 총 주식 수: {len(merged)}개")
    print(f"   - KOSPI: {kospi_count}개")
    print(f"   - KOSDAQ: {kosdaq_count}개")

if __name__ == '__main__':
    print("=" * 60)
    print("네이버 금융 크롤러 시작")
    print("=" * 60)
    
    # KOSPI 크롤링
    print("\n[1/2] KOSPI 크롤링 중...")
    kospi_stocks = crawl_kospi()
    print(f"[OK] KOSPI: {len(kospi_stocks)}개 수집")
    
    # KOSDAQ 크롤링
    print("\n[2/2] KOSDAQ 크롤링 중...")
    time.sleep(1)  # 요청 간격
    kosdaq_stocks = crawl_kosdaq()
    print(f"[OK] KOSDAQ: {len(kosdaq_stocks)}개 수집")
    
    # 기존 매핑 로드
    print("\n기존 영문명 매핑 로드 중...")
    existing_mapping = load_existing_mapping()
    print(f"[OK] {len(existing_mapping)}개 매핑 로드")
    
    # 데이터 병합
    all_stocks = kospi_stocks + kosdaq_stocks
    enriched_stocks = enrich_with_existing_data(all_stocks, existing_mapping)
    
    # 크롤링된 데이터 저장
    print("\n크롤링된 데이터 저장 중...")
    save_to_json(enriched_stocks, 'korean_stocks_crawled.json')
    
    # 기존 데이터와 병합
    print("\n기존 데이터와 병합 중...")
    merge_with_existing()
    
    print("\n" + "=" * 60)
    print("크롤링 완료!")
    print("=" * 60)

