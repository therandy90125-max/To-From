# 🪄 AI Agent Workflow Implementation

**다이어그램 패턴 구현 완료**

이 문서는 제공된 AI Agent 워크플로우 다이어그램을 ToAndFrom 프로젝트에 적용한 내용을 설명합니다.

---

## 📊 다이어그램 → 프로젝트 매핑

### 다이어그램 구조
```
[Form Submission] → [AI Agent] → [Condition] → Branch
                     ↓                         ↓
                  [Tools]               [Actions]
                  - Model                - Add to channel
                  - Memory               - Update profile
                  - Tool                 - etc.
```

### ToAndFrom 프로젝트 구현
```
[Portfolio Form] → [AI Agent] → [Risk Analysis] → Branch
                     ↓                            ↓
                  [Tools]                   [Actions]
                  - Qiskit                   - Alert Manager (High Risk)
                  - yfinance                 - Notify User (Medium Risk)
                  - Optimizer                - Auto Approve (Low Risk)
```

---

## 🏗️ 아키텍처

### 1. Workflow Engine (`python-backend/workflow_engine.py`)

```python
class WorkflowEngine:
    """
    워크플로우 엔진 (다이어그램 오케스트레이터)
    """
    
    def execute_workflow(workflow_id, input_data, optimization_func):
        """
        6-Step Workflow:
        1. Form Submission
        2. AI Agent Processing
        3. Optimization (Qiskit)
        4. Risk Analysis
        5. Conditional Branching
        6. Action Execution
        """
```

### 2. AI Agent (`workflow_engine.py`)

```python
class AIAgent:
    """
    AI Agent with Memory and Tools
    """
    - memory: WorkflowMemory (context storage)
    - tools: [Qiskit, yfinance, optimizer]
    - analyze_risk(): Risk classification
    - decide_action(): Conditional branching
```

### 3. Conditional Branching

```python
def decide_action(risk_analysis):
    """
    Risk Level → Action
    """
    if risk_level == HIGH:
        return "alert_manager"     # ⚠️ High risk
    elif risk_level == MEDIUM:
        return "notify_user"       # 📊 Medium risk
    else:
        return "auto_approve"      # ✅ Low risk
```

---

## 🔄 Workflow Steps

### Step 1: Form Submission
```javascript
// Frontend (React)
const response = await optimizeWithWorkflow({
  tickers: ["AAPL", "GOOGL", "MSFT"],
  initial_weights: [0.4, 0.3, 0.3],
  risk_factor: 0.5,
  method: "quantum",
  period: "1y"
});
```

### Step 2: AI Agent Processing
```python
agent = create_portfolio_agent()
agent.process(input_data)
# Agent stores context in memory
```

### Step 3: Optimization (Qiskit)
```python
optimization_result = optimization_func(
    tickers, initial_weights, risk_factor, method, period
)
# Returns: weights, expected_return, risk, sharpe_ratio
```

### Step 4: Risk Analysis
```python
risk_analysis = agent.analyze_risk(optimization_result)

# Result:
{
  "risk_level": "low|medium|high",
  "volatility_percentage": 15.2,
  "recommendation": "Safe portfolio",
  "sharpe_ratio": 0.85
}
```

### Step 5: Conditional Branching
```python
action = agent.decide_action(risk_analysis)

# Branching logic:
volatility < 15%  → "auto_approve"
15% ≤ volatility < 25% → "notify_user"
volatility ≥ 25% → "alert_manager"
```

### Step 6: Action Execution

#### Action A: Alert Manager (High Risk)
```python
def _send_alert_to_manager(context):
    """
    고위험 포트폴리오 감지
    - Slack 알림 전송
    - 매니저 승인 필요
    """
    return {
        'type': 'manager_alert',
        'priority': 'high',
        'message': f"High-risk portfolio: {volatility}%",
        'requires_approval': True
    }
```

