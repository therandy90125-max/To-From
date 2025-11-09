#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""크롤러 디버깅 스크립트"""
import requests
from bs4 import BeautifulSoup

url = "https://finance.naver.com/sise/sise_market_sum.naver?sosok=0&page=1"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

r = requests.get(url, headers=headers, timeout=10)
r.encoding = 'euc-kr'
soup = BeautifulSoup(r.content, 'html.parser')

table = soup.find('table', class_='item_list')
if table:
    rows = table.find_all('tr')
    print(f'Total rows: {len(rows)}')
    
    for i, row in enumerate(rows[:10]):
        cols = row.find_all('td')
        print(f'\nRow {i}: {len(cols)} columns')
        if len(cols) >= 2:
            # 첫 번째 열
            first_col = cols[0]
            ticker_link = first_col.find('a')
            if ticker_link:
                href = ticker_link.get('href', '')
                print(f'  Link: {href}')
                if 'code=' in href:
                    ticker = href.split('code=')[1].split('&')[0]
                    print(f'  Ticker: {ticker}')
            print(f'  First col text: {first_col.text.strip()[:50]}')
            
            # 두 번째 열
            if len(cols) > 1:
                print(f'  Second col text: {cols[1].text.strip()[:50]}')
else:
    print("Table not found!")
    tables = soup.find_all('table')
    print(f"Found {len(tables)} tables")
    for i, t in enumerate(tables[:3]):
        print(f"Table {i}: class={t.get('class')}")

