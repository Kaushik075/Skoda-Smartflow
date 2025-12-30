import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    // In a real app, this would connect to your WebSocket server
    // For demo purposes, we'll simulate WebSocket functionality
    console.log('WebSocket connected (simulated)');
    
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      this.emit('alert_update', {
        type: 'new_alert',
        timestamp: new Date().toISOString()
      });
    }, 30000);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    // Simulate emitting to all listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Simulate broadcasting new alerts
  broadcastNewAlert(alert: any) {
    this.emit('new_alert', alert);
  }

  // Simulate broadcasting claim updates
  broadcastClaimUpdate(scheduleId: string, claimedBy: string) {
    this.emit('claim_update', { scheduleId, claimedBy });
  }
}

export const wsService = new WebSocketService();