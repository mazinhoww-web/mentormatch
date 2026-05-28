import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Users, Building2, ArrowRight, Check,
  Star, Zap, Shield, ChevronRight
} from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Modern Dark Cinema + Glass)
   ───────────────────────────────────────────── */
const T = {
  bgDeep:     "#08080d",
  bgBase:     "#0d0d14",
  bgElevated: "#13131e",
  surface:    "rgba(255,255,255,0.04)",
  glass:      "rgba(255,255,255,0.07)",
  border:     "rgba(255,255,255,0.07)",
  borderAccent:"rgba(99,102,241,0.35)",
  accent:     "#4F46E5",
  accentAlt:  "#6366F1",
  accentGlow: "rgba(79,70,229,0.28)",
  green:      "#10B981",
  greenGlow:  "rgba(16,185,129,0.2)",
  text:       "#EDEDEF",
  textMuted:  "#6B7280",
  textSub:    "#9CA3AF",
  radius:     "14px",
  radiusSm:   "8px",
};

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ───────────────────────────────────────────── */
function useCounter(target, duration, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return val;
}

/* ─────────────────────────────────────────────
   MATCH CARD PREVIEW (animated hero element)
   ───────────────────────────────────────────── */
function MatchPreview() {
  const [phase, setPhase] = useState(0);
  // 0 = idle, 1 = connecting, 2 = matched

  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      setTimeout(() => setPhase(1), 1200);
      setTimeout(() => setPhase(2), 2800);
      setTimeout(() => cycle(), 5200);
    };
    const t = setTimeout(() => cycle(), 600);
    return () => clearTimeout(t);
  }, []);

  const offset = phase === 2 ? 68 : phase === 1 ? 36 : 0;
  const lineW  = phase === 2 ? 24 : phase === 1 ? 14 : 0;

  const Card = ({ side, initials, name, role, tags, color }) => (
    <div style={{
      position: "absolute",
      [side]: 0,
      transition: "transform 0.65s cubic-bezier(0.16,1,0.3,1)",
      transform: side === "left"
        ? `translateX(${offset}px)`
        : `translateX(-${offset}px)`,
      background: T.glass,
      backdropFilter: "blur(16px)",
      border: `1px solid ${phase === 2 ? "rgba(16,185,129,0.25)" : T.border}`,
      borderRadius: 16,
      padding: "18px 20px",
      width: 158,
      boxShadow: phase === 2 ? `0 0 24px ${T.greenGlow}` : "none",
      transition: "box-shadow 0.4s ease, border-color 0.4s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontWeight: 700, fontSize: 14, color: "#fff" }}>
        {initials}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{name}</div>
      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{role}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
        {tags.map(t => (
          <span key={t} style={{ background: `${color[0]}22`, color: `${color[0]}CC`, fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "radial-gradient(ellipse at center, rgba(79,70,229,0.1) 0%, transparent 70%)" }} />

      <Card side="left"  initials="AM" name="Ana Mentor" role="Product Manager" tags={["PM","UX","Estratégia"]} color={["#6366F1","#4F46E5"]} />
      <Card side="right" initials="CM" name="Carlos Dev"  role="Dev Júnior"      tags={["React","Node"]}        color={["#8B5CF6","#7C3AED"]} />

      {/* Connection node */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ width: lineW, height: 2, background: phase === 2 ? T.green : T.accentAlt, borderRadius: 2, transition: "all 0.45s ease" }} />
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: phase === 2 ? T.greenGlow : "rgba(99,102,241,0.15)",
          border: `2px solid ${phase === 2 ? T.green : T.accentAlt}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.4s ease",
          transform: phase === 2 ? "scale(1.2)" : "scale(1)",
          opacity: phase === 0 ? 0.3 : 1,
          boxShadow: phase === 2 ? `0 0 16px ${T.greenGlow}` : "none",
        }}>
          {phase === 2
            ? <Check size={14} color={T.green} />
            : <Zap size={14} color={T.accentAlt} />}
        </div>
        <div style={{ width: lineW, height: 2, background: phase === 2 ? T.green : T.accentAlt, borderRadius: 2, transition: "all 0.45s ease" }} />
      </div>

      {/* Match pill */}
      <div style={{
        position: "absolute", bottom: -8, left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 20, padding: "4px 14px",
        fontSize: 11, fontWeight: 600, color: T.green,
        whiteSpace: "nowrap",
        opacity: phase === 2 ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        Match realizado
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export default function MentorMatchLanding() {
  const [countersOn, setCountersOn] = useState(false);
  const trustRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  const mentorias  = useCounter(2400, 1800, countersOn);
  const satisfacao = useCounter(98,   1400, countersOn);
  const empresas   = useCounter(50,   1600, countersOn);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCountersOn(true); }, { threshold: 0.4 });
    if (trustRef.current) io.observe(trustRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: <Users size={22} />,     title: "Matching Inteligente",    desc: "Algoritmo que conecta por habilidades, objetivos e disponibilidade real — sem matching manual." },
    { icon: <BookOpen size={22} />,  title: "Biblioteca de Materiais", desc: "Compartilhe artigos, PDFs e recursos diretamente na plataforma, organizados por tema." },
    { icon: <Building2 size={22} />, title: "White-Label Multitenant",  desc: "Cada empresa tem seu programa próprio com subdomain, cores e logo 100% personalizados." },
  ];

  const steps = [
    { n: "01", title: "Configure sua empresa",   desc: "Subdomain, logo e brand colors prontos em 5 minutos.", icon: <Building2 size={18} /> },
    { n: "02", title: "Convide as pessoas",      desc: "Mentores e mentorados entram pelo link da sua empresa.", icon: <Users size={18} /> },
    { n: "03", title: "Acompanhe o impacto",     desc: "Sessões, progresso e métricas de desenvolvimento em tempo real.", icon: <Star size={18} /> },
  ];

  const planItems = ["Até 50 usuários","Até 10 mentores","500 MB de biblioteca","Notificações por e-mail","Dashboard completo","Gestão de habilidades"];

  return (
    <div style={{ background: T.bgDeep, minHeight: "100vh", color: T.text, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ── Global Styles ── */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes auroraA { 0%,100%{transform:translate(0,0) scale(1); opacity:.5} 50%{transform:translate(30px,-20px) scale(1.08); opacity:.8} }
        @keyframes auroraB { 0%,100%{transform:translate(0,0) scale(1); opacity:.4} 50%{transform:translate(-20px,30px) scale(1.06); opacity:.7} }
        @keyframes auroraC { 0%,100%{transform:translate(0,0) scale(1); opacity:.3} 50%{transform:translate(20px,15px) scale(1.1); opacity:.6} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .fade-up { animation: fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) both }
        .fade-up-2 { animation: fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both }
        .fade-up-3 { animation: fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both }
        .glass-card { background:${T.glass}; backdrop-filter:blur(14px); border:1px solid ${T.border}; border-radius:${T.radius}; transition:transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease }
        .glass-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(79,70,229,0.12); border-color:${T.borderAccent} }
        .btn-primary { background:linear-gradient(135deg,${T.accent},${T.accentAlt}); border:none; color:#fff; border-radius:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:transform 0.18s ease, box-shadow 0.18s ease; font-family:inherit }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 28px ${T.accentGlow} }
        .btn-ghost { background:transparent; border:1px solid ${T.border}; color:${T.text}; border-radius:12px; font-weight:500; cursor:pointer; transition:border-color 0.18s ease, background 0.18s ease; font-family:inherit }
        .btn-ghost:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.04) }
        .step-card { background:${T.surface}; border:1px solid ${T.border}; border-radius:${T.radius}; padding:28px; position:relative; overflow:hidden; transition:transform 0.22s ease, border-color 0.22s ease }
        .step-card:hover { transform:translateY(-3px); border-color:${T.borderAccent} }
        .section-label { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:${T.accentAlt}; margin-bottom:12px }
        .section-title { font-size:34px; font-weight:800; letter-spacing:-0.025em; line-height:1.15 }
      `}</style>

      {/* ── Aurora Background ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-15%", left:"-5%",  width:"55%", height:"55%", borderRadius:"50%", background:"radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 65%)", animation:"auroraA 14s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-5%", right:"-8%", width:"45%", height:"45%", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)", animation:"auroraB 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"45%",   left:"40%",  width:"35%", height:"35%", borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)", animation:"auroraC 22s ease-in-out infinite" }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        backdropFilter:"blur(24px)",
        background: scrolled ? "rgba(8,8,13,0.9)" : "rgba(8,8,13,0.6)",
        borderBottom:`1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "transparent"}`,
        padding:"0 40px", height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"background 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${T.accent}, ${T.accentAlt})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${T.accentGlow}` }}>
            <BookOpen size={15} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.01em" }}>MentorMatch</span>
          <span style={{ background:"rgba(99,102,241,0.12)", border:`1px solid rgba(99,102,241,0.28)`, color:"#A5B4FC", fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20, letterSpacing:"0.06em" }}>WHITE-LABEL</span>
        </div>
        <button className="btn-primary" style={{ padding:"10px 22px", fontSize:13 }}>
          Ir para o Dashboard <ArrowRight size={13} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1160, margin:"0 auto", padding:"88px 40px 64px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>

        {/* Left */}
        <div className="fade-up">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,0.1)", border:`1px solid rgba(99,102,241,0.22)`, borderRadius:20, padding:"6px 14px", marginBottom:28 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow:`0 0 8px ${T.green}` }} />
            <span style={{ fontSize:12, color:"#A5B4FC", fontWeight:500 }}>50+ empresas ativas na plataforma</span>
          </div>

          <h1 style={{ fontSize:54, fontWeight:900, lineHeight:1.08, letterSpacing:"-0.03em", marginBottom:20 }}>
            Conecte{" "}
            <span style={{ background:`linear-gradient(135deg, ${T.accentAlt}, #A78BFA, #C4B5FD)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>mentores</span>
            {" "}e{" "}
            <span style={{ background:`linear-gradient(135deg, ${T.accentAlt}, #A78BFA, #C4B5FD)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>mentorados</span>
          </h1>

          <p style={{ fontSize:17, color:T.textSub, lineHeight:1.7, marginBottom:36, maxWidth:440 }}>
            Plataforma white-label de mentoria empresarial. Crie programas internos com matching inteligente para sua empresa em minutos.
          </p>

          <div style={{ display:"flex", gap:12, marginBottom:40 }}>
            <button className="btn-primary" style={{ padding:"14px 28px", fontSize:15, boxShadow:`0 8px 28px ${T.accentGlow}` }}>
              Começar Grátis <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" style={{ padding:"14px 28px", fontSize:15 }}>
              Ver Demo
            </button>
          </div>

          {/* Social proof avatars */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex" }}>
              {["AM","JB","CL","RS","FT"].map((init, i) => (
                <div key={init} style={{
                  width:30, height:30, borderRadius:"50%",
                  background:`linear-gradient(135deg, hsl(${230+i*18},65%,52%), hsl(${250+i*18},65%,48%))`,
                  border:`2px solid ${T.bgDeep}`,
                  marginLeft: i > 0 ? -9 : 0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color:"#fff",
                }}>
                  {init}
                </div>
              ))}
            </div>
            <span style={{ fontSize:13, color:T.textMuted }}>
              <span style={{ color:"#D1D5DB", fontWeight:600 }}>2.400+</span> mentorias realizadas
            </span>
          </div>
        </div>

        {/* Right: Animated Match Preview */}
        <div className="fade-up-2" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
          <div style={{ position:"relative", padding:"48px 24px 32px", width:"100%" }}>
            <MatchPreview />
            <div style={{ position:"absolute", top:12, right:12, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:12, padding:"7px 13px", backdropFilter:"blur(12px)" }}>
              <span style={{ fontSize:11, color:T.green, fontWeight:600 }}>98% satisfação</span>
            </div>
            <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(99,102,241,0.1)", border:`1px solid rgba(99,102,241,0.25)`, borderRadius:12, padding:"7px 13px", backdropFilter:"blur(12px)" }}>
              <span style={{ fontSize:11, color:"#A5B4FC", fontWeight:600 }}>Setup em 5 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div ref={trustRef} style={{ position:"relative", zIndex:1, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, background:"rgba(255,255,255,0.018)", padding:"36px 40px" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", justifyContent:"space-around", alignItems:"center", flexWrap:"wrap", gap:28 }}>
          {[
            { val:mentorias,  suf:"+", lbl:"Mentorias realizadas" },
            { val:satisfacao, suf:"%", lbl:"Satisfação dos usuários" },
            { val:empresas,   suf:"+", lbl:"Empresas ativas" },
          ].map(({ val, suf, lbl }) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, fontWeight:900, letterSpacing:"-0.03em", background:`linear-gradient(135deg, ${T.accentAlt}, #A78BFA)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>
                {val}{suf}
              </div>
              <div style={{ fontSize:12, color:T.textMuted, marginTop:5 }}>{lbl}</div>
            </div>
          ))}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Avaliação média</div>
            <div style={{ display:"flex", gap:3, justifyContent:"center" }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={15} fill={i <= 5 ? "#F59E0B" : "none"} color={i <= 5 ? "#F59E0B" : "#374151"} />)}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#D1D5DB", marginTop:4 }}>4.9 / 5.0</div>
          </div>
        </div>
      </div>

      {/* ── How it Works ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1160, margin:"0 auto", padding:"88px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:60 }} className="fade-up">
          <div className="section-label">Como funciona</div>
          <h2 className="section-title">Pronto em 3 passos</h2>
          <p style={{ fontSize:16, color:T.textMuted, marginTop:12 }}>Do cadastro ao primeiro match em minutos</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
          {steps.map(({ n, title, desc, icon }, i) => (
            <div key={n} className="step-card" style={{ animationDelay:`${i*0.12}s` }}>
              <div style={{ position:"absolute", top:16, right:20, fontSize:52, fontWeight:900, color:"rgba(255,255,255,0.025)", lineHeight:1, userSelect:"none" }}>{n}</div>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(99,102,241,0.14)", border:`1px solid rgba(99,102,241,0.22)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#818CF8", marginBottom:18 }}>
                {icon}
              </div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8, color:T.text }}>{title}</div>
              <div style={{ fontSize:14, color:T.textMuted, lineHeight:1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1160, margin:"0 auto", padding:"0 40px 88px" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <div className="section-label">Recursos</div>
          <h2 className="section-title">Tudo que seu programa precisa</h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding:28 }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`linear-gradient(135deg, rgba(79,70,229,0.18), rgba(99,102,241,0.1))`, border:`1px solid rgba(99,102,241,0.2)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#818CF8", marginBottom:20 }}>
                {icon}
              </div>
              <div style={{ fontWeight:700, fontSize:17, marginBottom:10, color:T.text }}>{title}</div>
              <div style={{ fontSize:14, color:T.textMuted, lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", padding:"0 40px 88px", textAlign:"center" }}>
        <div className="section-label" style={{ textAlign:"center" }}>Planos</div>
        <h2 className="section-title" style={{ textAlign:"center", marginBottom:44 }}>Comece sem risco</h2>

        <div style={{ position:"relative", background:T.glass, backdropFilter:"blur(20px)", border:`1px solid ${T.borderAccent}`, borderRadius:20, padding:"40px 36px 32px", boxShadow:`0 0 60px rgba(79,70,229,0.12)` }}>
          {/* Top ribbon */}
          <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${T.accent},${T.accentAlt})`, borderRadius:"0 0 10px 10px", padding:"5px 18px", fontSize:10, fontWeight:700, color:"#fff", letterSpacing:"0.08em" }}>
            MAIS POPULAR
          </div>

          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:6 }}>Plano Free</div>
            <div style={{ fontSize:52, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1 }}>R$ 0</div>
            <div style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>Para começar sem compromisso</div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:28, textAlign:"left" }}>
            {planItems.map(item => (
              <div key={item} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Check size={11} color={T.green} />
                </div>
                <span style={{ fontSize:14, color:"#D1D5DB" }}>{item}</span>
              </div>
            ))}
          </div>

          <button className="btn-primary" style={{ width:"100%", padding:"14px", fontSize:15, justifyContent:"center", boxShadow:`0 10px 32px ${T.accentGlow}` }}>
            Começar Agora <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position:"relative", zIndex:1, maxWidth:1160, margin:"0 auto", padding:"0 40px 88px" }}>
        <div style={{ background:`linear-gradient(135deg, rgba(79,70,229,0.12), rgba(139,92,246,0.08))`, border:`1px solid ${T.borderAccent}`, borderRadius:20, padding:"56px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"80%", height:"80%", borderRadius:"50%", background:`radial-gradient(circle, rgba(79,70,229,0.1), transparent)`, pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-0.025em", marginBottom:14 }}>
              Pronto para transformar sua empresa?
            </h2>
            <p style={{ fontSize:16, color:T.textMuted, marginBottom:32, maxWidth:460, margin:"0 auto 32px" }}>
              Configure seu programa de mentoria em minutos e comece a conectar talentos hoje.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button className="btn-primary" style={{ padding:"14px 32px", fontSize:15, boxShadow:`0 10px 32px ${T.accentGlow}` }}>
                Criar Programa Grátis <ArrowRight size={16} />
              </button>
              <button className="btn-ghost" style={{ padding:"14px 28px", fontSize:15 }}>
                Falar com especialista
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position:"relative", zIndex:1, borderTop:`1px solid ${T.border}`, padding:"24px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:`linear-gradient(135deg,${T.accent},${T.accentAlt})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <BookOpen size={11} color="#fff" />
          </div>
          <span style={{ fontWeight:700, fontSize:14 }}>MentorMatch</span>
        </div>
        <span style={{ fontSize:12, color:T.textMuted }}>© 2026 MentorMatch. Todos os direitos reservados.</span>
      </footer>

    </div>
  );
}
