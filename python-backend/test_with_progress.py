import time
import sys
from optimizer import PortfolioOptimizer


def print_progress(message):
    print(f"[{time.strftime('%H:%M:%S')}] {message}")
    sys.stdout.flush()


print_progress("Starting test...")

opt = PortfolioOptimizer(['AAPL', 'GOOGL', 'MSFT'], risk_factor=0.5)

print_progress("Fetching data...")
opt.fetch_data('3mo')
opt.calculate_returns()

print_progress("Running classical optimization...")
classical = opt.classical_portfolio_optimization()
print_progress(f"Classical done: {classical['weights']}")

print_progress("Running quantum optimization (this may take 30-60s)...")
start = time.time()

try:
    quantum = opt.quantum_portfolio_optimization_qaoa(reps=2, precision=3)
    elapsed = time.time() - start
    print_progress(f"Quantum done in {elapsed:.1f}s: {quantum['weights']}")
    
    print_progress("\n=== COMPARISON ===")
    print_progress(f"Classical weights: {classical['weights']}")
    print_progress(f"Quantum weights:   {quantum['weights']}")
    print_progress(f"Classical return: {classical['expected_return']:.4f}")
    print_progress(f"Quantum return:   {quantum['expected_return']:.4f}")
    print_progress(f"Quantum verified: {quantum.get('quantum_verified', False)}")
    
    if classical['weights'] == quantum['weights']:
        print_progress("[WARNING] Results are IDENTICAL!")
    else:
        print_progress("[SUCCESS] Results are DIFFERENT!")
        
except Exception as e:
    print_progress(f"Quantum failed: {str(e)}")
    import traceback
    traceback.print_exc()

