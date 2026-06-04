import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Star, MapPin, IndianRupee, Calendar, Phone, ExternalLink, Heart, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const FACILITY_LABELS = {
  sports: "Sports",
  music: "Music",
  digital: "Digital Learning",
  drama: "Drama",
  swimming: "Swimming",
  library: "Library",
  art: "Art",
};

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [school, setSchool] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [form, setForm] = useState({ child_name: "", child_dob: "", grade_applying: "Grade 1", status: "not_started", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/schools/${id}`).then((r) => setSchool(r.data)).catch(() => navigate("/schools"));
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      api.get("/favourites/ids").then((r) => setIsFav(r.data.ids.includes(id))).catch(() => {});
    }
  }, [user, id]);

  const toggleFav = async () => {
    if (!user) { toast.info("Sign in to save favourites"); return; }
    if (isFav) { await api.delete(`/favourites/${id}`); setIsFav(false); toast.success("Removed from favourites"); }
    else { await api.post(`/favourites/${id}`); setIsFav(true); toast.success("Added to favourites"); }
  };

  const submitTrack = async () => {
    if (!user) { toast.info("Sign in to track applications"); return; }
    if (!form.child_name.trim()) { toast.error("Please enter your child's name"); return; }
    setSubmitting(true);
    try {
      await api.post("/applications", { ...form, school_id: id });
      toast.success("Application tracker started");
      setTrackOpen(false);
      navigate("/dashboard");
    } catch (e) {
      toast.error("Failed to start tracker");
    } finally {
      setSubmitting(false);
    }
  };

  if (!school) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const feesText = `₹${(school.fees_min / 100000).toFixed(1)}L – ₹${(school.fees_max / 100000).toFixed(1)}L`;

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#E07A5F] mb-6" data-testid="back-button">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="relative h-[320px] md:h-[420px] rounded-3xl overflow-hidden border border-gray-200 mb-8">
          <img src={school.image} alt={school.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="flex items-center gap-2 mb-3">
              {school.admission_open ? (
                <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50] text-white border-0 rounded-full">Admissions Open</Badge>
              ) : (
                <Badge className="bg-gray-700 hover:bg-gray-700 text-white border-0 rounded-full">Admissions Closed</Badge>
              )}
              <Badge className="bg-white/15 backdrop-blur hover:bg-white/15 text-white border-0 rounded-full">{school.board}</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "Outfit, sans-serif" }} data-testid="school-name">
              {school.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {school.area}{school.city ? `, ${school.city}` : ""}</span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-[#FFB347] text-[#FFB347]" /> {school.rating}
                <span className="opacity-75">({school.google_reviews_count?.toLocaleString?.("en-IN")} Google reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Est. {school.established}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-3">About</div>
              <p className="text-gray-700 leading-relaxed">{school.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-4">Facilities</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2 bg-[#F0F4F1] rounded-xl px-3 py-2 border border-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                    <span className="text-sm font-medium text-gray-800">{FACILITY_LABELS[f] || f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-4">Admission Process</div>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] font-semibold text-xs flex items-center justify-center shrink-0">1</span> Submit online application form before the deadline.</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] font-semibold text-xs flex items-center justify-center shrink-0">2</span> Upload required documents (birth certificate, address proof, photos).</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] font-semibold text-xs flex items-center justify-center shrink-0">3</span> Attend parent & child interaction round.</li>
                <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] font-semibold text-xs flex items-center justify-center shrink-0">4</span> Receive offer letter and complete fee payment.</li>
              </ol>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0F4F1] rounded-xl border border-gray-200 p-3">
                    <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-500 mb-1">Google</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FFB347] text-[#FFB347]" /> {school.rating}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{school.google_reviews_count?.toLocaleString?.("en-IN")} reviews</div>
                  </div>
                  <div className="bg-[#F0F4F1] rounded-xl border border-gray-200 p-3">
                    <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-500 mb-1">10th Pass</div>
                    <div className="font-semibold text-[#4CAF50]">
                      {school.pass_percentage_10th != null ? `${school.pass_percentage_10th}%` : "—"}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">last year</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-1">Annual Fees</div>
                  <div className="text-xl font-bold text-gray-900 flex items-center gap-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                    <IndianRupee className="w-5 h-5" /> {feesText}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-1">Application Deadline</div>
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#E07A5F]" />
                    {new Date(school.admission_deadline).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-[0.2em] uppercase font-semibold text-gray-500 mb-1">Contact</div>
                  <a href={`tel:${school.phone}`} className="text-base font-medium text-gray-900 flex items-center gap-1.5 hover:text-[#E07A5F]" data-testid="school-phone">
                    <Phone className="w-4 h-4" /> {school.phone}
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  {school.application_url && school.application_url !== "#" && (
                    <a href={school.application_url} target="_blank" rel="noopener noreferrer" data-testid="apply-now-link">
                      <Button className="w-full rounded-xl bg-[#1F2937] hover:bg-[#E07A5F] text-white transition-colors duration-200">
                        Apply on school site <ExternalLink className="w-4 h-4 ml-1.5" />
                      </Button>
                    </a>
                  )}
                  <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-xl bg-[#E07A5F] hover:bg-[#C96349] text-white" data-testid="track-application-button">
                        Track this application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Outfit, sans-serif" }}>Start tracking</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div>
                          <Label>Child's name</Label>
                          <Input
                            value={form.child_name}
                            onChange={(e) => setForm({ ...form, child_name: e.target.value })}
                            placeholder="e.g., Aarav Sharma"
                            className="mt-1.5 rounded-xl"
                            data-testid="track-child-name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Date of birth</Label>
                            <Input
                              type="date"
                              value={form.child_dob}
                              onChange={(e) => setForm({ ...form, child_dob: e.target.value })}
                              className="mt-1.5 rounded-xl"
                              data-testid="track-child-dob"
                            />
                          </div>
                          <div>
                            <Label>Applying for</Label>
                            <Select value={form.grade_applying} onValueChange={(v) => setForm({ ...form, grade_applying: v })}>
                              <SelectTrigger className="mt-1.5 rounded-xl" data-testid="track-grade"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["Nursery", "Junior KG", "Senior KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"].map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Anything to remember…"
                            className="mt-1.5 rounded-xl"
                            data-testid="track-notes"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTrackOpen(false)} className="rounded-xl" data-testid="track-cancel">Cancel</Button>
                        <Button onClick={submitTrack} disabled={submitting} className="rounded-xl bg-[#E07A5F] hover:bg-[#C96349]" data-testid="track-submit">
                          {submitting ? "Saving…" : "Start tracking"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={toggleFav} className="w-full rounded-xl" data-testid="favourite-button">
                    <Heart className={`w-4 h-4 mr-1.5 ${isFav ? "fill-[#E07A5F] text-[#E07A5F]" : ""}`} />
                    {isFav ? "Saved to favourites" : "Save to favourites"}
                  </Button>
                </div>
              </div>
            </div>
            <Link to="/schools" className="block text-center text-sm text-gray-600 hover:text-[#E07A5F]" data-testid="back-to-schools">
              ← Back to all schools
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
