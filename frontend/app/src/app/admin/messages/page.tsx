"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";
import { AdminPageHeader } from "@/components/ui/admin-page-header";
import { ShineBorder } from "@/components/ui/shine-border";
import { MessagesSquare, Mail, Calendar, Trash2, Reply, CheckCircle, Circle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesManagementPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const { data: session, isPending } = authClient.useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch<Message[]>("/api/messages");
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [session, t]);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: string, read: boolean) => {
    setActionLoading(id);
    setActionError("");
    try {
      await authenticatedFetch(`/api/messages/${id}`, {
        method: "PUT",
        body: JSON.stringify({ read }),
      });
      await fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read });
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("messages.confirmDelete"))) return;
    setActionLoading(id);
    setActionError("");
    try {
      await authenticatedFetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setActionError("");
    if (!message.read) {
      handleMarkAsRead(message.id, true);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
       <AdminPageHeader 
        title={t("messages.title")} 
        description={loading
            ? t("common.loading")
            : unreadCount > 0
              ? `${unreadCount} ${t("messages.unreadCount")}`
              : t("messages.allRead")}
      />

      {error && (
         <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchMessages}
              className="text-red-400 hover:text-red-300 underline font-medium"
            >
              {t("messages.retry")}
            </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between">
           <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="text-red-400 hover:text-red-300 underline font-medium"
            >
             {t("messages.dismiss")}
            </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
           {/* Loading skeleton */}
           <div className="col-span-1 border border-white/[0.05] rounded-xl bg-white/[0.02] p-4 animate-pulse">
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-lg"></div>
                    ))}
                </div>
           </div>
           <div className="col-span-2 border border-white/[0.05] rounded-xl bg-white/[0.02] p-8 animate-pulse">
                <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2 mb-8"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded"></div>
                    <div className="h-4 bg-white/5 rounded"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6"></div>
                </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Messages List */}
          <div className="col-span-1 border border-white/[0.05] rounded-2xl bg-white/[0.02] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.02] flex justify-between items-center">
                 <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Inbox</h3>
                 <button onClick={fetchMessages} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-slate-300 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                 </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-40">
                  <MessagesSquare className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">
                    {t("messages.noMessages")}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                      "w-full p-4 text-left rounded-xl transition-all border border-transparent group relative overflow-hidden",
                      selectedMessage?.id === message.id 
                        ? "bg-white/[0.08] border-white/[0.05] shadow-lg" 
                        : "hover:bg-white/[0.04] hover:border-white/[0.02]",
                      !message.read && selectedMessage?.id !== message.id && "bg-blue-500/10 border-blue-500/20"
                    )}
                  >
                     {!message.read && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                     )}
                    <div className="flex items-start justify-between mb-1 pl-2">
                      <p
                        className={cn(
                            "text-sm truncate pr-2",
                            !message.read ? "font-bold text-white" : "font-medium text-slate-300",
                             selectedMessage?.id === message.id && "text-white"
                        )}
                      >
                        {message.name}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap pt-0.5">
                        {formatRelativeTime(message.createdAt)}
                      </span>
                    </div>
                    <p className={cn(
                        "text-xs truncate pl-2",
                        !message.read ? "text-slate-300" : "text-slate-500",
                        selectedMessage?.id === message.id && "text-slate-400"
                    )}>
                      {message.subject}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="col-span-2 h-full">
            {selectedMessage ? (
              <ShineBorder 
                className="relative h-full w-full rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm p-0 flex flex-col overflow-hidden"
                shineColor={["#38bdf8", "#818cf8", "#c084fc"]}
              >
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                        {selectedMessage.subject}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                        <span className="font-medium text-slate-300">{selectedMessage.name}</span>
                                        <span className="text-slate-600">&lt;{selectedMessage.email}&gt;</span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4 pl-1">
                                <span className="flex items-center gap-1 bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.05]">
                                    <Calendar className="w-3 h-3" /> {new Date(selectedMessage.createdAt).toLocaleString()}
                                </span>
                             </div>
                        </div>
                        
                        <div className="flex gap-2">
                             <button
                                onClick={() =>
                                    handleMarkAsRead(
                                    selectedMessage.id,
                                    !selectedMessage.read,
                                    )
                                }
                                disabled={actionLoading === selectedMessage.id}
                                className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all disabled:opacity-50"
                                title={selectedMessage.read ? t("messages.markAsUnread") : t("messages.markAsRead")}
                                >
                                {actionLoading === selectedMessage.id ? (
                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400" />
                                ) : selectedMessage.read ? (
                                    <Circle className="w-4 h-4" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 text-blue-400" />
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(selectedMessage.id)}
                                disabled={actionLoading === selectedMessage.id}
                                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50"
                                title={t("messages.delete")}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none border-t border-white/[0.08] pt-8">
                         <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-base">
                            {selectedMessage.message}
                        </p>
                    </div>
                </div>
                
                <div className="p-6 border-t border-white/[0.05] bg-white/[0.02]">
                    <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all"
                    >
                        <Reply className="w-4 h-4" />
                        {t("messages.reply")}
                    </a>
                </div>
              </ShineBorder>
            ) : (
              <div className="h-full rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col items-center justify-center text-slate-500 p-8 text-center dashed-border">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 animate-pulse-slow">
                     <Mail className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">
                  {t("messages.selectMessage")}
                </h3>
                <p className="max-w-xs mx-auto">
                    {t("messages.chooseMessage")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
