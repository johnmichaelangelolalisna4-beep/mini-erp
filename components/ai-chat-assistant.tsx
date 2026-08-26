"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Boxes,
  TrendingUp,
  FileText,
  Users,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { ChatMarkdown } from "@/components/ui/chat-markdown";
import { useAIChat } from "@/lib/context/ai-chat-context";
import { ActionConfirmationCard, StockAdjustmentAction } from "@/components/ui/action-confirmation-card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  action?: StockAdjustmentAction;
}

interface AIChatAssistantProps {
  role?: "Admin" | "Sales" | "Inventory";
}

const ADMIN_QUICK_CHIPS = [
  {
    label: "Revenue vs Expenses",
    icon: TrendingUp,
    prompt: "Provide an executive summary of our gross revenue, estimated expenses, net profit, and unpaid invoices.",
  },
  {
    label: "Recent Audit Logs",
    icon: FileText,
    prompt: "Show me the 6 most recent audit and activity log events across the system.",
  },
  {
    label: "Low Stock Items",
    icon: Boxes,
    prompt: "Which furniture items are currently low in stock or below their safety reorder threshold?",
  },
  {
    label: "Active Staff Directory",
    icon: Users,
    prompt: "List all active employee profiles and their assigned system roles.",
  },
];

const SALES_QUICK_CHIPS = [
  {
    label: "My Sales Quota & Commission",
    icon: TrendingUp,
    prompt: "What is our current completed sales volume toward the monthly quota and what is the 10% earned commission?",
  },
  {
    label: "In-Stock Furniture & Pricing",
    icon: Boxes,
    prompt: "List the currently in-stock furniture pieces with retail and wholesale pricing.",
  },
  {
    label: "Recent Customer Orders",
    icon: ShoppingCart,
    prompt: "Show the 5 most recent customer orders and their fulfillment status.",
  },
  {
    label: "Pending Client Quotes",
    icon: Clock,
    prompt: "Which customer orders are currently pending fulfillment or awaiting payment?",
  },
];

export function AIChatAssistant({ role = "Admin" }: AIChatAssistantProps) {
  const { isOpen, setIsOpen } = useAIChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialGreeting =
    role === "Sales"
      ? "Welcome to the **Sales Commerce AI**.\n\nI can assist you with **client order tracking**, **furniture catalog pricing (Retail & Wholesale)**, **stock availability**, and your **monthly quota & commission progress**.\n\nHow can I help you close a sale today?"
      : "Welcome to the **AI Chatbot** for **Mini-ERP**.\n\nI can assist you with **financial ledgers**, **system audit logs**, **inventory levels**, and **employee records**.\n\nHow may I assist you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickChips = role === "Sales" ? SALES_QUICK_CHIPS : ADMIN_QUICK_CHIPS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 96)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      // Prepare payload with formatted history
      const apiPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          messages: apiPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.content || "No response received from AI Chatbot.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action: data.action || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `**Error:** ${err.message || "Failed to communicate with AI Chatbot. Please verify API configuration."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dimmed backdrop when maximized */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs pointer-events-auto transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Chat Container */}
      <div
        className={`fixed z-50 pointer-events-auto transition-all duration-300 flex flex-col ${
          isExpanded
            ? "inset-3 sm:inset-8"
            : "bottom-6 right-6 w-[380px] sm:w-[480px] h-[640px] max-h-[85vh]"
        }`}
      >
        <div className="flex flex-col h-full w-full bg-[#fff7e8] border border-[#e8decf] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out">

          {/* Header */}
          <div className="bg-[#4f351c] text-[#fff7e8] px-4 py-3.5 flex items-center justify-between border-b border-[#e8decf]/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#713105] border border-[#cfab71]/50 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-[#cfab71]" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-[#fff7e8] tracking-wide">
                  AI Chatbot
                </h3>
                <span className="bg-[#cfab71]/20 text-[#cfab71] border border-[#cfab71]/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full">
                  {role === "Sales" ? "Sales Assistant" : "Admin"}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-[#fff7e8]/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Restore Size" : "Maximize Window"}
                className="p-1.5 rounded-lg text-[#fff7e8]/70 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-lg text-[#fff7e8]/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="bg-[#fcf3e3] border-b border-[#e8decf] px-3.5 py-2.5 overflow-x-auto shrink-0 flex items-center gap-2 scrollbar-none">
            <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider shrink-0 mr-1">
              Quick:
            </span>
            {quickChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#fff7e8] text-[#713105] hover:text-[#341100] border border-[#e8decf] rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 text-[#cfab71]" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fff7e8]/40">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 transition-all shadow-2xs relative group ${
                      isUser
                        ? "bg-[#713105] text-[#fff7e8] rounded-br-xs"
                        : "bg-white text-[#341100] border border-[#e8decf] rounded-bl-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#e8decf]/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold tracking-wider text-[#713105] uppercase">
                            {role === "Sales" ? "Sales Advisor" : "AI Intelligence"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#7f5e35] hover:text-[#341100]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className={isUser ? "text-xs font-normal leading-relaxed" : ""}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <ChatMarkdown content={msg.content} />
                      )}
                    </div>

                    {/* Interactive Action Confirmation Card (If stock adjustment proposed) */}
                    {!isUser && msg.action && (
                      <div className="mt-3">
                        <ActionConfirmationCard
                          action={msg.action}
                          onSuccess={() => {
                            // Append success confirmation in chat history
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: `ack-${Date.now()}`,
                                role: "assistant",
                                content: `Stock adjustment for **${msg.action?.product_name || "item"}** (${msg.action?.quantity} units) has been recorded in the database.`,
                                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                              },
                            ]);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#7f5e35]/80 px-2 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex items-start space-y-1">
                <div className="bg-white border border-[#e8decf] rounded-2xl rounded-bl-xs p-3 shadow-2xs flex items-center gap-2 text-xs text-[#713105] font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#713105]" />
                  <span>{role === "Sales" ? "Sales AI is checking showroom data..." : "AI Chatbot is analyzing database..."}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-[#e8decf] shrink-0">
            <div className="flex items-center gap-2 bg-[#fff7e8] border border-[#e8decf] rounded-xl p-1.5 focus-within:border-[#713105] focus-within:ring-2 focus-within:ring-[#713105]/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  role === "Sales"
                    ? "Ask about stock, retail/wholesale prices, customer orders, or quota..."
                    : "Ask about financials, audit logs, stock counts, staff records..."
                }
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none text-xs text-[#341100] placeholder:text-[#7f5e35]/60 focus:outline-hidden px-2 py-1.5 max-h-24 min-h-[36px] overflow-y-auto scrollbar-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#713105] shrink-0 shadow-xs cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#7f5e35] px-1 mt-1.5">
              <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
              <span className="font-mono">{role === "Sales" ? "Sales Scoped" : "Admin Full Access"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatAssistant;
