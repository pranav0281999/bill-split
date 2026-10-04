import './SetupIntro.css'

function SetupIntro() {
  return (
    <div className="intro">
      <div className="step-indicator">
        <span className="step-dot" /> STEP 1 OF 3
      </div>
      <h1 id="page-title">Who’s sharing<br />this bill?</h1>
      <p className="intro-copy">
        Add everyone joining in. You can split each expense between just the
        people it belongs to.
      </p>
      <div className="note-card">
        <span className="note-icon" aria-hidden="true">✳</span>
        <p><strong>Good to know</strong><br />Names can’t be changed after you continue.</p>
      </div>
      <div className="decorative-circle circle-one" aria-hidden="true" />
      <div className="decorative-circle circle-two" aria-hidden="true" />
    </div>
  )
}

export default SetupIntro