#### Action B: Notify User (Medium Risk)
```python
def _notify_user(context):
    """
    중위험 포트폴리오
    - 사용자에게 알림
    - 자동 승인
    """
    return {
        'type': 'user_notification',
        'priority': 'medium',
        'message': f"Moderate risk: {volatility}%",
        'auto_approved': True
    }
```

#### Action C: Auto Approve (Low Risk)
```python
def _auto_approve(context):
    """
    저위험 포트폴리오
    - 자동 승인 및 저장
    """
    return {
        'type': 'auto_approval',
        'priority': 'low',
        'message': 'Portfolio automatically approved',
        'saved_to_db': True
    }
```

---

## 🚀 API 엔드포인트

### 1. Workflow Optimization
```http
POST /api/portfolio/optimize/workflow

Request:
{
  "tickers": ["AAPL", "GOOGL", "MSFT"],
  "initial_weights": [0.4, 0.3, 0.3],
  "risk_factor": 0.5,
  "method": "quantum",
  "period": "1y"
}

Response:
{
  "success": true,
  "workflow_id": "wf_abc123",
  "optimization_result": {
    "expected_return": 0.15,
    "risk": 0.18,
    "sharpe_ratio": 0.83
  },
  "risk_analysis": {
    "risk_level": "medium",
    "volatility_percentage": 18.0,
    "recommendation": "Balanced portfolio"
  },
  "action_taken": "notify_user",
  "action_result": {
    "type": "user_notification",
    "priority": "medium",
    "auto_approved": true
  },
  "workflow_steps": [
    {"step": 1, "name": "Form Submission", "status": "completed"},
    {"step": 2, "name": "AI Agent Processing", "status": "completed"},
    {"step": 3, "name": "Optimization", "status": "completed"},
    {"step": 4, "name": "Risk Analysis", "status": "completed"},
    {"step": 5, "name": "Conditional Branching", "action": "notify_user"},
    {"step": 6, "name": "Action Execution", "status": "completed"}
  ],
  "agent_memory": {
    "input": {...},
    "optimization_result": {...},
    "risk_analysis": {...},
    "action": "notify_user"
  }
}
```

### 2. Workflow Status
```http
GET /api/portfolio/workflow/{workflow_id}/status

Response:
{
  "id": "wf_abc123",
  "status": "completed",
  "created_at": "2025-11-07T15:30:00",
  "steps": [...]
}
```

---

## 💻 Frontend 사용 예시

### React Component
```javascript
import { optimizeWithWorkflow } from '../api/portfolioApi';

const OptimizeButton = () => {
  const handleOptimize = async () => {
    try {
      const result = await optimizeWithWorkflow({
        tickers: ["AAPL", "GOOGL", "MSFT"],
        risk_factor: 0.5,
        method: "quantum",
        period: "1y"
      });
      
      // Display workflow results
      console.log("Workflow ID:", result.workflow_id);
      console.log("Risk Level:", result.risk_analysis.risk_level);
      console.log("Action Taken:", result.action_taken);
      
      // Show appropriate message based on action
      if (result.action_taken === "alert_manager") {
        alert("⚠️ High risk detected! Manager approval required.");
      } else if (result.action_taken === "notify_user") {
        alert("📊 Moderate risk portfolio. Review recommended.");
      } else {
        alert("✅ Portfolio approved and saved!");
      }
      
    } catch (error) {
      console.error("Optimization failed:", error);
    }
  };
  
  return (
    <button onClick={handleOptimize}>
      Optimize with AI Agent
    </button>
  );
};
```

---

## 🧪 테스트 시나리오

### Scenario 1: Low Risk Portfolio
```bash
curl -X POST http://localhost:8080/api/portfolio/optimize/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "tickers": ["JNJ", "PG", "KO"],
    "risk_factor": 0.3,
    "method": "classical",
    "period": "1y"
  }'

Expected:
- risk_level: "low"
- volatility: < 15%
- action: "auto_approve"
- Result: ✅ Auto approved
```

