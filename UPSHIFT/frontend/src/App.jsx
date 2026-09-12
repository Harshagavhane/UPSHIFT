import { useEffect, useState } from "react";
import "./App.css";

const API = "https://upshift.onrender.com";

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

  const [people, setPeople] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  function wealthScore() {
    const income = Number(profile.income) || 0;
    const savings = Number(profile.savings) || 0;

    let foundation = 8;

    if (income > 0 && savings >= income * 6) {
      foundation = 25;
    } else if (income > 0 && savings >= income * 3) {
      foundation = 20;
    } else if (income > 0 && savings >= income) {
      foundation = 15;
    }

    const earning = profile.skills.trim() ? 20 : 5;
    const knowledge = 15;
    const risk = savings > 0 ? 15 : 5;

    return {
      foundation,
      earning,
      knowledge,
      risk,
      total: foundation + earning + knowledge + risk,
    };
  }

  const score = wealthScore();

  useEffect(() => {
    async function loadData() {
      try {
        const peopleRes = await fetch(`${API}/people`);
        const patternsRes = await fetch(`${API}/patterns`);

        if (!peopleRes.ok || !patternsRes.ok) {
          throw new Error("API error");
        }

        const peopleData = await peopleRes.json();
        const patternsData = await patternsRes.json();

        setPeople(peopleData.people || []);
        setPatterns(patternsData.patterns || []);
      } catch (error) {
        console.error(error);

        setPeople([
          {
            id: 1,
            name: "Steve Jobs",
            category: "THINKING",
            principle: "Focus means saying no to many good ideas.",
          },
          {
            id: 2,
            name: "Warren Buffett",
            category: "MONEY",
            principle: "Think long term and protect the downside.",
          },
          {
            id: 3,
            name: "Jeff Bezos",
            category: "EXECUTION",
            principle: "Customer obsession and long-term thinking.",
          },
          {
            id: 4,
            name: "Sara Blakely",
            category: "FAILURE",
            principle: "Failure is feedback, not identity.",
          },
        ]);

        setPatterns([
          {
            pattern: "Long Term Thinking",
            people_count: 3,
            evidence_strength: "Moderate",
          },
          {
            pattern: "Focused Execution",
            people_count: 3,
            evidence_strength: "Moderate",
          },
        ]);
      } finally {
        setResearchLoading(false);
      }
    }

    loadData();
  }, []);

  function handleChange(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  }

  async function findMove() {
    if (!profile.goal.trim()) {
      alert("Tell UPSHIFT your biggest goal first.");
      return;
    }

    if (!isPremium) {
      setResult({ locked: true });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API}/ai-recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.json();

      setResult({
        ...data,
        patterns_detected: data.patterns_detected || [],
        people_to_study:
          data.people_to_study || [
            {
              name: "Warren Buffett",
              reason: "Long-term thinking and disciplined decisions.",
            },
            {
              name: "Jeff Bezos",
              reason: "Long-term execution and customer obsession.",
            },
            {
              name: "Bill Gates",
              reason: "Learning and strategic thinking.",
            },
          ],
      });
    } catch (error) {
      console.error(error);

      setResult({
        upshift_score: 70,
        bottleneck: "Focused execution",
        bottleneck_reason:
          "Your next level needs one clear priority instead of scattered effort.",
        patterns_detected: [
          {
            pattern: "Focused Execution",
            records_count: 1,
            evidence_strength: "Early",
            people: ["UPSHIFT Research"],
            why_relevant:
              "Consistent execution is a repeated development pattern.",
          },
        ],
        evidence_summary:
          "Focused execution is an important next step based on the current profile.",
        next_moves: [
          "Choose one high-value skill.",
          "Build one proof-of-work project.",
          "Review your progress every Sunday.",
        ],
        thirty_day_focus:
          "Build one valuable skill and turn it into visible proof.",
        people_to_study: [
          {
            name: "Warren Buffett",
            reason: "Long-term thinking and disciplined decisions.",
          },
          {
            name: "Jeff Bezos",
            reason: "Long-term execution and customer obsession.",
          },
          {
            name: "Bill Gates",
            reason: "Learning and strategic thinking.",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  function unlockDemo() {
    setIsPremium(true);
    setResult(null);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">UPSHIFT</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#move">Next Move</a>
          <a href="#greats">Greats</a>
          <a href="#wealth">Wealth</a>
          <a href="#level">Level Up</a>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-label">PERSONAL INTELLIGENCE SYSTEM</div>

          <h1>
            Become harder
            <br />
            to ignore.
          </h1>

          <p className="hero-description">
            An AI built from the experiences, decisions and principles of
            extraordinary people.
          </p>

          <a href="#move" className="hero-button">
            FIND MY NEXT MOVE →
          </a>

          <div className="hero-meta">
            <span>RESEARCH-DRIVEN AI</span>
            <span>BUILT FOR YOUR NEXT MOVE</span>
          </div>
        </section>

        <section className="manifesto">
          <div className="section-label">THE UPSHIFT METHOD</div>

          <h2>
            Study the pattern.
            <br />
            Understand the decision.
            <br />
            Make your move.
          </h2>

          <p>
            UPSHIFT turns experiences, decisions, failures and principles into
            practical intelligence for your next move.
          </p>
        </section>

        <section className="section" id="greats">
          <div className="section-heading">
            <div>
              <div className="section-label">01 — STUDY THE GREATS</div>

              <h2>
                Learn from
                <br />
                extraordinary minds.
              </h2>
            </div>

            <p>
              Patterns extracted from people who built, created, invested,
              failed and started again.
            </p>
          </div>

          {researchLoading ? (
            <div className="person-card">
              <p>Loading research...</p>
            </div>
          ) : (
            <div className="people-grid">
              {people.slice(0, 12).map((person, index) => (
                <article
                  className="person-card"
                  key={person.id || index}
                >
                  <span className="card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="card-category">
                    {person.category || "RESEARCH"}
                  </span>

                  <h3>{person.name || "Unknown"}</h3>

                  <p>
                    {person.principle ||
                      person.experience ||
                      "Research insight from UPSHIFT."}
                  </p>
                </article>
              ))}
            </div>
          )}

          {patterns.length > 0 && (
            <div className="patterns-section">
              <div className="section-label">REPEATED PATTERNS</div>

              <div className="patterns-list">
                {patterns.slice(0, 8).map((item, index) => (
                  <div className="pattern-row" key={index}>
                    <strong>{item.pattern || "Pattern"}</strong>

                    <span>
                      {item.people_count || item.records_count || 0} records
                      {" · "}
                      {item.evidence_strength || "Early"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="section move-section" id="move">
          <div className="section-label">02 — YOUR NEXT MOVE</div>

          <div className="move-heading">
            <h2>
              If I were
              <br />
              in your position.
            </h2>

            <p>
              Give UPSHIFT your current situation. We will identify the
              bottleneck and turn it into your next move.
            </p>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-field">
                <label>AGE</label>
                <input
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="20"
                />
              </div>

              <div className="form-field">
                <label>CURRENT SITUATION</label>
                <input
                  name="situation"
                  value={profile.situation}
                  onChange={handleChange}
                  placeholder="Student / Working / Building"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>SKILLS</label>
                <input
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="Python, AI, sales..."
                />
              </div>

              <div className="form-field">
                <label>MONTHLY INCOME</label>
                <input
                  name="income"
                  type="number"
                  value={profile.income}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>SAVINGS</label>
                <input
                  name="savings"
                  type="number"
                  value={profile.savings}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>HOURS AVAILABLE / DAY</label>
                <input
                  name="hours"
                  value={profile.hours}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="form-field">
              <label>BIGGEST GOAL *</label>
              <input
                name="goal"
                value={profile.goal}
                onChange={handleChange}
                placeholder="What do you want to achieve?"
              />
            </div>

            <div className="form-field">
              <label>BIGGEST PROBLEM</label>
              <textarea
                name="problem"
                value={profile.problem}
                onChange={handleChange}
                placeholder="What's holding you back?"
                rows="4"
              />
            </div>

            <button
              className="primary-button"
              onClick={findMove}
              disabled={loading}
            >
              {loading ? "UPSHIFT IS THINKING..." : "FIND MY NEXT MOVE →"}
            </button>
          </div>

          {result && result.locked && !isPremium && (
            <div className="premium-card">
              <div className="section-label">UPSHIFT PREMIUM</div>

              <h2>
                Your next move
                <br />
                shouldn't be generic.
              </h2>

              <p>
                Unlock your personalized UPSHIFT intelligence report based on
                your goals, skills and situation.
              </p>

              <div className="premium-features">
                <p>✓ Personal bottleneck analysis</p>
                <p>✓ Research-backed patterns</p>
                <p>✓ 30-day action plan</p>
                <p>✓ People to study</p>
              </div>

              <div className="premium-price">
                <span>ONE-TIME ACCESS</span>
                <strong>₹49</strong>
              </div>

              <button className="primary-button" onClick={unlockDemo}>
                UNLOCK UPSHIFT — ₹49 →
              </button>

              <small>
                Demo unlock for now. Real payment will be connected next.
              </small>
            </div>
          )}

          {result && !result.locked && (
            <div className="ai-result">
              <div className="result-top">
                <div>
                  <span className="section-label">YOUR UPSHIFT SCORE</span>

                  <div className="score">{result.upshift_score}</div>
                </div>

                <div className="bottleneck">
                  <span>CURRENT BOTTLENECK</span>

                  <h3>{result.bottleneck}</h3>

                  <p>{result.bottleneck_reason}</p>
                </div>
              </div>

              {result.patterns_detected &&
                result.patterns_detected.length > 0 && (
                  <div className="result-block">
                    <span>PATTERNS DETECTED</span>

                    <div className="moves-list">
                      {result.patterns_detected.map((pattern, index) => (
                        <div className="move-item" key={index}>
                          <strong>
                            {String(index + 1).padStart(2, "0")}
                          </strong>

                          <div>
                            <h3>{pattern.pattern}</h3>

                            <p>
                              {pattern.records_count || 0} research records
                              {" · "}
                              {pattern.evidence_strength || "Early"}
                            </p>

                            {pattern.people &&
                              pattern.people.length > 0 && (
                                <p>
                                  Evidence connected to:{" "}
                                  {pattern.people.join(", ")}
                                </p>
                              )}

                            {pattern.why_relevant && (
                              <p>{pattern.why_relevant}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {result.evidence_summary && (
                <div className="result-block">
                  <span>RESEARCH SIGNAL</span>
                  <h3>{result.evidence_summary}</h3>
                </div>
              )}

              <div className="result-grid">
                <div className="result-block">
                  <span>NEXT MOVES</span>

                  <div className="moves-list">
                    {result.next_moves &&
                      result.next_moves.map((move, index) => (
                        <div className="move-item" key={index}>
                          <strong>
                            {String(index + 1).padStart(2, "0")}
                          </strong>

                          <p>{move}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="result-block">
                  <span>30-DAY FOCUS</span>

                  <h3>{result.thirty_day_focus}</h3>
                </div>
              </div>

              <div className="result-people">
                <span>PEOPLE TO STUDY</span>

                <div className="study-list">
                  {result.people_to_study &&
                    result.people_to_study.map((person, index) => (
                      <div className="study-person" key={index}>
                        <strong>{person.name}</strong>
                        <p>{person.reason}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="section" id="wealth">
          <div className="section-label">03 — WEALTH</div>

          <div className="section-heading">
            <h2>
              Build the
              <br />
              foundation first.
            </h2>

            <p>
              Wealth starts with earning power, financial knowledge and the
              ability to survive uncertainty.
            </p>
          </div>

          <div className="wealth-grid">
            <div className="wealth-card">
              <span>01</span>
              <h3>Financial Foundation</h3>
              <strong>{score.foundation}/25</strong>
              <p>Your current savings and financial base.</p>
            </div>

            <div className="wealth-card">
              <span>02</span>
              <h3>Earning Power</h3>
              <strong>{score.earning}/25</strong>
              <p>Your ability to increase future income through skills.</p>
            </div>

            <div className="wealth-card">
              <span>03</span>
              <h3>Financial Knowledge</h3>
              <strong>{score.knowledge}/25</strong>
              <p>Your understanding of money and financial decisions.</p>
            </div>

            <div className="wealth-card">
              <span>04</span>
              <h3>Risk Management</h3>
              <strong>{score.risk}/25</strong>
              <p>Your financial safety and ability to handle uncertainty.</p>
            </div>
          </div>

          <div className="wealth-total">
            <span>WEALTH FOUNDATION SCORE</span>
            <strong>{score.total}/100</strong>
          </div>
        </section>

        <section className="section" id="level">
          <div className="section-label">04 — LEVEL UP</div>

          <div className="section-heading">
            <h2>
              See where
              <br />
              you stand.
            </h2>

            <p>
              Your current development across the areas that compound over
              time.
            </p>
          </div>

          <div className="level-grid">
            <div className="level-card">
              <span>THINKING</span>
              <strong>{score.knowledge * 4}</strong>
              <p>Learning and strategic thinking.</p>
            </div>

            <div className="level-card">
              <span>CAREER</span>
              <strong>{score.earning * 4}</strong>
              <p>Skills and earning potential.</p>
            </div>

            <div className="level-card">
              <span>MONEY</span>
              <strong>{score.foundation * 4}</strong>
              <p>Financial foundation and awareness.</p>
            </div>

            <div className="level-card">
              <span>DISCIPLINE</span>
              <strong>{score.risk * 4}</strong>
              <p>Consistency and risk management.</p>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="section-label">UPSHIFT</div>

          <h2>
            Your next level
            <br />
            starts with one move.
          </h2>

          <a href="#move" className="hero-button">
            FIND MY NEXT MOVE →
          </a>
        </section>
      </main>

      <footer className="footer">
        <strong>UPSHIFT</strong>
        <span>PERSONAL INTELLIGENCE SYSTEM</span>
        <span>© 2026 UPSHIFT</span>
      </footer>
    </div>
  );
}

export default App;