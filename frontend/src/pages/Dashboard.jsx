import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Plus, Sparkles, Trash2, CheckCircle2, Clock, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started", color: "bg-gray-100 text-gray-700" },
  { value: "documents_ready", label: "Documents ready", color: "bg-blue-50 text-blue-700" },
  { value: "form_submitted", label: "Form submitted", color: "bg-amber-50 text-amber-700" },
  { value: "interview_scheduled", label: "Interview scheduled", color: "bg-purple-50 text-purple-700" },
  { value: "interview_done", label: "Interview done", color: "bg-indigo-50 text-indigo-700" },
  { value: "result_awaited", label: "Result awaited", color: "bg-orange-50 text-orange-700" },
  { value: "accepted", label: "Accepted", color: "bg-green-50 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-rose-50 text-rose-700" },
];

const STAGE_ORDER = ["not_started", "documents_ready", "form_submitted", "interview_scheduled", "interview_done", "result_awaited"];

function statusBadge(status) {
  const o = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  return o;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const refresh = () => {
    api.get("/applications").then((r) => setApps(r.data)).catch(() => {});
  };
  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const removeApp = async (id) => {
    if (!window.confirm("Delete this application tracker?")) return;
    await api.delete(`/applications/${id}`);
    toast.success("Removed");
    refresh();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = apps.filter((a) => a.interview_date && daysUntil(a.interview_date) >= 0).slice(0, 3);
  const accepted = apps.filter((a) => a.status === "accepted").length;
  const inProgress = apps.filter((a) => !["accepted", "rejected"].includes(a.status)).length;

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* HERO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 relative overflow-hidden">
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-2">
              Welcome back
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }} data-testid="dashboard-welcome">
              Hi {user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 mt-3 max-w-md">
              You have <span className="font-semibold text-gray-900">{inProgress} active</span> {inProgress === 1 ? "application" : "applications"}
              {accepted > 0 && <> and <span className="font-semibold text-[#4CAF50]">{accepted} acceptance{accepted > 1 ? "s" : ""}</span></>}. Keep going!
            </p>
            <Link to="/schools">
              <Button className="mt-6 rounded-xl bg-[#E07A5F] hover:bg-[#C96349] text-white" data-testid="dashboard-add-application">
                <Plus className="w-4 h-4 mr-1.5" /> Track a new school
              </Button>
            </Link>
          </div>

          <div className="bg-[#F0F4F1] rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-gray-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" /> Upcoming interviews
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-600">No interviews scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.application_id} className="bg-white rounded-xl border border-gray-200 p-3" data-testid={`upcoming-${a.application_id}`}>
                    <div className="text-xs text-gray-500">{a.child_name} · {a.school_name}</div>
                    <div className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#E07A5F]" /> in {daysUntil(a.interview_date)} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* APPLICATIONS */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-2">Your applications</div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {apps.length} {apps.length === 1 ? "tracker" : "trackers"}
            </h2>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-[#E07A5F] mb-4" />
            <p className="font-semibold text-gray-900">No applications yet</p>
            <p className="text-gray-600 mt-1">Pick a school from your shortlist and start tracking.</p>
            <Link to="/schools">
              <Button className="mt-5 rounded-xl bg-[#E07A5F] hover:bg-[#C96349] text-white" data-testid="empty-browse-schools">
                Browse schools
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apps.map((a) => {
              const b = statusBadge(a.status);
              const stageIdx = STAGE_ORDER.indexOf(a.status);
              const progress = stageIdx >= 0 ? ((stageIdx + 1) / STAGE_ORDER.length) * 100 : a.status === "accepted" ? 100 : 0;
              const pendingDocs = a.documents?.filter((d) => d.status === "pending").length || 0;
              return (
                <div key={a.application_id} className="bg-white rounded-2xl border border-gray-200 p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid={`application-card-${a.application_id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs tracking-[0.15em] uppercase font-semibold text-gray-500">{a.grade_applying}</div>
                      <h3 className="font-semibold text-gray-900 mt-1 truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {a.child_name}
                      </h3>
                      <Link to={`/schools/${a.school_id}`} className="text-sm text-gray-600 hover:text-[#E07A5F] truncate block" data-testid={`app-school-${a.application_id}`}>
                        {a.school_name}
                      </Link>
                    </div>
                    <button onClick={() => removeApp(a.application_id)} className="text-gray-400 hover:text-rose-600" data-testid={`delete-app-${a.application_id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <Badge className={`${b.color} hover:${b.color} border-0 rounded-full`}>{b.label}</Badge>
                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E07A5F] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#F0F4F1] rounded-xl px-3 py-2 border border-gray-200">
                      <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-gray-500">Documents</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                        {pendingDocs === 0 ? <><CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" /> All ready</> : <><Clock className="w-3.5 h-3.5 text-amber-500" /> {pendingDocs} pending</>}
                      </div>
                    </div>
                    <div className="bg-[#F0F4F1] rounded-xl px-3 py-2 border border-gray-200">
                      <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-gray-500">Interview</div>
                      <div className="font-semibold text-gray-900 mt-0.5">
                        {a.interview_date ? new Date(a.interview_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Not set"}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setOpen(a)}
                    variant="outline"
                    className="mt-5 w-full rounded-xl border-gray-200"
                    data-testid={`manage-app-${a.application_id}`}
                  >
                    Manage tracker
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <ApplicationDialog
          application={open}
          onClose={() => setOpen(null)}
          onSaved={() => { setOpen(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ApplicationDialog({ application, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: application.status,
    interview_date: application.interview_date || "",
    notes: application.notes || "",
    documents: application.documents || [],
    reminder_date: application.reminder_date || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const toggleDoc = (idx) => {
    const docs = [...form.documents];
    docs[idx] = { ...docs[idx], status: docs[idx].status === "ready" ? "pending" : "ready" };
    setForm({ ...form, documents: docs });
  };

  const uploadFile = async (idx, file) => {
    if (!file) return;
    const doc = form.documents[idx];
    setUploadingId(doc.doc_id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(
        `/applications/${application.application_id}/documents/${doc.doc_id}/upload`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setForm((f) => ({ ...f, documents: res.data.documents }));
      toast.success(`Uploaded ${file.name}`);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingId(null);
    }
  };

  const removeFile = async (idx) => {
    const doc = form.documents[idx];
    try {
      await api.delete(`/applications/${application.application_id}/documents/${doc.doc_id}/file`);
      const docs = [...form.documents];
      docs[idx] = { ...doc, file_id: null, file_name: null, file_size: null, storage_path: null, content_type: null, status: "pending" };
      setForm({ ...form, documents: docs });
      toast.success("File removed");
    } catch {
      toast.error("Failed to remove file");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/applications/${application.application_id}`, form);
      toast.success("Tracker updated");
      onSaved();
    } catch (e) {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const formatSize = (b) => (b > 1024 * 1024 ? `${(b / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "Outfit, sans-serif" }}>{application.child_name}'s tracker</DialogTitle>
          <p className="text-sm text-gray-500">{application.school_name} · {application.grade_applying}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1.5 rounded-xl" data-testid="dialog-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Interview date</Label>
              <Input
                type="date"
                value={form.interview_date}
                onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                className="mt-1.5 rounded-xl"
                data-testid="dialog-interview-date"
              />
            </div>
            <div>
              <Label>Reminder date</Label>
              <Input
                type="date"
                value={form.reminder_date}
                onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}
                className="mt-1.5 rounded-xl"
                data-testid="dialog-reminder-date"
              />
            </div>
          </div>

          <div>
            <Label>Documents</Label>
            <div className="mt-2 space-y-2 border border-gray-200 rounded-xl p-3">
              {form.documents.map((d, idx) => (
                <div key={d.doc_id || idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F4F1] transition-colors" data-testid={`doc-${idx}`}>
                  <Checkbox checked={d.status === "ready"} onCheckedChange={() => toggleDoc(idx)} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${d.status === "ready" && !d.file_id ? "line-through text-gray-400" : "text-gray-800 font-medium"}`}>
                      {d.name}
                    </div>
                    {d.file_name && (
                      <div className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                        <Paperclip className="w-3 h-3" /> {d.file_name}
                        {d.file_size ? <span className="text-gray-400">· {formatSize(d.file_size)}</span> : null}
                      </div>
                    )}
                  </div>
                  {d.file_id ? (
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-xs text-rose-600 hover:underline"
                      data-testid={`remove-file-${idx}`}
                    >
                      Remove
                    </button>
                  ) : (
                    <label className="text-xs font-semibold text-[#E07A5F] hover:text-[#C96349] cursor-pointer" data-testid={`upload-trigger-${idx}`}>
                      {uploadingId === d.doc_id ? "Uploading…" : "Upload"}
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => uploadFile(idx, e.target.files?.[0])}
                        disabled={uploadingId === d.doc_id}
                        data-testid={`upload-input-${idx}`}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">PDF, JPG, PNG up to 8 MB. Files are private to your account.</p>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1.5 rounded-xl"
              placeholder="Anything else worth remembering…"
              data-testid="dialog-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl bg-[#E07A5F] hover:bg-[#C96349]" data-testid="dialog-save">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
