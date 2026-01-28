"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";
import { AdminPageHeader } from "@/components/ui/admin-page-header";
import { ShineBorder } from "@/components/ui/shine-border";
import { Mail, Trash2, MailOpen, Reply, Clock, User, AlertCircle, Loader2, Check } from "lucide-react";
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

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchMessages = async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch<Message[]>("/api/messages");
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(
        err instanceof Error ? err.message : t("common.error")
      );
    } finally {
      setLoading(false);
    }
  };

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
      setActionError(
        err instanceof Error ? err.message : t("common.error")
      );
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
      setActionError(
        err instanceof Error ? err.message : t("common.error")
      );
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
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
       <AdminPageHeader 
        title={t("messages.title")} 
        description={
            loading
            ? t("common.loading")
            : unreadCount > 0
              ? `${unreadCount} ${t("messages.unreadCount")}`
              : t("messages.allRead")
        }
        // No create action for messages
      />

      {error && (
         <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchMessages} className="text-red-400 hover:text-red-300 hover:underline">
            {t("messages.retry")}
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-300 hover:underline">
            {t("messages.dismiss")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-12 gap-6 h-full">
           <div className="col-span-4 rounded-xl border border-white/[0.08] bg-black/20 p-4 animate-pulse">
              <div className="space-y-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-lg w-full"></div>
                 ))}
              </div>
           </div>
           <div className="col-span-8 rounded-xl border border-white/[0.08] bg-black/20 p-6 animate-pulse">
               <div className="h-8 bg-white/5 rounded w-1/2 mb-4"></div>
               <div className="h-4 bg-white/5 rounded w-1/4 mb-8"></div>
               <div className="h-40 bg-white/5 rounded w-full"></div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 h-full min-h-0">
          {/* Messages List */}
          <div className="col-span-4 flex flex-col h-full min-h-0 bg-black/20 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-xl">
             <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                   <Mail className="w-4 h-4 text-cyan-400" />
                   Inbox 
                   <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-400 ml-auto">
                     {messages.length}
                   </span>
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-slate-500 p-6 text-center">
                    <MailOpen className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">{t("messages.noMessages")}</p>
                 </div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 border border-transparent hover:bg-white/[0.03]",
                        selectedMessage?.id === message.id 
                            ? "bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]" 
                            : "hover:border-white/[0.05]",
                        !message.read && "bg-blue-500/[0.03]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className={cn(
                          "text-sm truncate pr-2 text-slate-200",
                          !message.read ? "font-bold text-blue-200" : "font-medium"
                      )}>
                        {message.name}
                      </p>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                    </div>
                    <p className={cn(
                        "text-xs truncate mb-1.5",
                        !message.read ? "text-slate-300" : "text-slate-500"
                    )}>
                      {message.subject}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock className="w-3 h-3" />
                       {formatRelativeTime(message.createdAt)}
                    </div>
                  </button>
                ))
              )}
             </div>
          </div>

          {/* Message Detail */}
          <div className="col-span-8 flex flex-col h-full min-h-0 bg-black/20 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-xl relative">
            {selectedMessage ? (
              <div className="flex flex-col h-full"> 
                 {/* Header */}
                 <div className="p-6 border-b border-white/[0.08] bg-white/[0.02]">
                    <div className="flex justify-between items-start gap-4">
                       <div>
                          <h2 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                            {selectedMessage.subject}
                          </h2>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                             <div className="flex items-center gap-2 bg-white/[0.05] px-2 py-1 rounded-md">
                                <User className="w-3.5 h-3.5" />
                                <span className="font-medium text-slate-300">{selectedMessage.name}</span>
                             </div>
                             <span className="text-slate-600">•</span>
                             <a href={`mailto:${selectedMessage.email}`} className="text-cyan-400 hover:text-cyan-300 hover:underline">
                                {selectedMessage.email}
                             </a>
                          </div>
                          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                             <Clock className="w-3 h-3" />
                             {new Date(selectedMessage.createdAt).toLocaleString()}
                             <span className="text-slate-700">|</span>
                             <span>{formatRelativeTime(selectedMessage.createdAt)}</span>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.read)}
                            disabled={actionLoading === selectedMessage.id}
                            className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title={selectedMessage.read ? t("messages.markAsUnread") : t("messages.markAsRead")}
                          >
                             {actionLoading === selectedMessage.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                             ) : selectedMessage.read ? (
                                <Mail className="w-5 h-5" />
                             ) : (
                                <MailOpen className="w-5 h-5" />
                             )}
                          </button>
                          <button
                            onClick={() => handleDelete(selectedMessage.id)}
                            disabled={actionLoading === selectedMessage.id}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title={t("messages.delete")}
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Content */}
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                       {selectedMessage.message}
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-6 border-t border-white/[0.08] bg-white/[0.02]">
                    <a
                     href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                     className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
                    >
                       <Reply className="w-4 h-4" />
                       {t("messages.reply")}
                    </a>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6 border border-white/[0.05]">
                   <Mail className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-xl font-display font-medium text-slate-400">{t("messages.selectMessage")}</p>
                <p className="text-sm mt-2 text-slate-600">{t("messages.chooseMessage")}</p>
              </div>
            )}
            
             {/* Decorative background elements inside the detail view */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}
