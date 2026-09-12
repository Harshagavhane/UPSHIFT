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

  useEffect(() => {
    async function loadResearch() {
      try {
        const [peopleRes, patternsRes] = await Promise.all([
          fetch(`${API}/people`),
          fetch(`${API}/patterns`),
        ]);

        if (peopleRes.ok) {
          const peopleData = await peopleRes.json();
          setPeople(
            Array.isArray(peopleData)
              ? peopleData
              : peopleData.people || []
          );
        }

        if (patternsRes.ok) {
          const patternsData = await patternsRes.json();
          setPatterns(
            Array.isArray(patternsData)
              ? patternsData
              : patternsData.patterns || []
          );
        }
      } catch (error) {
        console.error("Research loading error:", error);
      } finally {
        setResearchLoading(false);
      }
    }

    loadResearch();
  }, []);

  const fallbackPeople = [
    {
      name: "Steve Jobs",
      category: "THINKING",
      principle: "Focus is saying no to a thousand things.",
    },
    {
      name: "Warren Buffett",
      category: "MONEY",
      principle: "Protect your downside and think long term.",
    },
    {
      name: "Jeff Bezos",
      category: "CAREER",
      principle: "Make decisions with a long-term perspective.",
    },
    {
      name: "Sara Blakely",
      category: "FAILURE",
      principle: "Treat failure as part of the learning process.",
    },
  ];

  const displayPeople = people.length ? people : fallbackPeople;

  const fallbackPatterns = [
    {
      pattern: "Long Term Thinking",
      people_count: 4,
      evidence_strength: "High",
    },
    {
      pattern: "Continuous Learning",
      people_count: 3,
      evidence_strength: "High",
    },
    {
      pattern: "Calculated Risk",
      people_count: 2,
      evidence_strength: "Moderate",
    },
  ];

  const displayPatterns = patterns.length ? patterns : fallbackPatterns;

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function calculateWealthScore() {
    let score = 45;

    if (Number(profile.income) > 0) score += 10;
    if (Number(profile.savings) > 0) score += 10;
    if (profile.skills.trim()) score += 10;
    if (profile.goal.trim()) score += 10;
    if (profile.problem.trim()) score += 5;
    if (Number(profile.hours) >= 2) score += 5;

    return Math.min(score, 100);
  }

  async function findMove() {
    if (!profile.goal.trim()) {
      alert("Tell UPSHIFT your biggest goal first.");
      return;
    }

    if (!isPremium) {
      setResult({
        locked: true,
      });
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
        throw new Error("AI recommendation failed");
      }

      const data = await response.json();

      setResult({
        ...data,
        locked: false,
      });
    } catch (error) {
      console.error(error);

      setResult({
        locked: false,
        bottleneck:
          "Your biggest bottleneck is turning your goal into consistent execution.",
        next_moves: [
          "Choose one high-value skill and practice it every day.",
          "Build one real project around that skill.",
          "Track your progress every week.",
        ],
        focus:
          "For the next 30 days, focus on skill development and consistent execution.",
        people_to_study: ["Steve Jobs", "Warren Buffett", "Jeff Bezos"],
      });
    } finally {
      setLoading(false);
    }
  }

  async function unlockPremium() {
    try {
      const response = await fetch(`${API}/create-payment-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Could not create payment order");
      }

      const order = await response.json();

      if (!window.Razorpay) {
        const script = document.createElement("script");

        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => openRazorpay(order);

        script.onerror = () => {
          alert("Razorpay failed to load. Please try again.");
        };

        document.body.appendChild(script);
      } else {
        openRazorpay(order);
      }
    } catch (error) {
      console.error(error);
      alert("Payment could not be started. Please try again.");
    }
  }

  function openRazorpay(order) {
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "UPSHIFT",
      description: "UPSHIFT Premium — One Time Access",
      order_id: order.order_id,

      handler: async function (payment) {
        try {
          const verifyResponse = await fetch(`${API}/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            }),
          });

          const verification = await verifyResponse.json();

          if (!verifyResponse.ok || !verification.success) {
            alert("Payment verification failed.");
            return;
          }

          setIsPremium(true);
          setResult(null);

          alert("UPSHIFT Premium unlocked 🚀");
        } catch (error) {
          console.error(error);
          alert("Payment verification failed.");
        }
      },

      modal: {
        ondismiss: function () {
          console.log("Payment window closed.");
        },
      },

      theme: {
        color: "#d4af37",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error(response.error);
      alert("Payment failed. Please try again.");
    });

    razorpay.open();
  }

  const wealthScore = calculateWealthScore();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">UPSHIFT</div>

        <div className="nav-links">
          <a href="#greats">THE GREATS</a>
          <a href="#move">NEXT MOVE</a>
          <a href="#wealth">WEALTH</a>
          <a href="#level">LEVEL UP</a>
        </div>

        <div className="nav-status">
          {isPremium ? "PREMIUM" : "PRIVATE BETA"}
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-label">PERSONAL INTELLIGENCE SYSTEM</div>

          <h1>
            Become
            <br />
            harder to <span>ignore.</span>
          </h1>

          <p className="hero-subtitle">
            An AI built from the experiences, decisions and principles of
            extraordinary people.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("move")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            FIND MY NEXT MOVE →
          </button>

          <div className="hero-proof">
            <span>1,000+ MINDS STUDIED</span>
            <span>RESEARCH → PATTERNS → ACTION</span>
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="manifesto">
          <div className="section-label">THE IDEA</div>

          <h2>
            Success leaves
            <br />
            <em>patterns.</em>
          </h2>

          <p>
            UPSHIFT studies the decisions, failures, habits and principles
            behind extraordinary people — then turns repeated patterns into
            practical guidance for your situation.
          </p>
        </section>

        {/* STUDY THE GREATS */}
        <section id="greats" className="section">
          <div className="section-header">
            <div>
              <div className="section-label">01 — RESEARCH</div>
              <h2>Study the Greats.</h2>
            </div>

            <span className="section-count">
              {researchLoading
                ? "LOADING..."
                : `${displayPeople.length}+ PEOPLE`}
            </span>
          </div>

          <div className="people-grid">
            {displayPeople.slice(0, 12).map((person, index) => (
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
        </section>

        {/* NEXT MOVE */}
        <section id="move" className="section next-move">
          <div className="section-label">02 — PERSONAL INTELLIGENCE</div>

          <h2>
            If I were
            <br />
            <span>in your position.</span>
          </h2>

          <p className="section-description">
            Give UPSHIFT a snapshot of your current situation. We'll identify
            the bottleneck between where you are and where you want to go.
          </p>

          <div className="profile-form">
            <div className="form-row">
              <div className="input-group">
                <label>AGE</label>
                <input
                  name="age"
                  type="number"
                  placeholder="20"
                  value={profile.age}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>HOURS AVAILABLE / DAY</label>
                <input
                  name="hours"
                  type="number"
                  placeholder="2"
                  value={profile.hours}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>CURRENT SITUATION</label>
              <input
                name="situation"
                placeholder="Student, working, building a startup..."
                value={profile.situation}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>YOUR SKILLS</label>
              <input
                name="skills"
                placeholder="Python, sales, design, communication..."
                value={profile.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>MONTHLY INCOME ₹</label>
                <input
                  name="income"
                  type="number"
                  placeholder="0"
                  value={profile.income}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>SAVINGS ₹</label>
                <input
                  name="savings"
                  type="number"
                  placeholder="0"
                  value={profile.savings}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>BIGGEST GOAL</label>
              <textarea
                name="goal"
                placeholder="What do you want to achieve?"
                value={profile.goal}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>BIGGEST PROBLEM RIGHT NOW</label>
              <textarea
                name="problem"
                placeholder="What's stopping you?"
                value={profile.problem}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PREMIUM */}
          {!isPremium && (
            <div className="premium-card">
              <div className="premium-label">UPSHIFT PREMIUM</div>

              <h3>
                Your next move
                <br />
                shouldn't be generic.
              </h3>

              <p>
                Unlock your personalized bottleneck analysis, research-backed
                patterns and a practical 30-day action plan.
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

              <button
                className="primary-button"
                onClick={unlockPremium}
              >
                UNLOCK UPSHIFT — ₹49 →
              </button>
            </div>
          )}

          {isPremium && (
            <div className="premium-unlocked">
              <span>✓ PREMIUM UNLOCKED</span>
              <p>Your personalized intelligence system is ready.</p>
            </div>
          )}

          <button
            className="secondary-button"
            onClick={findMove}
            disabled={loading}
          >
            {loading ? "ANALYZING..." : "FIND MY NEXT MOVE →"}
          </button>

          {/* RESULT */}
          {result?.locked && (
            <div className="locked-result">
              <div className="section-label">PREMIUM REQUIRED</div>

              <h3>Your personal analysis is ready to unlock.</h3>

              <p>
                Complete the ₹49 one-time payment above to receive your
                personalized next move.
              </p>

              <button
                className="primary-button"
                onClick={unlockPremium}
              >
                UNLOCK FOR ₹49 →
              </button>
            </div>
          )}

          {result && !result.locked && (
            <div className="ai-result">
              <div className="section-label">YOUR UPSHIFT</div>

              {result.bottleneck && (
                <div className="result-block">
                  <span>YOUR BOTTLENECK</span>
                  <h3>{result.bottleneck}</h3>
                </div>
              )}

              {result.next_moves && (
                <div className="result-block">
                  <span>NEXT MOVES</span>

                  <div className="moves-list">
                    {result.next_moves.map((move, index) => (
                      <div className="move-item" key={index}>
                        <b>{String(index + 1).padStart(2, "0")}</b>
                        <p>{move}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.focus && (
                <div className="result-block">
                  <span>30-DAY FOCUS</span>
                  <h3>{result.focus}</h3>
                </div>
              )}

              {result.people_to_study && (
                <div className="result-block">
                  <span>PEOPLE TO STUDY</span>

                  <div className="study-list">
                    {result.people_to_study.map((person, index) => (
                      <span key={index}>{person}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* PATTERNS */}
        <section className="section patterns-section">
          <div className="section-header">
            <div>
              <div className="section-label">03 — PATTERNS</div>
              <h2>What keeps repeating.</h2>
            </div>
          </div>

          <div className="patterns-grid">
            {displayPatterns.slice(0, 8).map((item, index) => (
              <div className="pattern-card" key={index}>
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>
                  {item.pattern || item.name || "Pattern"}
                </h3>

                <p>
                  {item.people_count || 0} people studied
                </p>

                <small>
                  {item.evidence_strength || "Research signal"}
                </small>
              </div>
            ))}
          </div>
        </section>

        {/* WEALTH */}
        <section id="wealth" className="section wealth-section">
          <div className="section-label">04 — WEALTH</div>

          <h2>
            Build earning power.
            <br />
            <span>Then protect it.</span>
          </h2>

          <div className="wealth-grid">
            <div className="wealth-score">
              <span>YOUR CURRENT SCORE</span>
              <strong>{wealthScore}</strong>
              <small>/ 100</small>
            </div>

            <div className="wealth-principles">
              <div>
                <span>01</span>
                <h3>Increase earning power.</h3>
                <p>
                  Build skills that create more value in the market.
                </p>
              </div>

              <div>
                <span>02</span>
                <h3>Understand money.</h3>
                <p>
                  Learn cash flow, saving, investing and risk.
                </p>
              </div>

              <div>
                <span>03</span>
                <h3>Protect the downside.</h3>
                <p>
                  Don't take risks you cannot recover from.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LEVEL UP */}
        <section id="level" className="section level-section">
          <div className="section-label">05 — LEVEL UP</div>

          <h2>
            Your life is
            <br />
            <span>an operating system.</span>
          </h2>

          <div className="level-grid">
            <div>
              <span>THINKING</span>
              <strong>01</strong>
            </div>

            <div>
              <span>CAREER</span>
              <strong>02</strong>
            </div>

            <div>
              <span>MONEY</span>
              <strong>03</strong>
            </div>

            <div>
              <span>COMMUNICATION</span>
              <strong>04</strong>
            </div>

            <div>
              <span>DISCIPLINE</span>
              <strong>05</strong>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="section-label">BUILT FOR YOUR NEXT MOVE</div>

          <h2>
            Stop consuming.
            <br />
            <span>Start upshifting.</span>
          </h2>

          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("move")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            START YOUR UPSHIFT →
          </button>
        </section>
      </main>

      <footer>
        <div>UPSHIFT © 2026</div>
        <div>PERSONAL INTELLIGENCE</div>
      </footer>
    </div>
  );
}

export default App;