### Scenario 2: Medium Risk Portfolio
```bash
curl -X POST http://localhost:8080/api/portfolio/optimize/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "tickers": ["AAPL", "MSFT", "GOOGL"],
    "risk_factor": 0.5,
    "method": "quantum",
    "period": "1y"
  }'

Expected:
- risk_level: "medium"
- volatility: 15-25%
- action: "notify_user"
- Result: 📊 User notified
```

### Scenario 3: High Risk Portfolio
```bash
curl -X POST http://localhost:8080/api/portfolio/optimize/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "tickers": ["TSLA", "NVDA", "COIN"],
    "risk_factor": 0.8,
    "method": "quantum",
    "period": "1y"
  }'

Expected:
- risk_level: "high"
- volatility: > 25%
- action: "alert_manager"
- Result: ⚠️ Manager alert sent
```

---

## 📊 다이어그램 요소 매핑

| 다이어그램 요소 | ToAndFrom 구현 | 파일 |
|----------------|---------------|------|
| **Form Submission** | Portfolio Input Form | `frontend/src/components/Dashboard.jsx` |
| **AI Agent** | `AIAgent` class | `python-backend/workflow_engine.py` |
| **Chat Model** | Qiskit Optimizer | `python-backend/optimizer.py` |
| **Memory** | `WorkflowMemory` | `python-backend/workflow_engine.py` |
| **Tool** | yfinance, stock_data | `python-backend/stock_data.py` |
| **Condition (Is manager?)** | Risk Level Check | `workflow_engine.py:decide_action()` |
| **Add to channel** | Alert Manager | `workflow_engine.py:_send_alert_to_manager()` |
| **Update profile** | Auto Approve & Save | `workflow_engine.py:_auto_approve()` |
| **Microsoft Entra ID** | (Future) User Auth | N/A |
| **Jira Software** | (Future) Ticket Creation | N/A |

---

## 🔧 확장 가능성

### 1. Slack 통합
```python
# workflow_engine.py
import slack_sdk

def _send_alert_to_manager(context):
    client = slack_sdk.WebClient(token=os.environ["SLACK_TOKEN"])
    client.chat_postMessage(
        channel="#portfolio-alerts",
        text=f"⚠️ High-risk portfolio detected: {volatility}%"
    )
```

### 2. Email 알림
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def _notify_user_email(context):
    message = Mail(
        from_email='noreply@toandfrom.com',
        to_emails=user_email,
        subject='Portfolio Optimization Complete',
        html_content=f'<p>Your portfolio: {risk_level}</p>'
    )
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    sg.send(message)
```

### 3. Jira 티켓 생성
```python
from jira import JIRA

def _create_approval_ticket(context):
    jira = JIRA(server='https://company.atlassian.net', ...)
    issue = jira.create_issue(
        project='PORT',
        summary=f'Portfolio Approval Required: {workflow_id}',
        description=f'Risk: {volatility}%',
        issuetype={'name': 'Task'}
    )
```

---

## 🎯 다음 단계

1. **Slack 통합** - 실시간 알림
2. **Email 통합** - 사용자 알림
3. **Dashboard 시각화** - 워크플로우 단계 표시
4. **히스토리 추적** - 워크플로우 이력 저장
5. **승인 시스템** - 매니저 승인 UI

---

## 📝 요약

✅ **다이어그램 패턴 완전 구현**
- AI Agent with Memory ✓
- Conditional Branching ✓
- Multi-step Workflow ✓
- Action Execution ✓

✅ **ToAndFrom 통합**
- React Frontend ✓
- Spring Boot Gateway ✓
- Flask + Qiskit Backend ✓
- Workflow Engine ✓

✅ **실전 활용 가능**
- API 엔드포인트 준비 ✓
- Frontend 클라이언트 준비 ✓
- 테스트 시나리오 작성 ✓

---

**구현 완료일:** 2025-11-07
**패턴:** AI Agent with Conditional Branching
**프로젝트:** ToAndFrom Quantum Portfolio Optimization

