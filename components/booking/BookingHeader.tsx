export default function BookingHeader() {
  return (
    <header className="booking-header">
      <a className="brand" href="/" aria-label="Servior home">
        <span className="brand-mark">
          <img src='/servior-logo.png' alt="Servior" className="w-9" />
        </span>
        <span className="brand-copy">
          <img src='/servior-name-logo.png' alt="Servior" className="w-30" />
          <small>Book. Play. Repeat.</small>
        </span>
      </a>
      <div className="header-pill">
        <span className="status-dot" />
        Easy online booking
      </div>
    </header>
  );
}
