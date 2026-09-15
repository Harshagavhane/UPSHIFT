import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "https://upshift.onrender.com";

const initialProfile = {
  age: 20,
  savings: 0,
  monthlyIncome: 0,
  skills: "",
  goal: "Get a high-paying AI job",
  hoursPerDay: 2,
  risk: "Medium",
};

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [people, setPeople] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    loadResearch();
  }, []);

  async function loadResearch() {
    try {
      const [peopleRes, patternRes] = await Promise.all([
        fetch(`${API}/people`),
        fetch(`${API}/patterns`),
      ]);

      if (peopleRes.ok) {
        const data = await peopleRes.json();
        setPeople(Array.isArray(data) ? data : data.people || []);
      }

      if (patternRes.ok) {
        const data = await patternRes.json();
        setPatterns(
          Array.isArray(data) ? data : data.patterns || []
        );
      }
    } catch (error) {
      console.error("Research loading error:", error);
    } finally {
      setDataLoading(false);
    }
  }

  function updateProfile(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const wealthScore = useMemo(() => {
    const savings = Number(profile.savings) || 0;
    const income = Number(profile.monthlyIncome) || 0;
    const hours = Number(profile.hoursPerDay) || 0;

    let score = 20;

    score += Math.min(savings / 5000, 20);
    score += Math.min(income / 5000, 25);
    score += Math.min(hours * 4, 20);

    if (profile.skills.trim()) score += 15;

    return Math.min(Math.round(score), 100);
  }, [profile]);

  const levelScore = useMemo(() => {
    const base = wealthScore;

    return {
      thinking: Math.min(base + 5, 100),
      career: Math.min(base + 2, 100),
      money: Math.min(base, 100),
      communication: Math.max(base - 5, 0),
      discipline: Math.min(base + 8, 100),
    };
  }, [wealthScore]);

  async function requestRecommendation(endpoint) {
    let response = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile,
      }),
    });

    if (response.status === 422) {
      response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async function findMove() {
    setLoading(true);
    setResult(null);

    try {
      let data;

      try {
        data = await requestRecommendation("/ai-recommend");
      } catch {
        data = await requestRecommendation("/recommend");
      }

      const cleanResult = data?.result || data;

      setResult(cleanResult);
      setTimeout(() => scrollToSection("result"), 300);
    } catch (error) {
      console.error(error);

      setResult({
        title: "Your next move starts with clarity.",
        bottleneck:
          "The AI engine is temporarily unavailable. Your profile is ready.",
        recommendation:
          "Build one valuable skill deeply instead of trying to learn everything at once.",
        plan: [
          "Choose one high-value skill.",
          "Practice it every day.",
          "Build one public project.",
          "Use that project to apply for opportunities.",
        ],
      });

      setTimeout(() => scrollToSection("result"), 300);
    } finally {
      setLoading(false);
    }
  }

  async function loadRazorpay() {
    if (window.Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function unlockPremium() {
    if (isPremium || paymentLoading) return;

    setPaymentLoading(true);

    try {
      const response = await fetch(`${API}/create-payment-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 49,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment order creation failed");
      }

      const order = await response.json();

      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Razorpay failed to load");
      }

      const razorpayKey =
        order.key_id ||
        order.key ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        alert(
          "Razorpay public key missing. Add VITE_RAZORPAY_KEY_ID in Vercel."
        );
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "UPSHIFT",
        description: "UPSHIFT Premium Intelligence",
        order_id: order.id,

        theme: {
          color: "#d4af37",
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API}/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payment_id: paymentResponse.razorpay_payment_id,
                  order_id: paymentResponse.razorpay_order_id,
                  signature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const verified = await verifyResponse.json();

            if (verifyResponse.ok && verified.success !== false) {
              setIsPremium(true);
              alert("UPSHIFT Premium unlocked.");
              scrollToSection("result");
            } else {
              alert("Payment verification failed.");
            }
          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const payment = new window.Razorpay(options);

      payment.on("payment.failed", function (response) {
        console.error(response);
        alert("Payment failed. Please try again.");
      });

      payment.open();
    } catch (error) {
      console.error(error);
      alert("Unable to start payment right now.");
    } finally {
      setPaymentLoading(false);
    }
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function personName(person) {
    return (
      person?.person ||
      person?.name ||
      person?.full_name ||
      "Unknown"
    );
  }

  function patternName(pattern) {
    return (
      pattern?.pattern ||
      pattern?.name ||
      pattern?.title ||
      "Untitled Pattern"
    );
  }

  function getResultValue(...values) {
    return values.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );
  }

  function renderPlan(plan) {
    if (Array.isArray(plan)) {
      return plan.map((item, index) => (
        <div className="plan-item" key={index}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{typeof item === "string" ? item : JSON.stringify(item)}</p>
        </div>
      ));
    }

    if (typeof plan === "string") {
      return (
        <div className="result-copy">
          {plan}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="upshift">

      {/* NAVBAR */}
      <nav className="navbar">
        <button
          className="brand"
          onClick={() => scrollToSection("home")}
        >
          UPSHIFT<span>®</span>
        </button>

        <div className="nav-links">
          <button onClick={() => scrollToSection("greats")}>
            GREAT MINDS
          </button>

          <button onClick={() => scrollToSection("move")}>
            NEXT MOVE
          </button>

          <button onClick={() => scrollToSection("wealth")}>
            WEALTH
          </button>

          <button onClick={() => scrollToSection("level")}>
            LEVEL UP
          </button>
        </div>

        <button
          className="nav-cta"
          onClick={() => scrollToSection("move")}
        >
          FIND MY MOVE
        </button>
      </nav>

      {/* HERO */}
      <main id="home">

        <section className="hero section">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" />
              PERSONAL INTELLIGENCE SYSTEM
            </div>

            <h1>
              Become
              <br />
              <em>harder</em> to ignore.
            </h1>

            <p className="hero-description">
              An AI built from the experiences, decisions and
              principles of extraordinary people.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => scrollToSection("move")}
              >
                START YOUR UPSHIFT
                <span>↗</span>
              </button>

              <button
                className="text-btn"
                onClick={() => scrollToSection("greats")}
              >
                EXPLORE THE RESEARCH
              </button>
            </div>
          </div>

          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="floating-card card-one">
            <small>RESEARCH</small>
            <strong>1,000+</strong>
            <span>MINDS</span>
          </div>

          <div className="floating-card card-two">
            <small>PATTERNS</small>
            <strong>∞</strong>
            <span>EXPERIENCES</span>
          </div>

          <div className="scroll-indicator">
            <span />
            SCROLL TO EVOLVE
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="manifesto section">
          <div className="section-label">
            <span>01</span>
            THE IDEA
          </div>

          <div className="manifesto-content">
            <h2>
              Success leaves
              <br />
              <span>patterns.</span>
            </h2>

            <p>
              We study decisions, failures, businesses,
              careers, communication and wealth-building
              across extraordinary people — then turn
              repeated patterns into useful intelligence
              for your next move.
            </p>
          </div>

          <div className="process-line">
            <div>
              <span>01</span>
              PEOPLE
            </div>

            <i />

            <div>
              <span>02</span>
              EXPERIENCES
            </div>

            <i />

            <div>
              <span>03</span>
              PATTERNS
            </div>

            <i />

            <div>
              <span>04</span>
              YOUR MOVE
            </div>
          </div>
        </section>

        {/* GREAT MINDS */}
        <section id="greats" className="greats section">
          <div className="section-heading">
            <div className="section-label">
              <span>02</span>
              STUDY THE GREATS
            </div>

            <div>
              <h2>
                Borrow the
                <br />
                <em>thinking.</em>
              </h2>

              <p>
                Not their lifestyle. Not their luck.
                <br />
                Their decision-making.
              </p>
            </div>
          </div>

          <div className="people-grid">
            {dataLoading ? (
              <>
                {[1, 2, 3, 4].map((item) => (
                  <div className="person-card skeleton" key={item} />
                ))}
              </>
            ) : (
              people.slice(0, 8).map((person, index) => (
                <div className="person-card" key={person.id || index}>
                  <span className="person-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3>{personName(person)}</h3>

                    <p>
                      {person.category ||
                        person.role ||
                        "Extraordinary mind"}
                    </p>
                  </div>

                  <span className="arrow">↗</span>
                </div>
              ))
            )}
          </div>

          <div className="research-counter">
            <strong>1,000+</strong>
            <span>minds is the research target.</span>
          </div>
        </section>

        {/* NEXT MOVE */}
        <section id="move" className="move section">
          <div className="section-label">
            <span>03</span>
            YOUR NEXT MOVE
          </div>

          <div className="move-layout">
            <div className="move-intro">
              <h2>
                If I were
                <br />
                <em>in your position.</em>
              </h2>

              <p>
                Tell UPSHIFT where you are.
                We'll identify the bottleneck,
                connect it to proven patterns and
                give you a move you can actually execute.
              </p>

              <div className="move-note">
                <span>AI</span>
                PERSONALIZED DECISION ENGINE
              </div>
            </div>

            <div className="profile-panel">

              <div className="panel-top">
                <span>YOUR CURRENT POSITION</span>
                <span>01 / 04</span>
              </div>

              <div className="form-grid">

                <label>
                  <span>AGE</span>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      updateProfile("age", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>MONTHLY INCOME ₹</span>
                  <input
                    type="number"
                    value={profile.monthlyIncome}
                    onChange={(e) =>
                      updateProfile(
                        "monthlyIncome",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>SAVINGS ₹</span>
                  <input
                    type="number"
                    value={profile.savings}
                    onChange={(e) =>
                      updateProfile("savings", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>HOURS / DAY</span>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={profile.hoursPerDay}
                    onChange={(e) =>
                      updateProfile(
                        "hoursPerDay",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label className="full">
                  <span>YOUR STRONGEST SKILLS</span>
                  <input
                    type="text"
                    placeholder="e.g. communication, coding, sales..."
                    value={profile.skills}
                    onChange={(e) =>
                      updateProfile("skills", e.target.value)
                    }
                  />
                </label>

                <label className="full">
                  <span>WHAT DO YOU WANT?</span>
                  <select
                    value={profile.goal}
                    onChange={(e) =>
                      updateProfile("goal", e.target.value)
                    }
                  >
                    <option>
                      Get a high-paying AI job
                    </option>
                    <option>
                      Build a profitable business
                    </option>
                    <option>
                      Increase my income
                    </option>
                    <option>
                      Become financially independent
                    </option>
                    <option>
                      Improve communication
                    </option>
                    <option>
                      Build discipline and consistency
                    </option>
                  </select>
                </label>

              </div>

              <button
                className="generate-btn"
                onClick={findMove}
                disabled={loading}
              >
                {loading
                  ? "ANALYZING YOUR POSITION..."
                  : "FIND MY NEXT MOVE"}
                <span>↗</span>
              </button>
            </div>
          </div>
        </section>

        {/* RESULT */}
        {result && (
          <section id="result" className="result section">

            <div className="section-label">
              <span>04</span>
              YOUR INTELLIGENCE REPORT
            </div>

            <div className="result-header">
              <h2>
                {getResultValue(
                  result.title,
                  result.headline,
                  result.next_move,
                  "Your next move."
                )}
              </h2>

              <span className="result-status">
                AI ANALYSIS COMPLETE
              </span>
            </div>

            <div className="result-grid">

              <div className="result-card bottleneck">
                <small>THE BOTTLENECK</small>

                <h3>
                  {getResultValue(
                    result.bottleneck,
                    result.problem,
                    "Your biggest constraint is the gap between intention and execution."
                  )}
                </h3>
              </div>

              <div className="result-card recommendation">
                <small>THE MOVE</small>

                <h3>
                  {getResultValue(
                    result.move,
                    result.recommendation,
                    result.next_move,
                    "Build one valuable skill deeply and create visible proof of it."
                  )}
                </h3>
              </div>

              <div className="result-card plan-card">
                <div className="premium-lock">

                  <div>
                    <small>30-DAY ACTION PLAN</small>
                    <h3>
                      Stop collecting information.
                      Start executing.
                    </h3>
                  </div>

                  {!isPremium && (
                    <div className="lock-overlay">
                      <span>✦</span>
                      PREMIUM
                    </div>
                  )}

                </div>

                {isPremium ? (
                  renderPlan(
                    getResultValue(
                      result.plan,
                      result.action_plan,
                      result.steps
                    )
                  )
                ) : (
                  <div className="locked-plan">
                    <div />
                    <div />
                    <div />
                  </div>
                )}

                {!isPremium && (
                  <button
                    className="unlock-btn"
                    onClick={unlockPremium}
                    disabled={paymentLoading}
                  >
                    {paymentLoading
                      ? "OPENING CHECKOUT..."
                      : "UNLOCK FOR ₹49"}
                    <span>↗</span>
                  </button>
                )}
              </div>

              <div className="result-card reasoning-card">
                <small>WHY THIS MOVE</small>

                <p>
                  {getResultValue(
                    result.reasoning,
                    result.why,
                    result.explanation,
                    "UPSHIFT connects your current position with repeated patterns found across extraordinary people."
                  )}
                </p>
              </div>

            </div>
          </section>
        )}

        {/* WEALTH */}
        <section id="wealth" className="wealth section">

          <div className="section-label">
            <span>05</span>
            WEALTH
          </div>

          <div className="wealth-header">
            <div>
              <h2>
                Build the
                <br />
                <em>engine.</em>
              </h2>
            </div>

            <p>
              Wealth isn't only money.
              It's earning power, knowledge,
              optionality and control over your time.
            </p>
          </div>

          <div className="wealth-dashboard">

            <div className="wealth-score">

              <div className="score-ring">
                <div>
                  <strong>{wealthScore}</strong>
                  <span>/ 100</span>
                </div>
              </div>

              <small>YOUR WEALTH FOUNDATION</small>

              <p>
                Keep increasing your earning power
                before optimizing small expenses.
              </p>

            </div>

            <div className="wealth-metrics">

              <div className="metric">
                <span>01 / EARNING POWER</span>
                <div className="metric-bar">
                  <i
                    style={{
                      width: `${Math.min(
                        (Number(profile.monthlyIncome) / 50000) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="metric">
                <span>02 / CAPITAL</span>
                <div className="metric-bar">
                  <i
                    style={{
                      width: `${Math.min(
                        (Number(profile.savings) / 100000) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="metric">
                <span>03 / SKILL LEVERAGE</span>
                <div className="metric-bar">
                  <i
                    style={{
                      width: profile.skills ? "70%" : "15%",
                    }}
                  />
                </div>
              </div>

              <div className="metric">
                <span>04 / TIME INVESTMENT</span>
                <div className="metric-bar">
                  <i
                    style={{
                      width: `${Math.min(
                        (Number(profile.hoursPerDay) / 8) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PATTERNS */}
        <section className="patterns section">

          <div className="section-heading">
            <div className="section-label">
              <span>06</span>
              REPEATED PATTERNS
            </div>

            <div>
              <h2>
                What keeps
                <br />
                <em>showing up.</em>
              </h2>

              <p>
                Patterns become useful when they repeat
                across different people and contexts.
              </p>
            </div>
          </div>

          <div className="patterns-grid">

            {patterns.length > 0 ? (
              patterns.slice(0, 6).map((pattern, index) => (
                <div className="pattern-card" key={index}>
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{patternName(pattern)}</h3>

                  <p>
                    {pattern.evidence_strength ||
                      pattern.evidence ||
                      "Research signal"}
                  </p>

                  <div className="pattern-arrow">↗</div>
                </div>
              ))
            ) : (
              [
                "Think in systems",
                "Compound skills",
                "Protect attention",
                "Build distribution",
                "Take asymmetric bets",
                "Learn from failure",
              ].map((item, index) => (
                <div className="pattern-card" key={item}>
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{item}</h3>

                  <p>Research signal</p>

                  <div className="pattern-arrow">↗</div>
                </div>
              ))
            )}

          </div>
        </section>

        {/* LEVEL UP */}
        <section id="level" className="level section">

          <div className="section-label">
            <span>07</span>
            LEVEL UP
          </div>

          <div className="level-header">
            <h2>
              Your next
              <br />
              <em>version.</em>
            </h2>

            <p>
              A simple snapshot of the areas that
              determine your leverage.
            </p>
          </div>

          <div className="level-list">

            {Object.entries(levelScore).map(
              ([name, score], index) => (
                <div className="level-row" key={name}>

                  <span className="level-number">
                    0{index + 1}
                  </span>

                  <strong>
                    {name.toUpperCase()}
                  </strong>

                  <div className="level-bar">
                    <i
                      style={{
                        width: `${score}%`,
                      }}
                    />
                  </div>

                  <span className="level-score">
                    {score}
                  </span>

                </div>
              )
            )}

          </div>
        </section>

        {/* PREMIUM CTA */}
        <section className="final-cta section">

          <div className="final-orbit" />

          <div className="final-content">

            <span className="eyebrow">
              YOUR NEXT MOVE IS WAITING
            </span>

            <h2>
              Don't just
              <br />
              <em>know more.</em>
              <br />
              Become more.
            </h2>

            <button
              className="primary-btn large"
              onClick={() => scrollToSection("move")}
            >
              FIND MY NEXT MOVE
              <span>↗</span>
            </button>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-brand">
          UPSHIFT<span>®</span>
        </div>

        <p>
          Personal intelligence for your next level.
        </p>

        <span>
          © {new Date().getFullYear()} UPSHIFT
        </span>

      </footer>

    </div>
  );
}

export default App;