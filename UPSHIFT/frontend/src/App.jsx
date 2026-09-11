import { useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const people = [
  ["01", "Steve Jobs", "THINKING", "Focus is about saying no."],
  ["02", "Warren Buffett", "MONEY", "Think long term. Protect the downside."],
  ["03", "Elon Musk", "EXECUTION", "Question assumptions before optimizing."],
  ["04", "Sara Blakely", "FAILURE", "Failure is feedback, not identity."],
];

function App() {
  const [profile, setProfile] = useState({
    age: "",
    situation: "",
    skills: "",
    income: "",
    savings: "",
    hours: "",
    goal: "",
    problem: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const moveTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  async function findMove() {
    if (!profile.goal.trim()) {
      alert("Tell UPSHIFT your biggest goal first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/ai-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error();

      setResult(await res.json());
    } catch {
      setResult({
        upshift_score: 70,
        bottleneck: "Focused execution",
        bottleneck_reason:
          "Your next level needs one clear priority instead of scattered effort.",
        next_moves: [
          "Choose one high-value skill.",
          "Build one proof-of-work project.",
          "Review your progress every Sunday.",
        ],
        thirty_day_focus:
          "Build one valuable skill and turn it into visible proof.",
        people_to_study: ["Steve Jobs", "Warren Buffett"],
        warning: "Connect the UPSHIFT AI backend for research-grounded analysis.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <div className="brand" onClick={() => moveTo("home")}>UPSHIFT<span>®</span></div>

        <div className="nav-links">
          <button onClick={() => moveTo("greats")}>Greats</button>
          <button onClick={() => moveTo("next")}>Next Move</button>
          <button onClick={() => moveTo("wealth")}>Wealth</button>
          <button onClick={() => moveTo("level")}>Level Up</button>
        </div>

        <button className="nav-cta" onClick={() => moveTo("next")}>
          START →
        </button>
      </nav>

      <section id="home" className="hero">
        <div className="hero-label">
          <i /> PERSONAL INTELLIGENCE / 001
        </div>

        <h1>
          Become
          <br />
          <em>harder to ignore.</em>
        </h1>

        <div className="hero-bottom">
          <p>
            An AI built from the experiences, decisions and principles of
            extraordinary people.
          </p>

          <button className="circle-btn" onClick={() => moveTo("next")}>
            FIND
            <br />
            MY MOVE ↘
          </button>
        </div>

        <div className="hero-line">
          <span>01</span>
          <div />
          <span>UPSHIFT / 2026</span>
        </div>
      </section>

      <section className="manifesto">
        <div className="section-tag">THE IDEA</div>

        <h2>
          Don't copy
          <br />
          <span>success.</span>
          <br />
          Understand it.
        </h2>

        <p>
          UPSHIFT studies people, decisions, failures and principles to find
          patterns that can actually help you move forward.
        </p>
      </section>

      <section id="greats" className="section">
        <div className="section-head">
          <div>
            <div className="section-tag">01 / STUDY THE GREATS</div>
            <h2>Patterns<br /><span>over personalities.</span></h2>
          </div>
          <p>What repeatedly works across extraordinary people.</p>
        </div>

        <div className="people">
          {people.map(([num, name, category, principle]) => (
            <article className="person" key={name}>
              <div className="person-top">
                <span>{num}</span>
                <small>{category}</small>
              </div>
              <h3>{name}</h3>
              <p>{principle}</p>
              <div className="arrow">↗</div>
            </article>
          ))}
        </div>
      </section>

      <section id="next" className="next">
        <div className="section-tag">02 / YOUR NEXT MOVE</div>

        <div className="next-title">
          <h2>
            If I were
            <br />
            <span>in your position.</span>
          </h2>
          <p>
            Give UPSHIFT the context. We'll identify the bottleneck between
            where you are and where you want to be.
          </p>
        </div>

        <div className="form">
          <Field label="AGE" value={profile.age} onChange={(v) => update("age", v)} placeholder="20" />
          <Field label="CURRENT SITUATION" value={profile.situation} onChange={(v) => update("situation", v)} placeholder="Student / Job / Business" />
          <Field label="SKILLS" value={profile.skills} onChange={(v) => update("skills", v)} placeholder="Python, AI, communication..." />
          <Field label="MONTHLY INCOME" value={profile.income} onChange={(v) => update("income", v)} placeholder="₹0" />
          <Field label="SAVINGS" value={profile.savings} onChange={(v) => update("savings", v)} placeholder="₹10,000" />
          <Field label="TIME / DAY" value={profile.hours} onChange={(v) => update("hours", v)} placeholder="2 hours" />
          <Field wide label="BIGGEST GOAL" value={profile.goal} onChange={(v) => update("goal", v)} placeholder="Get an AI engineering job" />
          <Field wide label="BIGGEST PROBLEM" value={profile.problem} onChange={(v) => update("problem", v)} placeholder="I don't know what to focus on" />

          <button className="main-btn" onClick={findMove} disabled={loading}>
            {loading ? "THINKING..." : "FIND MY NEXT MOVE"} <span>↗</span>
          </button>
        </div>

        {result && (
          <div className="result">
            <div className="score">
              <small>UPSHIFT SCORE</small>
              <strong>{result.upshift_score ?? "—"}</strong>
            </div>

            <div className="bottleneck">
              <small>CURRENT BOTTLENECK</small>
              <h3>{result.bottleneck}</h3>
              <p>{result.bottleneck_reason}</p>
            </div>

            <div className="moves">
              <small>NEXT MOVES</small>
              {(result.next_moves || []).map((move, i) => (
                <div className="move" key={i}>
                  <span>0{i + 1}</span>
                  <p>{move}</p>
                </div>
              ))}
            </div>

            <div className="focus">
              <small>30-DAY FOCUS</small>
              <p>{result.thirty_day_focus}</p>
              <small>PEOPLE TO STUDY</small>
              <div className="chips">
                {(result.people_to_study || []).map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </div>
            </div>

            {result.warning && <div className="warning">{result.warning}</div>}
          </div>
        )}
      </section>

      <section id="wealth" className="wealth section">
        <div className="section-tag">03 / WEALTH</div>
        <h2>
          Build wealth.
          <br />
          <span>Not just income.</span>
        </h2>

        <div className="wealth-grid">
          <Card n="01" title="EARNING POWER" text="Increase the value of what you can create." />
          <Card n="02" title="FINANCIAL IQ" text="Understand money before making money decisions." />
          <Card n="03" title="RISK" text="Protect the downside while building the upside." />
        </div>
      </section>

      <section id="level" className="level section">
        <div className="section-tag">04 / LEVEL UP</div>
        <h2>Know your<br /><span>edge.</span></h2>

        <div className="scores">
          <Score title="THINKING" value={78} />
          <Score title="CAREER" value={64} />
          <Score title="MONEY" value={52} />
          <Score title="COMMUNICATION" value={71} />
          <Score title="DISCIPLINE" value={68} />
        </div>
      </section>

      <footer>
        <div className="brand">UPSHIFT<span>®</span></div>
        <p>Personal intelligence for your next level.</p>
        <small>© 2026 UPSHIFT</small>
      </footer>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, wide }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Card({ n, title, text }) {
  return (
    <article className="wealth-card">
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <b>↗</b>
    </article>
  );
}

function Score({ title, value }) {
  return (
    <div className="score-row">
      <span>{title}</span>
      <div className="bar"><i style={{ width: `${value}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

export default App;