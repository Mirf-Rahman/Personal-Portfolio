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
        err instanceof Error ? err.message : "Failed to load messages. Please refresh the page."
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
        err instanceof Error ? err.message : "Failed to update message"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
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
        err instanceof Error ? err.message : "Failed to delete message"
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages Inbox</h1>
        <p className="text-muted-foreground mt-1">
          {loading
            ? "Loading messages..."
            : unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All messages read"}
        </p>
      </div>

      {error && (
        <div
          className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchMessages}
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div
          className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="text-red-600 dark:text-red-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-6 min-h-[500px]">
          {/* Loading skeleton for messages list */}
          <div className="col-span-1 rounded-lg border bg-card overflow-hidden">
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          </div>
          {/* Loading skeleton for message detail */}
          <div className="col-span-2 rounded-lg border bg-card p-6">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="space-y-2 pt-4 border-t">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 min-h-[500px]">
          {/* Messages List */}
          <div className="col-span-1 rounded-lg border bg-card overflow-hidden">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-8 text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-muted-foreground font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Messages from the contact form will appear here
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    disabled={actionLoading === message.id}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 ${
                      selectedMessage?.id === message.id ? "bg-muted" : ""
                    } ${!message.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p
                        className={`font-semibold text-sm truncate ${
                          !message.read ? "font-bold" : ""
                        }`}
                      >
                        {message.name}
                      </p>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {message.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(message.createdAt)}
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
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="font-medium">{selectedMessage.name}</span>
                      <span>•</span>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="hover:underline text-primary"
                      >
                        {selectedMessage.email}
                      </a>
                      <span>•</span>
                      <span>{formatRelativeTime(selectedMessage.createdAt)}</span>
                      <span>•</span>
                      <span>
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleMarkAsRead(selectedMessage.id, !selectedMessage.read)
                      }
                      disabled={actionLoading === selectedMessage.id}
                      className="text-sm text-muted-foreground hover:underline disabled:opacity-50"
                    >
                      {actionLoading === selectedMessage.id ? (
                        <span className="flex items-center gap-1">
                          <svg
                            className="animate-spin h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        `Mark as ${selectedMessage.read ? "unread" : "read"}`
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      disabled={actionLoading === selectedMessage.id}
                      className="text-sm text-destructive hover:underline disabled:opacity-50"
                    >
                      {actionLoading === selectedMessage.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {selectedMessage.message}
                  </p>
                </div>
                <div className="border-t pt-6">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Reply
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Select a message to view</p>
                <p className="text-sm mt-1">Choose a message from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
