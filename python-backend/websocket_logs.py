"""
WebSocket module for real-time agent logs
"""
from datetime import datetime
import json

class WorkflowLogger:
    """
    Logger that can broadcast messages to WebSocket clients
    """
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.logs = []
        
    def log(self, level, message, step=None, workflow_id=None):
        """
        Log a message and broadcast to connected clients
        
        Args:
            level: 'info', 'warning', 'error', 'success'
            message: Log message
            step: Current workflow step
            workflow_id: Workflow identifier
        """
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message,
            'step': step,
            'workflow_id': workflow_id
        }
        
        self.logs.append(log_entry)
        
        # Broadcast to WebSocket clients if available
        if self.socketio:
            self.socketio.emit('workflow_log', log_entry, namespace='/logs')
            
        # Also print to console for debugging
        print(f"[{log_entry['timestamp']}] [{level.upper()}] {message}")
        
        return log_entry
    
    def info(self, message, step=None, workflow_id=None):
        return self.log('info', message, step, workflow_id)
    
    def warning(self, message, step=None, workflow_id=None):
        return self.log('warning', message, step, workflow_id)
    
    def error(self, message, step=None, workflow_id=None):
        return self.log('error', message, step, workflow_id)
    
    def success(self, message, step=None, workflow_id=None):
        return self.log('success', message, step, workflow_id)
    
    def get_logs(self, workflow_id=None):
        """Get all logs, optionally filtered by workflow_id"""
        if workflow_id:
            return [log for log in self.logs if log.get('workflow_id') == workflow_id]
        return self.logs
    
    def clear_logs(self, workflow_id=None):
        """Clear logs, optionally only for specific workflow"""
        if workflow_id:
            self.logs = [log for log in self.logs if log.get('workflow_id') != workflow_id]
        else:
            self.logs = []

# Global logger instance
workflow_logger = WorkflowLogger()

def init_websocket(app, socketio):
    """
    Initialize WebSocket endpoints for real-time logs
    
    Args:
        app: Flask app instance
        socketio: Flask-SocketIO instance
    """
    workflow_logger.socketio = socketio
    
    @socketio.on('connect', namespace='/logs')
    def handle_connect():
        print('Client connected to logs WebSocket')
        # Send existing logs to new client
        for log in workflow_logger.logs[-50:]:  # Send last 50 logs
            socketio.emit('workflow_log', log, namespace='/logs')
    
    @socketio.on('disconnect', namespace='/logs')
    def handle_disconnect():
        print('Client disconnected from logs WebSocket')
    
    @socketio.on('subscribe_workflow', namespace='/logs')
    def handle_subscribe(data):
        workflow_id = data.get('workflow_id')
        print(f'Client subscribed to workflow: {workflow_id}')
        # Send logs for specific workflow
        logs = workflow_logger.get_logs(workflow_id)
        for log in logs:
            socketio.emit('workflow_log', log, namespace='/logs')
    
    # REST endpoint to get logs (fallback for non-WebSocket clients)
    @app.route('/api/logs/<workflow_id>', methods=['GET'])
    def get_workflow_logs(workflow_id):
        logs = workflow_logger.get_logs(workflow_id)
        return {
            'success': True,
            'workflow_id': workflow_id,
            'logs': logs,
            'count': len(logs)
        }
    
    @app.route('/api/logs', methods=['GET'])
    def get_all_logs():
        return {
            'success': True,
            'logs': workflow_logger.logs,
            'count': len(workflow_logger.logs)
        }
    
    print("[OK] WebSocket logging initialized")
    return workflow_logger

