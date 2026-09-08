import Link from 'next/link'

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="auth-logo" href="/" aria-label="AmakTech Connect home">
          <span>AmakTech</span> <b>Connect</b>
        </Link>
        <div className="auth-heading">
          <p className="auth-kicker">AmakTech Connect</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
      <div className="auth-showcase" aria-hidden="true">
        <span className="showcase-mark">AT<span>S</span></span>
        <strong>AmakTech Connect</strong>
        <p>Transforming ideas into digital solutions.</p>
      </div>
      <style>{`
        .auth-page { min-height: 100vh; display: grid; grid-template-columns: minmax(420px, .9fr) 1.1fr; background: #f5f2f3; color: #080808; }
        .auth-panel { width: min(460px, calc(100% - 48px)); margin: auto; padding: 48px 0; }
        .auth-logo { display: inline-block; font-size: 29px; font-weight: 950; letter-spacing: -1.5px; margin-bottom: 70px; }
        .auth-logo span { color: #319b19; }.auth-logo b { color: #d8a900; }
        .auth-kicker { color: #319b19; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 14px; }
        .auth-heading h1 { font-size: 46px; line-height: 1; letter-spacing: -2px; margin: 0 0 14px; }.auth-heading > p:last-child { color: #716c6e; margin: 0 0 32px; line-height: 1.5; }
        .auth-form { display: grid; gap: 13px; }.auth-form label { font-size: 13px; font-weight: 700; }.auth-form input { width: 100%; padding: 15px 16px; border: 1px solid #d6d1d3; border-radius: 9px; background: #fff; font: inherit; outline-color: #319b19; }.auth-form button { border: 0; border-radius: 999px; background: #080808; color: #fff; padding: 16px; margin-top: 10px; font: inherit; font-weight: 700; cursor: pointer; }.auth-form button:hover { background: #319b19; }.auth-links { display: flex; justify-content: space-between; gap: 12px; margin-top: 22px; font-size: 14px; }.auth-links a { color: #319b19; font-weight: 700; }.auth-note { color: #716c6e; font-size: 13px; line-height: 1.5; margin-top: 20px; }.auth-showcase { background: #080808; color: #fff; display: grid; place-content: center; text-align: center; padding: 48px; position: relative; overflow: hidden; }.auth-showcase:before { content: ''; position: absolute; width: 530px; height: 530px; border-radius: 50%; background: #123a0b; border: 2px solid #d8a900; opacity: .8; }.showcase-mark, .auth-showcase strong, .auth-showcase p { position: relative; }.showcase-mark { font-size: clamp(110px, 15vw, 220px); line-height: .8; font-weight: 950; color: #d8a900; letter-spacing: -13px; }.showcase-mark span { color: #319b19; }.auth-showcase strong { font-size: 28px; margin-top: 26px; }.auth-showcase p { color: #d8a900; font-size: 16px; }.form-error { color: #b3261e; font-size: 13px; margin: 0; }
        @media (max-width: 760px) { .auth-page { display: block; }.auth-showcase { display: none; }.auth-panel { padding: 30px 0 55px; }.auth-logo { margin-bottom: 55px; } }
      `}</style>
    </main>
  )
}