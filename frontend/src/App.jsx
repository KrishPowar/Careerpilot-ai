import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  LogOut,
  Moon,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UploadCloud,
  UserRound,
} from "lucide-react";

import api, { clearSession, getStoredUser, setSession } from "./services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const defaultRoles = [
  "Data Scientist",
  "AI Engineer",
  "Machine Learning Engineer",
  "Software Engineer",
  "Full Stack Developer",
];

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [authOpen, setAuthOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [targetRole, setTargetRole] = useState(defaultRoles[0]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (user) {
      setAuthOpen(false);
    }
  }, [user]);

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mesh-bg fixed inset-0 -z-10" />
      <Header user={user} onLogin={() => setAuthOpen(true)} onLogout={logout} dark={dark} setDark={setDark} />
      {user ? (
        <Dashboard user={user} targetRole={targetRole} setTargetRole={setTargetRole} />
      ) : (
        <Landing onStart={() => setAuthOpen(true)} />
      )}
      <AnimatePresence>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthed={setUser} />}
      </AnimatePresence>
    </div>
  );
}

function Header({ user, onLogin, onLogout, dark, setDark }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-cyan-300 dark:bg-white dark:text-slate-950">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-lg font-bold">CareerPilot AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Smart Resume Analyzer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setDark(!dark)}
            className="focus-ring rounded-lg border border-slate-200 bg-white/70 p-2 text-slate-700 transition hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 sm:flex">
                <UserRound size={16} /> {user.name}
              </span>
              <button onClick={onLogout} className="focus-ring rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                <span className="flex items-center gap-2"><LogOut size={16} /> Logout</span>
              </button>
            </>
          ) : (
            <button onClick={onLogin} className="focus-ring rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
              Sign in
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

function Landing({ onStart }) {
  const features = [
    ["Resume Intelligence", "PDF and DOCX parsing with skill extraction, section checks, and role fit scoring."],
    ["Career Roadmaps", "A practical 12-week learning plan tailored to missing skills and target roles."],
    ["Mentor Dashboard", "Charts, course picks, LinkedIn suggestions, chatbot guidance, and PDF reports."],
  ];
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-cyan-300/50 bg-cyan-50/80 px-3 py-2 text-sm font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
            <ShieldCheck size={16} /> Production-ready career intelligence
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            CareerPilot AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Upload a resume, choose a target role, and get an ATS score, skill gap analysis, curated resources, LinkedIn copy, and a complete career roadmap.
          </p>
          <div className="mt-7 grid max-w-2xl grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-white/65 text-center shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
            {[
              ["100", "ATS score"],
              ["12", "week plan"],
              ["5", "target roles"],
            ].map(([value, label]) => (
              <div key={label} className="border-r border-slate-200 px-3 py-4 last:border-r-0 dark:border-slate-800">
                <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={onStart} className="focus-ring rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 shadow-glow transition hover:bg-cyan-400">
              <span className="flex items-center justify-center gap-2"><UploadCloud size={18} /> Analyze resume</span>
            </button>
            <a href="#features" className="rounded-lg border border-slate-300 px-6 py-3 text-center font-bold text-slate-700 transition hover:border-violet-400 dark:border-slate-700 dark:text-slate-200">
              Explore features
            </a>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }} className="glass premium-card rounded-lg p-5">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-cyan-300">ATS readiness</p>
                <p className="text-4xl font-black">86/100</p>
              </div>
              <BriefcaseBusiness className="text-violet-300" size={40} />
            </div>
            <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-semibold text-cyan-200">Role match</p>
              <p className="mt-1 text-2xl font-black">Machine Learning Engineer</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Python", "React", "MLOps", "System Design"].map((skill) => (
                <div key={skill} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-300">{skill}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${skill.length * 11}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 p-4">
              <p className="font-semibold">Next milestone</p>
              <p className="mt-1 text-sm text-slate-300">Deploy a model-backed project and rewrite bullets with measurable outcomes.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(([title, body]) => (
            <motion.article whileHover={{ y: -4 }} key={title} className="glass premium-card rounded-lg p-6">
              <CheckCircle2 className="mb-4 text-cyan-500" />
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "The roadmap made my applications feel focused instead of random.",
            "The ATS feedback caught missing keywords I had completely overlooked.",
            "The LinkedIn copy gave me a recruiter-ready profile in minutes.",
          ].map((quote, index) => (
            <blockquote key={quote} className="rounded-lg border border-slate-200 bg-white/60 p-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
              <p className="leading-7">"{quote}"</p>
              <footer className="mt-4 text-sm font-semibold text-cyan-600 dark:text-cyan-300">Beta user {index + 1}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </main>
  );
}

function AuthModal({ onClose, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const { data } = await api.post(endpoint, form);
      setSession(data.token, data.user);
      onAuthed(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={submit} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} className="glass w-full max-w-md rounded-lg p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{mode === "login" ? "Welcome back" : "Create account"}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Demo admin: admin@careerpilot.ai / Admin@12345</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Close</button>
        </div>
        {mode === "signup" && (
          <label className="mb-4 block text-sm font-semibold">
            Name
            <input className="focus-ring mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
        )}
        <label className="mb-4 block text-sm font-semibold">
          Email
          <input type="email" className="focus-ring mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="mb-4 block text-sm font-semibold">
          Password
          <input type="password" className="focus-ring mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>}
        <button disabled={loading} className="focus-ring w-full rounded-lg bg-cyan-500 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">
          {loading ? "Working..." : mode === "login" ? "Login" : "Sign up"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-sm font-semibold text-cyan-600 dark:text-cyan-300">
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </motion.form>
    </motion.div>
  );
}

function Dashboard({ user, targetRole, setTargetRole }) {
  const [roles, setRoles] = useState([]);
  const [trends, setTrends] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([{ from: "mentor", text: "Ask me about interviews, projects, salary, or what to learn next." }]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/roles").then(({ data }) => setRoles(data.roles));
    api.get("/trends").then(({ data }) => setTrends(data));
    if (user.isAdmin) {
      api.get("/admin/metrics").then(({ data }) => setAdmin(data));
    }
  }, [user.isAdmin]);

  const upload = async () => {
    if (!file) {
      setError("Choose a PDF or DOCX resume first.");
      return;
    }
    setLoading(true);
    setError("");
    const payload = new FormData();
    payload.append("resume", file);
    payload.append("targetRole", targetRole);
    try {
      const uploaded = await api.post("/resumes/upload", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setResume(uploaded.data);
      const analyzed = await api.post("/analysis/analyze", { resumeId: uploaded.data.resumeId, targetRole });
      setResult(analyzed.data);
    } catch (err) {
      setError(err.response?.data?.error || "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    const outgoing = message.trim();
    if (!outgoing || chatLoading) return;
    const next = [...chat, { from: "you", text: outgoing }];
    setChat(next);
    setMessage("");
    setChatLoading(true);
    try {
      const history = chat.map((entry) => ({
        role: entry.from === "you" ? "user" : "assistant",
        content: entry.text,
      }));
      const { data } = await api.post("/chat", {
        message: outgoing,
        targetRole,
        history,
        parsed: result?.parsed || resume?.parsed || {},
        analysis: result?.analysis || {},
      });
      setChat([...next, { from: "mentor", text: data.reply }]);
    } catch (err) {
      const detail = err.response?.data?.error || "The AI mentor is unavailable right now. Please try again.";
      setChat([...next, { from: "mentor", text: detail, error: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!result?.analysisId) return;
    const response = await api.get(`/reports/${result.analysisId}`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `careerpilot-analysis-${result.analysisId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">Career cockpit</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">Resume analysis and roadmap</h1>
        </div>
        <label className="text-sm font-semibold">
          Target role
          <select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 lg:w-72">
            {(roles.length ? roles.map((role) => role.name) : defaultRoles).map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="glass rounded-lg p-5 shadow-lg">
          <h2 className="flex items-center gap-2 text-xl font-black"><FileText size={22} /> Resume upload</h2>
          <Dropzone file={file} setFile={setFile} />
          {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>}
          <button onClick={upload} disabled={loading} className="focus-ring mt-5 w-full rounded-lg bg-cyan-500 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">
            <span className="flex items-center justify-center gap-2"><UploadCloud size={18} /> {loading ? "Analyzing..." : "Upload and analyze"}</span>
          </button>
          {resume?.parsed && <ParsedResume parsed={resume.parsed} />}
        </section>

        <section className="grid gap-5">
          <ScorePanel result={result} />
          <SkillGap result={result} role={targetRole} />
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Roadmap result={result} />
        <Mentor chat={chat} message={message} setMessage={setMessage} sendChat={sendChat} loading={chatLoading} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Trends trends={trends} />
        <LinkedIn result={result} onDownload={downloadReport} />
      </div>

      {user.isAdmin && <AdminDashboard admin={admin} />}
    </main>
  );
}

function Dropzone({ file, setFile }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };
  return (
    <label
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${dragging ? "border-cyan-400 bg-cyan-400/10" : "border-slate-300 dark:border-slate-700"}`}
    >
      <UploadCloud className="mb-4 text-cyan-500" size={42} />
      <p className="font-bold">{file ? file.name : "Drop your resume here"}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">PDF or DOCX, up to 8 MB</p>
      <input type="file" accept=".pdf,.docx" className="hidden" onChange={(event) => setFile(event.target.files?.[0])} />
    </label>
  );
}

function ParsedResume({ parsed }) {
  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <h3 className="font-black">Parsed profile</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{parsed.name} {parsed.email && `- ${parsed.email}`}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {parsed.skills.slice(0, 12).map((skill) => (
          <span key={skill} className="rounded-lg bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-200">{skill}</span>
        ))}
      </div>
    </div>
  );
}

function ScorePanel({ result }) {
  const score = result?.analysis?.atsScore ?? 0;
  const chart = useMemo(() => ({
    labels: ["Score", "Remaining"],
    datasets: [{ data: [score, 100 - score], backgroundColor: ["#06b6d4", "#334155"], borderWidth: 0 }],
  }), [score]);
  return (
    <section className="glass rounded-lg p-5 shadow-lg">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="h-44 w-44 shrink-0">
          <Doughnut data={chart} options={{ cutout: "72%", plugins: { legend: { display: false } } }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-300">ATS score</p>
          <h2 className="text-5xl font-black">{score}/100</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{result?.analysis?.recommendation || "Upload a resume to generate a production-style ATS analysis."}</p>
        </div>
      </div>
      {result && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <SignalList title="Strengths" items={result.analysis.strengths} tone="good" />
          <SignalList title="Weaknesses" items={result.analysis.weaknesses} tone="warn" />
        </div>
      )}
    </section>
  );
}

function SignalList({ title, items, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => <li key={item} className={tone === "good" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>{item}</li>)}
      </ul>
    </div>
  );
}

function SkillGap({ result, role }) {
  const missing = result?.analysis?.missingSkills || [];
  const matched = result?.analysis?.matchedSkills || [];
  return (
    <section className="glass rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-black">Skill gap for {role}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SkillColumn title="Matched" skills={matched} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" />
        <SkillColumn title="Missing" skills={missing} className="bg-violet-500/10 text-violet-700 dark:text-violet-200" />
      </div>
    </section>
  );
}

function SkillColumn({ title, skills, className }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <h3 className="font-black">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {(skills.length ? skills : ["Awaiting analysis"]).map((skill) => <span key={skill} className={`rounded-lg px-2 py-1 text-xs font-bold ${className}`}>{skill}</span>)}
      </div>
    </div>
  );
}

function Roadmap({ result }) {
  const weeks = result?.roadmap || [];
  return (
    <section className="glass rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-black">12-week roadmap</h2>
      <div className="mt-5 grid max-h-[520px] gap-3 overflow-auto pr-1 md:grid-cols-2">
        {(weeks.length ? weeks : Array.from({ length: 4 }, (_, i) => ({ week: i + 1, focus: "Upload resume", goal: "Your personalized plan will appear here.", milestones: [] }))).map((week) => (
          <article key={week.week} className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-300">Week {week.week}</p>
            <h3 className="mt-1 font-black">{week.focus}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{week.goal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Mentor({ chat, message, setMessage, sendChat, loading }) {
  return (
    <section className="glass flex min-h-[460px] flex-col rounded-lg p-5 shadow-lg">
      <h2 className="flex items-center gap-2 text-xl font-black"><Bot size={22} /> AI career mentor</h2>
      <div className="mt-5 flex-1 space-y-3 overflow-auto">
        {chat.map((entry, index) => (
          <div key={`${entry.from}-${index}`} className={`rounded-lg p-3 text-sm leading-6 ${entry.from === "you" ? "ml-auto max-w-[86%] bg-cyan-500 text-slate-950" : entry.error ? "mr-auto max-w-[86%] bg-red-500/10 text-red-700 dark:text-red-300" : "mr-auto max-w-[86%] bg-white/70 text-slate-700 dark:bg-slate-950/70 dark:text-slate-200"}`}>
            {entry.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[86%] rounded-lg bg-white/70 p-3 text-sm font-semibold text-slate-500 dark:bg-slate-950/70 dark:text-slate-300">
            Thinking...
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={message} disabled={loading} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendChat()} placeholder="Ask about interviews or skills" className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950" />
        <button onClick={sendChat} disabled={loading} aria-label="Send message" className="focus-ring rounded-lg bg-slate-950 px-4 text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"><Send size={18} /></button>
      </div>
    </section>
  );
}

function Trends({ trends }) {
  const selected = trends?.roles?.[0];
  const salaryData = {
    labels: trends?.labels || [],
    datasets: selected ? [{ label: selected.name, data: selected.salary, borderColor: "#06b6d4", backgroundColor: "rgba(6,182,212,0.18)", tension: 0.35 }] : [],
  };
  const demandData = {
    labels: trends?.roles?.map((role) => role.name) || [],
    datasets: [{ label: "Demand index", data: trends?.roles?.map((role) => role.demand.at(-1)) || [], backgroundColor: ["#06b6d4", "#7c3aed", "#22c55e", "#f59e0b", "#0f172a"] }],
  };
  return (
    <section className="glass rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-black">Salary and job trends</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Line data={salaryData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        <Bar data={demandData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </section>
  );
}

function LinkedIn({ result, onDownload }) {
  return (
    <section className="glass rounded-lg p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-black">LinkedIn optimization</h2>
        <button onClick={onDownload} disabled={!result} className="focus-ring rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
          <span className="flex items-center gap-2"><Download size={16} /> PDF</span>
        </button>
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <p className="text-sm font-bold text-cyan-600 dark:text-cyan-300">Headline</p>
        <p className="mt-2 font-semibold">{result?.linkedin?.headline || "Run an analysis to generate a recruiter-ready headline."}</p>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <p className="text-sm font-bold text-cyan-600 dark:text-cyan-300">About</p>
        <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{result?.linkedin?.about || "Your personalized about section will appear here."}</p>
      </div>
      {result?.courses && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {result.courses.map((course) => (
            <a key={course.title} href={course.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white/60 p-4 transition hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="font-black">{course.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.provider} - {course.price}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminDashboard({ admin }) {
  return (
    <section className="glass mt-5 rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-black">Admin dashboard</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Metric label="Total users" value={admin?.totalUsers ?? 0} />
        <Metric label="Uploaded resumes" value={admin?.uploadedResumes ?? 0} />
        <Metric label="Average ATS" value={admin?.averageAtsScore ?? 0} />
        <Metric label="Popular roles" value={admin?.popularRoles?.[0]?.role || "No data"} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

export default App;
