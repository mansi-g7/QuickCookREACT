
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Category from './components/Category';
import RecipeDetail from './components/RecipeDetail';
import CategoryRecipes from './components/CategoryRecipes';
import AllRecipes from './components/AllRecipes';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import './App.css';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    const storedAdminName = localStorage.getItem('adminName');

    if (adminLoggedIn === 'true' && storedAdminName) {
      setIsAdminLoggedIn(true);
      setAdminName(storedAdminName);
    }
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100 overflow-x-hidden">

      {/* HEADER - Hidden on Admin Pages */}
      {!isAdminRoute && (
        <header>
          <nav className="navbar navbar-expand-lg navbar-dark bg-danger border-bottom border-warning border-3 shadow-sm">
            <div className="container-fluid px-4">

              <Link className="navbar-brand fw-bold text-warning fs-3" to="/">
                <i className="bi bi-egg-fried"></i> QuickCook
              </Link>

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarContent">

                <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/">Home</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/about">About Us</Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/contact">Contact Us</Link>
                  </li>

                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle text-white fw-semibold"
                      href="#"
                      id="categoryDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                    >
                      Categories
                    </a>

                    <ul className="dropdown-menu border-warning border-2 shadow">
                      <li>
                        <Link className="dropdown-item" to="/category/Breakfast">
                          <i className="bi bi-egg-fried text-danger"></i> Breakfast
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/category/Lunch">
                          <i className="bi bi-sun text-danger"></i> Lunch
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/category/Dinner">
                          <i className="bi bi-moon-stars text-danger"></i> Dinner
                        </Link>
                      </li>

                      <li><hr className="dropdown-divider"/></li>

                      <li>
                        <Link className="dropdown-item" to="/category/Desserts">
                          <i className="bi bi-cake2 text-danger"></i> Desserts
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/category/Spicy">
                          <i className="bi bi-fire text-danger"></i> Spicy Specials
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>

                {/* SEARCH */}
                <form className="d-flex mx-auto col-lg-4 mb-2 mb-lg-0">
                  <div className="input-group">
                    <input
                      className="form-control border-warning shadow-sm"
                      type="search"
                      placeholder="Search recipes or ingredients..."
                    />

                    <button className="btn btn-warning text-danger shadow-sm">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </form>

                {/* BUTTONS */}
                <div className="d-flex align-items-center ms-lg-3">

                  <button
                    className="btn btn-warning text-danger fw-bold px-4 me-3 rounded-pill shadow-sm"
                    onClick={() =>
                      window.location.href = isAdminLoggedIn
                        ? '/admin/dashboard'
                        : '/admin'
                    }
                  >
                    <i className="bi bi-speedometer2 me-1"></i> Admin
                  </button>

                  <button
                    className="btn btn-outline-warning text-white fw-bold px-4 me-3 rounded-pill shadow-sm"
                    onClick={() => (window.location.href = '/')}
                  >
                    <i className="bi bi-house me-1"></i> User
                  </button>

                  <Link to="/profile" className="profile-circle shadow-sm">
                    <i className="bi bi-person-fill"></i>
                  </Link>

                </div>
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main role="main" className="flex-grow-1">
        <div className="container-fluid p-0 m-0">

          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/category/:name" element={<CategoryRecipes />} />
            <Route path="/all-recipes" element={<AllRecipes />} />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <AdminLogin
                  setIsAdminLoggedIn={setIsAdminLoggedIn}
                  setAdminName={setAdminName}
                />
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
                  <AdminDashboard
                    adminName={adminName}
                    setIsAdminLoggedIn={setIsAdminLoggedIn}
                    setAdminName={setAdminName}
                  />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </main>

      {/* FOOTER - Hidden on Admin Pages */}
      {!isAdminRoute && (
        <footer className="border-top footer text-white bg-dark mt-5 pt-5 pb-4">

          <div className="container-fluid px-5">

            <div className="row align-items-center">

              <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
                <h3 className="fw-bold text-warning mb-2">
                  <i className="bi bi-egg-fried"></i> QuickCook Recipe Finder
                </h3>

                <p className="text-white-50 mb-0">
                  Providing the best recipes for every kitchen since 2026.
                  Discover thousands of recipes by name or ingredients.
                </p>
              </div>

              <div className="col-md-6 text-center text-md-end">

                <div className="mb-3">
                  <Link to="/" className="text-white-50 text-decoration-none me-3">Home</Link>
                  <Link to="/about" className="text-white-50 text-decoration-none me-3">About</Link>
                  <Link to="/contact" className="text-white-50 text-decoration-none">Contact</Link>
                </div>

                <div className="fs-5">
                  <a href="#" className="text-warning me-3"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="text-warning me-3"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="text-warning"><i className="bi bi-twitter-x"></i></a>
                </div>

              </div>
            </div>

            <hr className="border-warning my-4 opacity-25"/>

            <div className="text-center text-white-50 small">
              &copy; 2026 - <span className="text-warning fw-bold">QuickCook</span> Recipe Finder
            </div>

          </div>
        </footer>
      )}

    </div>
  );
}

export default App;
