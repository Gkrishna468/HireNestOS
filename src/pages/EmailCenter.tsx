import { runEmailIngestionAgent } from "@/agents/emailIngestionAgent";
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Clock, 
  Trash2, 
  Search, 
  Bot, 
  Zap,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EmailCenter() {
  const [selectedMail, setSelectedMail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);

  // ✅ FETCH EMAILS
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEmails(data || []);
  };

  // ✅ SYNC
  const handleSync = async () => {
    try {
      setLoading(true);

      const result = await runEmailIngestionAgent();

      toast.success(result || "Sync complete");
      await fetchEmails();

    } catch (err) {
      console.error(err);
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

      {/* Sidebar */}
      <div className="w-64 border-r border-slate-100 bg-slate-50/30 flex flex-col p-4">
        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black mb-6 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          Compose
        </button>

        <div className="space-y-2">
          {["Inbox", "Sent", "Starred", "Scheduled", "Trash"].map(label => (
            <div key={label} className="px-4 py-2 text-xs font-bold text-slate-600">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* EMAIL LIST */}
      <div className="w-96 border-r border-slate-100 flex flex-col">

        {/* HEADER */}
        <div className="p-4 flex gap-2 border-b">
          <input
            placeholder="Search..."
            className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm"
          />

          <button
            onClick={handleSync}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs flex items-center gap-2"
          >
            <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
            {loading ? "Syncing" : "Sync"}
          </button>
        </div>

        {/* EMAIL LIST */}
        <div className="flex-1 overflow-y-auto">

          {(Array.isArray(emails) ? emails : []).length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">
              No emails yet. Click Sync.
            </div>
          )}

          {(Array.isArray(emails) ? emails : []).map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedMail(mail)}
              className="p-4 border-b cursor-pointer hover:bg-slate-50"
            >
              <div className="text-xs font-bold">
                {mail.from || mail.email || "Unknown"}
              </div>

              <div className="text-sm font-semibold">
                {mail.subject || "No Subject"}
              </div>

              <div className="text-xs text-slate-500 line-clamp-2">
                {mail.body || ""}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* VIEWER */}
      <div className="flex-1 p-6">

        {!selectedMail ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select an email
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-2">
              {selectedMail.subject || "No Subject"}
            </h2>

            <div className="text-sm text-slate-500 mb-4">
              {selectedMail.from || selectedMail.email}
            </div>

            <div className="whitespace-pre-wrap text-sm">
              {selectedMail.body || ""}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
