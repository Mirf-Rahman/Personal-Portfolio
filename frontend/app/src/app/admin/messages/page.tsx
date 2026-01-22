"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { authenticatedFetch } from "@/lib/api";

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
  const { data: session, isPending } = authClient.useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchMessages = async () => {
    if (!session) return;
    try {
      const data = await authenticatedFetch<Message[]>("/api/messages");
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, read: boolean) => {
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
      alert(err instanceof Error ? err.message : "Failed to update message");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await authenticatedFetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete message");
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      handleMarkAsRead(message.id, true);
    }
  };

  if (isPending || !session) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages Inbox</h1>
        <p className="text-muted-foreground mt-1">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6 min-h-[500px]">
          {/* Messages List */}
          <div className="col-span-1 rounded-lg border bg-card overflow-hidden">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No messages yet</div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-muted" : ""
                    } ${!message.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className={`font-semibold text-sm truncate ${!message.read ? "font-bold" : ""}`}>
                        {message.name}
                      </p>
                      {!message.read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="col-span-2 rounded-lg border bg-card p-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">{selectedMessage.name}</span>
                      <span>•</span>
                      <a href={`mailto:${selectedMessage.email}`} className="hover:underline text-primary">
                        {selectedMessage.email}
                      </a>
                      <span>•</span>
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.read)}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Mark as {selectedMessage.read ? "unread" : "read"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <p className="whitespace-pre-wrap text-muted-foreground">{selectedMessage.message}</p>
                </div>
                <div className="border-t pt-6">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Reply
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a message to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
