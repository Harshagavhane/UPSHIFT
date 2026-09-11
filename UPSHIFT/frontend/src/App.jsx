import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [people, setPeople] = useState([]);
  const [active, setActive] = useState("home");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [profile, setProfile] = useState({
    age: 21,
    income: 0,
    savings: 10000,
    skills: "Python, AI",
    goal: "Become an AI Engineer",
    hours: 2,
  });

  useEffect(() => {
    fetch(`${API}/people`)
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []))
      .catch(() => setPeople([]));
  }, []);

  const getRecommendation = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/ai-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        error: "Backend is not running.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo" onClick={() => setActive("home")}>
          UPSHIFT<span>•</span>
        </div>

        <div className="nav-links">
          <button onClick={() => setActive("home")}>Home</button>
          <button onClick={() => setActive("greats")}>Study the Greats</button>
          <button onClick={() => setActive("move")}>Your Next Move</button>
          <button onClick={() => setActive("wealth")}>Wealth</button>
          <button onClick={() => setActive("level")}>Level Up</button>
        </div>
      </nav>

      {active === "home" && (
        <main>
          <section className="hero">
            <p className="eyebrow">PERSONAL INTELLIGENCE SYSTEM</p>

            <h1>
              Become
              <br />
              harder to ignore.
            </h1>

            <p className="hero-text">
              An AI built from the experiences, decisions and principles
              of extraordinary people.
            </p>

            <button className="primary-btn" onClick={() => setActive("move")}>
              FIND MY NEXT MOVE →
            </button>

            <div className="hero-stats">
              <div>
                <strong>{people.length || "1,000"}+</strong>
                <span>PEOPLE STUDIED</span>
              </div>

              <div>
                <strong>∞</strong>
                <span>EXPERIENCES</span>
              </div>

              <div>
                <strong>AI</strong>
                <span>PERSONALIZED REASONING</span>
              </div>
            </div>
          </section>

          <section className="manifesto">
            <p className="eyebrow">THE IDEA</p>

            <h2>
              Don't copy successful people.
              <br />
              Understand their patterns.
            </h2>

            <p>
              UPSHIFT studies decisions, failures, principles and behaviors
              across extraordinary people — then turns those patterns into
              practical next moves for you.
            </p>
          </section>

          <section className="feature-grid">
            <Feature
              number="01"
              title="Study the Greats"
              text="Explore the people, decisions and principles behind extraordinary careers."
              onClick={() => setActive("greats")}
            />

            <Feature
              number="02"
              title="Your Next Move"
              text="Tell UPSHIFT where you are. Get a focused direction for where to go next."
              onClick={() => setActive("move")}
            />

            <Feature
              number="03"
              title="Level Up"
              text="See the areas that deserve more attention across your personal growth."
              onClick={() => setActive("level")}
            />
          </section>
        </main>
      )}

      {active === "greats" && (
        <main className="page">
          <p className="eyebrow">THE GREATS</p>
          <h1 className="page-title">Study the people<br />who changed the game.</h1>

          <div className="people-grid">
            {people.map((person) => (
              <button
                className="person-card"
                key={person.id}
                onClick={() => setSelected(person)}
              >
                <span>0{person.id}</span>
                <h3>{person.person}</h3>
                <p>{person.title}</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="modal" onClick={() => setSelected(null)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="close" onClick={() => setSelected(null)}>
                  ×
                </button>

                <p className="eyebrow">{selected.title}</p>
                <h2>{selected.person}</h2>
                <p>{selected.short_description}</p>

                <div className="detail">
                  <b>PRINCIPLE</b>
                  <p>{selected.principle}</p>
                </div>

                <div className="detail">
                  <b>FAILURE LESSON</b>
                  <p>{selected.failure_lesson}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {active === "move" && (
        <main className="page move-page">
          <p className="eyebrow">YOUR NEXT MOVE</p>

          <h1 className="page-title">
            If I were
            <br />
            in your position.
          </h1>

          <div className="form-card">
            <Input
              label="AGE"
              value={profile.age}
              onChange={(v) => setProfile({ ...profile, age: v })}
            />

            <Input
              label="MONTHLY INCOME"
              value={profile.income}
              onChange={(v) => setProfile({ ...profile, income: v })}
            />

            <Input
              label="SAVINGS"
              value={profile.savings}
              onChange={(v) => setProfile({ ...profile, savings: v })}
            />

            <Input
              label="SKILLS"
              value={profile.skills}
              onChange={(v) => setProfile({ ...profile, skills: v })}
            />

            <Input
              label="GOAL"
              value={profile.goal}
              onChange={(v) => setProfile({ ...profile, goal: v })}
            />

            <Input
              label="FOCUSED HOURS / DAY"
              value={profile.hours}
              onChange={(v) => setProfile({ ...profile, hours: v })}
            />

            <button className="primary-btn full" onClick={getRecommendation}>
              {loading ? "THINKING..." : "FIND MY NEXT MOVE →"}
            </button>
          </div>

          {result && (
            <section className="result-card">
              {result.error ? (
                <p>{result.error}</p>
              ) : (
                <>
                  <div className="score">
                    <span>UPSHIFT SCORE</span>
                    <strong>{result.upshift_score}</strong>
                    <small>/100</small>
                  </div>

                  <div className="result-block">
                    <p className="eyebrow">BOTTLENECK</p>
                    <h2>{result.bottleneck}</h2>
                    <p>{result.bottleneck_reason}</p>
                  </div>

                  {result.patterns?.length > 0 && (
                    <div className="result-block">
                      <p className="eyebrow">PATTERNS</p>

                      {result.patterns.map((item, index) => (
                        <div className="pattern" key={index}>
                          <h3>{item.pattern}</h3>
                          <p>{item.evidence_claim}</p>
                          <small>{item.inference}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.next_moves?.length > 0 && (
                    <div className="result-block">
                      <p className="eyebrow">NEXT MOVES</p>

                      {result.next_moves.map((move, index) => (
                        <div className="next-move" key={index}>
                          <span>0{index + 1}</span>
                          <div>
                            <h3>{move.move}</h3>
                            <p>{move.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="focus">
                    <p className="eyebrow">30-DAY FOCUS</p>
                    <h2>{result.thirty_day_focus}</h2>
                  </div>

                  {result.warning && (
                    <div className="warning">
                      {result.warning}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>
      )}

      {active === "wealth" && (
        <main className="page">
          <p className="eyebrow">WEALTH</p>
          <h1 className="page-title">
            Build the foundation
            <br />
            before the fortune.
          </h1>

          <div className="wealth-grid">
            <Feature
              number="01"
              title="Earning Power"
              text="Build skills that increase your ability to create valuable work."
            />
            <Feature
              number="02"
              title="Financial Knowledge"
              text="Understand money, cash flow, risk and long-term compounding."
            />
            <Feature
              number="03"
              title="Risk Management"
              text="Protect your downside before chasing your upside."
            />
          </div>
        </main>
      )}

      {active === "level" && (
        <main className="page">
          <p className="eyebrow">LEVEL UP</p>
          <h1 className="page-title">
            Measure what
            <br />
            actually matters.
          </h1>

          <div className="level-list">
            {["THINKING", "CAREER", "MONEY", "COMMUNICATION", "DISCIPLINE"].map(
              (item, index) => (
                <div className="level-row" key={item}>
                  <span>0{index + 1}</span>
                  <h2>{item}</h2>
                  <strong>{["78", "64", "52", "71", "83"][index]}</strong>
                </div>
              )
            )}
          </div>
        </main>
      )}

      <footer>
        <div>UPSHIFT</div>
        <span>Built for people who refuse to stay average.</span>
      </footer>
    </div>
  );
}

function Feature({ number, title, text, onClick }) {
  return (
    <button className="feature" onClick={onClick}>
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <b>→</b>
    </button>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="input">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default App;