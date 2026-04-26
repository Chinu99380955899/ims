import { NavLink, Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <div className="sidebar__logo">DS</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>DocuSense</span>
        </Link>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="icon">📊</span> Dashboard
        </NavLink>
        
        {/* NEW: Dedicated Upload Page Link */}
        <NavLink
          to="/upload"
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="icon">📤</span> Upload Invoices
        </NavLink>

        <NavLink
          to="/invoices"
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="icon">🗄️</span> View Invoices
        </NavLink>

        <NavLink
          to="/review"
          className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
        >
          <span className="icon">✓</span> Review Queue
        </NavLink>
      </nav>
    </aside>
  );
}