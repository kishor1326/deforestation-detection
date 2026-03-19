import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Satellite, Brain, Bell, BarChart3, ArrowRight, Globe, Zap, Eye, TreePine } from 'lucide-react';
import './LandingPage.css';

const features = [
  { icon: Satellite, title: 'Satellite Monitoring', desc: 'Multi-spectral satellite imagery analysis with 10m resolution covering all major forest regions globally.' },
  { icon: Brain, title: 'AI Detection Engine', desc: 'Deep learning models trained on 500K+ deforestation events achieve 97% detection accuracy in real-time.' },
  { icon: Bell, title: 'Instant Alerts', desc: 'Alert authorities within 2-4 hours of illegal activity with precise coordinates and severity assessment.' },
  { icon: BarChart3, title: 'Temporal Analysis', desc: 'Track forest cover changes over time with predictive modeling to identify at-risk zones before damage occurs.' },
];

const steps = [
  { num: '01', title: 'Capture', desc: 'Satellites capture multispectral imagery of monitored forest regions every 6 hours.', icon: Satellite },
  { num: '02', title: 'Analyze', desc: 'AI models compare temporal data to detect canopy loss, heat signatures, and land-use changes.', icon: Eye },
  { num: '03', title: 'Detect', desc: 'Anomalies are classified by severity and confidence score using ensemble neural networks.', icon: Zap },
  { num: '04', title: 'Alert', desc: 'Authorities receive geo-tagged alerts with actionable intelligence within hours of detection.', icon: Bell },
];

const stats = [
  { value: '2.4M', label: 'km² Monitored' },
  { value: '97%', label: 'Detection Accuracy' },
  { value: '<3hrs', label: 'Alert Response' },
  { value: '45+', label: 'Countries Covered' },
];

export default function LandingPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 83, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 200, 83, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <Shield size={30} />
            <span>ForestGuard</span>
          </Link>
          <nav className="landing-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stats">Impact</a>
          </nav>
          <Link to="/dashboard" className="btn-primary">
            Launch Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Globe size={14} />
            <span>Real-Time Global Forest Monitoring</span>
          </div>
          <h1>
            Protect Earth's Forests<br />
            <span className="hero-highlight">Before It's Too Late</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered deforestation detection using satellite imagery and temporal analysis.
            Alert authorities within hours of illegal activity — not weeks.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn-primary btn-lg">
              <TreePine size={20} />
              Enter Dashboard
            </Link>
            <a href="#how-it-works" className="btn-secondary btn-lg">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="globe-container">
            <div className="globe-ring ring-1"></div>
            <div className="globe-ring ring-2"></div>
            <div className="globe-ring ring-3"></div>
            <div className="globe-core">
              <Globe size={80} />
            </div>
            <div className="scan-line"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar" id="stats">
        {stats.map((s, i) => (
          <div key={i} className="stats-item animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="stats-value">{s.value}</div>
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Powerful Detection Capabilities</h2>
          <p>Advanced technology stack designed to protect the world's remaining forests</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="feature-icon">
                <f.icon size={28} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section" id="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>From satellite capture to authority alert in under 3 hours</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon-wrap">
                <s.icon size={24} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner glass-card">
          <h2>Ready to Protect Our Forests?</h2>
          <p>Start monitoring critical forest regions in real-time with our AI-powered platform.</p>
          <Link to="/dashboard" className="btn-primary btn-lg">
            Launch Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Shield size={24} />
            <span>ForestGuard</span>
          </div>
          <p>© 2026 ForestGuard. AI-Powered Deforestation Detection System.</p>
        </div>
      </footer>
    </div>
  );
}
