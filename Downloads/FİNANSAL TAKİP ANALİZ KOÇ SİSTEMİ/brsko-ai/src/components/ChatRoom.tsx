"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatRoom() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the local socket server
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("system_update", (data) => {
      if (data.type === "user_count") {
        setOnlineUsers(data.count);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("send_message", {
        text: message,
        sender: "Trader_" + Math.floor(Math.random() * 1000),
      });
      setMessage("");
    }
  };

  return (
    <div className="glass-card flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-[rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <Activity className="text-[var(--gold)]" size={20} />
          <h3 className="font-bold text-lg">Piyasa Meydanı</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--gold)] bg-[var(--gold-glow)] px-3 py-1 rounded-full border border-[var(--gold)]">
          <Users size={16} />
          <span>{onlineUsers} Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex flex-col \${msg.isSystem ? 'items-center' : 'items-start'}`}
          >
            {msg.isSystem ? (
              <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                {msg.text}
              </span>
            ) : (
              <div className="bg-[rgba(255,255,255,0.03)] border border-[var(--glass-border)] p-3 rounded-2xl rounded-tl-sm max-w-[85%] hover:border-[var(--gold-glow)] transition-colors">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-xs font-bold text-[var(--gold)]">{msg.sender}</span>
                  <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-gray-200">{msg.text}</p>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Piyasa hakkında bir şeyler yaz..."
            className="flex-1 bg-[rgba(0,0,0,0.3)] border border-[var(--glass-border)] rounded-full px-4 py-2 text-sm outline-none focus:border-[var(--gold)] transition-colors text-white placeholder-gray-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-[var(--gold)] text-black p-2 px-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
