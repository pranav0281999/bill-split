import './AppHeader.css'

function AppHeader() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Bill Split home">
        <span className="brand-mark" aria-hidden="true">S</span>
        <span>bill <span className="brand-accent">split</span></span>
      </a>
      <span className="topbar-note">A clearer way to settle up</span>
    </header>
  )
}

export default AppHeader
