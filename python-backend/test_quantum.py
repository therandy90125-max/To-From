"""
[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]
"""

from optimizer import PortfolioOptimizer
import json

print("=" * 60)
print("[EMOJI] [EMOJI] [EMOJI]")
print("=" * 60)

# [EMOJI] [EMOJI]
test_tickers = ['AAPL', 'GOOGL', 'MSFT']

print(f"\n[EMOJI] [EMOJI]: {test_tickers}")
print("\n1. [EMOJI] [EMOJI] [EMOJI]...")
print("-" * 60)

try:
    optimizer = PortfolioOptimizer(test_tickers, risk_factor=0.5)
    optimizer.fetch_data(period='1y')
    
    result_classical = optimizer.optimize(method='classical')
    
    print("\n[EMOJI] [EMOJI] [EMOJI]:")
    print(f"  [EMOJI] [EMOJI]: {result_classical['selected_tickers']}")
    print(f"  [EMOJI]: {[f'{w:.2%}' for w in result_classical['weights']]}")
    print(f"  [EMOJI] [EMOJI]: {result_classical['expected_return']:.4f}")
    print(f"  [EMOJI]: {result_classical['risk']:.4f}")
    print(f"  [EMOJI] [EMOJI]: {result_classical['sharpe_ratio']:.4f}")
    print(f"  [EMOJI]: {result_classical['method']}")
    
except Exception as e:
    print(f"[EMOJI] [EMOJI] [EMOJI]: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("2. [EMOJI] [EMOJI] [EMOJI] (QAOA)...")
print("-" * 60)

try:
    # [EMOJI] optimizer [EMOJI] [EMOJI]
    optimizer_quantum = PortfolioOptimizer(test_tickers, risk_factor=0.5)
    optimizer_quantum.fetch_data(period='1y')
    
    print("\n[EMOJI] [EMOJI] [EMOJI]...")
    result_quantum = optimizer_quantum.optimize(method='quantum', reps=1)
    
    print("\n[EMOJI] [EMOJI] [EMOJI]:")
    print(f"  [EMOJI] [EMOJI]: {result_quantum['selected_tickers']}")
    print(f"  [EMOJI]: {[f'{w:.2%}' for w in result_quantum['weights']]}")
    print(f"  [EMOJI] [EMOJI]: {result_quantum['expected_return']:.4f}")
    print(f"  [EMOJI]: {result_quantum['risk']:.4f}")
    print(f"  [EMOJI] [EMOJI]: {result_quantum['sharpe_ratio']:.4f}")
    print(f"  [EMOJI]: {result_quantum['method']}")
    print(f"  Reps: {result_quantum.get('reps', 'N/A')}")
    
    print("\n" + "=" * 60)
    print("[EMOJI] [EMOJI]:")
    print("=" * 60)
    
    if result_classical['selected_tickers'] == result_quantum['selected_tickers']:
        print("[WARNING] [EMOJI] [EMOJI] [EMOJI]!")
        print("   [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI],")
        print("   [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].")
    else:
        print("[SUCCESS] [EMOJI] [EMOJI] [EMOJI]!")
        print("   [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].")
    
    print(f"\n[EMOJI]: {result_classical['selected_tickers']}")
    print(f"[EMOJI]:   {result_quantum['selected_tickers']}")
    
    print(f"\n[EMOJI] [EMOJI]: {result_classical['expected_return']:.4f}")
    print(f"[EMOJI] [EMOJI]:   {result_quantum['expected_return']:.4f}")
    
    if abs(result_classical['expected_return'] - result_quantum['expected_return']) < 0.0001:
        print("\n[WARNING] [EMOJI] [EMOJI] [EMOJI]!")
    else:
        print("\n[SUCCESS] [EMOJI] [EMOJI]!")
    
except Exception as e:
    print(f"\n[ERROR] [EMOJI] [EMOJI] [EMOJI]: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("[EMOJI] [EMOJI]")
print("=" * 60)

