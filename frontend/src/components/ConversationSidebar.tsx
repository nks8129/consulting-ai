import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  opportunityId: string;
  opportunityName: string;
  messageCount: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.opportunityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groupedConversations = {
    today: filteredConversations.filter(c => isSameDay(new Date(c.timestamp), today)),
    yesterday: filteredConversations.filter(c => isSameDay(new Date(c.timestamp), yesterday)),
    lastWeek: filteredConversations.filter(c => {
      const date = new Date(c.timestamp);
      return date > lastWeek && !isSameDay(date, today) && !isSameDay(date, yesterday);
    }),
    older: filteredConversations.filter(c => new Date(c.timestamp) <= lastWeek),
  };

  if (isCollapsed) {
    return (
      <div className="flex w-16 flex-col items-center border-r border-slate-200 bg-slate-50 py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Show conversations"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNewConversation}
          className="mt-4 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          title="New conversation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Conversations
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewConversation}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
              title="New conversation"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onToggleCollapse}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Hide sidebar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 text-4xl">💬</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No conversations yet
            </p>
          </div>
        ) : (
          <>
            {groupedConversations.today.length > 0 && (
              <ConversationGroup
                title="Today"
                conversations={groupedConversations.today}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {groupedConversations.yesterday.length > 0 && (
              <ConversationGroup
                title="Yesterday"
                conversations={groupedConversations.yesterday}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {groupedConversations.lastWeek.length > 0 && (
              <ConversationGroup
                title="Last 7 Days"
                conversations={groupedConversations.lastWeek}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
            {groupedConversations.older.length > 0 && (
              <ConversationGroup
                title="Older"
                conversations={groupedConversations.older}
                activeId={activeConversationId}
                onSelect={onSelectConversation}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConversationGroup({
  title,
  conversations,
  activeId,
  onSelect,
}: {
  title: string;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b border-slate-200 py-2 dark:border-slate-800">
      <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="space-y-1 px-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full rounded-lg p-3 text-left transition-colors ${
              conv.id === activeId
                ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="mb-1 flex items-start justify-between">
              <h4 className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {conv.title}
              </h4>
              <span className="ml-2 shrink-0 text-xs text-slate-400 dark:text-slate-600">
                {conv.messageCount}
              </span>
            </div>
            <p className="line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
              {conv.opportunityName}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
