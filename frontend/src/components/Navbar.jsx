import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sprout, ShoppingCart, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'farmer' ? '/farmer' : null;

  return (
    <header className="sticky top-0 z-40 bg-soil-900 text-cream border-b border-harvest-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <Sprout className="text-harvest-500" size={26} strokeWidth={2.2} />
          FarmDirect
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/" className="hover:text-harvest-400 transition-colors">Browse</Link>
          {user?.role === 'customer' && (
            <Link to="/orders" className="hover:text-harvest-400 transition-colors">My Orders</Link>
          )}
          {dashboardLink && (
            <Link to={dashboardLink} className="hover:text-harvest-400 transition-colors">
              {user.role === 'admin' ? 'Admin Console' : 'Farmer Dashboard'}
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user?.role === 'customer' && (
            <Link to="/cart" className="relative p-2 hover:text-harvest-400 transition-colors focus-ring rounded">
              <ShoppingCart size={22} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-clay text-cream text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-cream/80">
                <User size={16} /> {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm bg-harvest-500 text-soil-900 font-semibold px-3 py-1.5 rounded-full hover:bg-harvest-400 transition-colors focus-ring">
                <LogOut size={15} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium hover:text-harvest-400 transition-colors">Log in</Link>
              <Link to="/register" className="text-sm bg-harvest-500 text-soil-900 font-semibold px-4 py-1.5 rounded-full hover:bg-harvest-400 transition-colors">
                Join FarmDirect
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-soil-800 border-t border-harvest-600/20 px-4 py-4 flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setOpen(false)}>Browse</Link>
          {user?.role === 'customer' && <Link to="/cart" onClick={() => setOpen(false)}>Cart ({items.length})</Link>}
          {user?.role === 'customer' && <Link to="/orders" onClick={() => setOpen(false)}>My Orders</Link>}
          {dashboardLink && <Link to={dashboardLink} onClick={() => setOpen(false)}>{user.role === 'admin' ? 'Admin Console' : 'Farmer Dashboard'}</Link>}
          {user ? (
            <button onClick={handleLogout} className="text-left text-clay">Log out</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Join FarmDirect</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
