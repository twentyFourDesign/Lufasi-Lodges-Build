import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

export default function ComingSoonPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #faf9f7;
          --warm-white: #ffffff;
          --ink: #1a1814;
          --muted: #8a8480;
          --accent: #b5956a;
          --accent-light: #d4b896;
          --divider: #e8e4de;
        }

        .page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Jost', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 3rem 2rem;
        }

        /* Subtle background texture */
        .page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(181,149,106,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 90%, rgba(181,149,106,0.05) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Thin decorative lines */
        .line-left, .line-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--divider) 20%, var(--divider) 80%, transparent);
          opacity: 0.6;
        }
        .line-left { left: 7%; }
        .line-right { right: 7%; }

        .container {
          position: relative;
          max-width: 680px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2.5rem;
          animation-delay: 0.1s;
        }

        .eyebrow-line {
          width: 28px;
          height: 1px;
          background: var(--accent);
          opacity: 0.8;
        }

        .eyebrow-text {
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          font-size: 0.82rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(4rem, 11vw, 7rem);
          line-height: 1.05;
          color: var(--ink);
          letter-spacing: -0.01em;
          margin-bottom: 0.2rem;
        }

        .brand-logo {
          width: min(320px, 68vw);
          height: auto;
          margin: 0 auto 0.6rem;
          display: block;
          object-fit: contain;
        }

        .brand em {
          font-style: italic;
          color: var(--accent);
        }

        .brand-sub {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          font-size: 0.92rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 3rem;
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .divider-ornament span {
          height: 1px;
          width: 48px;
          background: var(--divider);
        }

        .diamond {
          width: 5px;
          height: 5px;
          background: var(--accent);
          transform: rotate(45deg);
          opacity: 0.7;
        }

        .tagline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(1.6rem, 4vw, 2.1rem);
          color: var(--ink);
          line-height: 1.55;
          margin-bottom: 1.5rem;
          opacity: 0.88;
        }

        .body {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          font-size: 1rem;
          color: var(--muted);
          line-height: 1.8;
          letter-spacing: 0.01em;
          max-width: 440px;
          margin: 0 auto 3.5rem;
        }

        .story {
          max-width: 620px;
          margin: 0 auto 3rem;
          border: 1px solid var(--divider);
          background: rgba(255, 255, 255, 0.72);
          padding: 1.35rem 1.35rem 1.5rem;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }

        .story-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.9rem;
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 0.65rem;
        }

        .story-copy {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          font-size: 0.98rem;
          color: var(--muted);
          line-height: 1.85;
          margin-bottom: 0.9rem;
        }

        .story-copy:last-child {
          margin-bottom: 0;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--divider);
          border-radius: 2px;
          padding: 0.65rem 1.4rem;
          background: var(--warm-white);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .status-text {
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          font-size: 0.85rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .footer-note {
          position: absolute;
          bottom: 2.2rem;
          left: 0;
          right: 0;
          text-align: center;
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          color: #c0bbb5;
        }

        @media (max-width: 520px) {
          .line-left, .line-right { display: none; }
        }
      `}</style>

      <div className="page">
        <div className="line-left" />
        <div className="line-right" />

        <div className={`container ${mounted ? "visible" : ""}`}>
          <div className="eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">A new experience awaits</span>
            <div className="eyebrow-line" />
          </div>

          <img src={logo} alt="Lufasi Lodges" className="brand-logo" />
          <p className="brand-sub">Nature · Retreat · Sanctuary</p>

          <div className="divider-ornament">
            <span />
            <div className="diamond" />
            <span />
          </div>

          <p className="tagline">
            We are crafting something<br />beautiful for you.

          </p>

          <section className="story">
            <h2 className="story-title">Wake Up Wild</h2>
            <p className="story-copy">
              Wake up to birdsong, filtered sunlight, and the gentle stillness
              of the forest.
            </p>
            <p className="story-copy">
              At Lufasi Lodges, Wake Up Wild is more than a strap line - it is
              an invitation to return to a slower, more natural rhythm of
              living.
            </p>
            <p className="story-copy">
              Immerse yourself in a beautiful, tranquil environment surrounded
              by trees, with uninterrupted views of a 20-acre protected
              forest. Nature is not something you visit here - it surrounds
              you, holds you, and quietly resets you.
            </p>
          </section>

          <div className="status-pill">
            <div className="dot" />
            <span className="status-text">Coming Soon</span>
          </div>
        </div>

        <p className="footer-note">© Lufasi Lodges — All rights reserved</p>
      </div>
    </>
  );
}