"""
QuantaFolio Navigator Web Launcher
웹 브라우저에서 서비스를 시작/중지할 수 있는 간단한 웹 서버
"""
from flask import Flask, render_template, jsonify, request
import subprocess
import os
import sys
import threading
import time
import requests
from pathlib import Path

app = Flask(__name__)

# 프로젝트 루트 경로
PROJECT_ROOT = Path(__file__).parent.parent
START_SCRIPT = PROJECT_ROOT / "start-all.bat"
STOP_SCRIPT = PROJECT_ROOT / "stop-all.bat"

# 서비스 상태
services_status = {
    "quantum": {"port": 5000, "name": "Quantum Service", "running": False},
    "backend": {"port": 8080, "name": "Backend", "running": False},
    "frontend": {"port": 5173, "name": "Frontend", "running": False}
}

def check_service(port):
    """서비스가 실행 중인지 확인"""
    try:
        response = requests.get(f"http://localhost:{port}", timeout=2)
        return response.status_code < 500
    except:
        return False

def check_all_services():
    """모든 서비스 상태 확인"""
    services_status["quantum"]["running"] = check_service(5000)
    services_status["backend"]["running"] = check_service(8080)
    services_status["frontend"]["running"] = check_service(5173)
    return services_status

@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    """서비스 상태 조회"""
    check_all_services()
    all_running = all(s["running"] for s in services_status.values())
    return jsonify({
        "success": True,
        "services": services_status,
        "allRunning": all_running
    })

@app.route('/api/start', methods=['POST'])
def start_services():
    """서비스 시작"""
    try:
        # 이미 실행 중인지 확인
        check_all_services()
        if all(s["running"] for s in services_status.values()):
            return jsonify({
                "success": True,
                "message": "모든 서비스가 이미 실행 중입니다.",
                "services": services_status
            })
        
        # Windows에서 배치 파일 실행
        if sys.platform == "win32":
            # 새 창에서 실행 (창이 닫혀도 프로세스 유지)
            subprocess.Popen(
                [str(START_SCRIPT)],
                cwd=str(PROJECT_ROOT),
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            # Linux/Mac
            subprocess.Popen(
                ["bash", str(START_SCRIPT)],
                cwd=str(PROJECT_ROOT)
            )
        
        # 서비스 시작 대기 (최대 60초)
        for i in range(60):
            time.sleep(1)
            check_all_services()
            if all(s["running"] for s in services_status.values()):
                return jsonify({
                    "success": True,
                    "message": "모든 서비스가 시작되었습니다!",
                    "services": services_status,
                    "frontendUrl": "http://localhost:5173"
                })
        
        # 부분적으로 시작됨
        running = [name for name, s in services_status.items() if s["running"]]
        return jsonify({
            "success": True,
            "message": f"서비스 시작 중... (실행 중: {', '.join(running)})",
            "services": services_status,
            "warning": "일부 서비스가 아직 시작되지 않았습니다. 잠시 후 새로고침하세요."
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/stop', methods=['POST'])
def stop_services():
    """서비스 중지"""
    try:
        if sys.platform == "win32":
            subprocess.Popen(
                [str(STOP_SCRIPT)],
                cwd=str(PROJECT_ROOT),
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            subprocess.Popen(
                ["bash", str(STOP_SCRIPT)],
                cwd=str(PROJECT_ROOT)
            )
        
        time.sleep(3)
        check_all_services()
        
        return jsonify({
            "success": True,
            "message": "서비스 중지 요청이 전송되었습니다.",
            "services": services_status
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 QuantaFolio Navigator Web Launcher")
    print("=" * 50)
    print(f"📁 Project Root: {PROJECT_ROOT}")
    print(f"🌐 Web Launcher: http://localhost:8888")
    print("=" * 50)
    print("\n💡 브라우저에서 http://localhost:8888 을 열어주세요!")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8888, debug=False)

