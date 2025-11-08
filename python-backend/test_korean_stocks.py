import time
import sys
from optimizer import PortfolioOptimizer


def print_progress(message):
    print(f"[{time.strftime('%H:%M:%S')}] {message}")
    sys.stdout.flush()


print_progress("Testing with Korean stocks (user's actual use case)...")

# User's actual tickers from the image
opt = PortfolioOptimizer(['005930.KS', '000270.KS', '005380.KS'], risk_factor=0.5)

print_progress("Fetching data...")
opt.fetch_data('1y')
opt.calculate_returns()

print_progress("Running classical optimization...")
classical = opt.classical_portfolio_optimization()
print_progress(f"Classical: {classical['selected_tickers']} = {classical['weights']}")

print_progress("Running quantum optimization (reps=3, precision=4)...")
start = time.time()

try:
    quantum = opt.quantum_portfolio_optimization_qaoa(reps=3, precision=4)
    elapsed = time.time() - start
    print_progress(f"Quantum done in {elapsed:.1f}s")
    print_progress(f"Quantum: {quantum['selected_tickers']} = {quantum['weights']}")
    
    print_progress("\n=== DETAILED COMPARISON ===")
    print_progress(f"Classical tickers: {classical['selected_tickers']}")
    print_progress(f"Quantum tickers:   {quantum['selected_tickers']}")
    print_progress(f"Classical weights: {classical['weights']}")
    print_progress(f"Quantum weights:   {quantum['weights']}")
    print_progress(f"Classical return: {classical['expected_return']:.4f} ({classical['expected_return']*100:.2f}%)")
    print_progress(f"Quantum return:   {quantum['expected_return']:.4f} ({quantum['expected_return']*100:.2f}%)")
    print_progress(f"Classical risk:   {classical['risk']:.4f} ({classical['risk']*100:.2f}%)")
    print_progress(f"Quantum risk:     {quantum['risk']:.4f} ({quantum['risk']*100:.2f}%)")
    print_progress(f"Classical Sharpe: {classical['sharpe_ratio']:.4f}")
    print_progress(f"Quantum Sharpe:   {quantum['sharpe_ratio']:.4f}")
    print_progress(f"Quantum verified: {quantum.get('quantum_verified', False)}")
    print_progress(f"Quantum energy:   {quantum.get('quantum_energy', 0):.6f}")
    
    # Check if results are different
    tickers_different = classical['selected_tickers'] != quantum['selected_tickers']
    weights_different = abs(sum([abs(c-q) for c,q in zip(classical['weights'], quantum['weights']) if len(classical['weights']) == len(quantum['weights'])])) > 0.01
    
    if tickers_different or weights_different:
        print_progress("\n[SUCCESS] Results are DIFFERENT!")
        if tickers_different:
            print_progress("  - Different tickers selected")
        if weights_different:
            print_progress("  - Different weights assigned")
    else:
        print_progress("\n[INFO] Results are similar (both found optimal solution)")
        print_progress("  - This is normal when one solution is clearly optimal")
        
except Exception as e:
    print_progress(f"[ERROR] Quantum failed: {str(e)}")
    import traceback
    traceback.print_exc()

