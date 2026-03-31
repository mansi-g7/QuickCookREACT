import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Category from './components/Category'; 
import Feedback from './components/Feedback';
import RecipeDetail from './components/RecipeDetail';
import CategoryRecipes from './components/CategoryRecipes';
import AllRecipes from './components/AllRecipes';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './components/auth/login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Profile from './components/auth/Profile';
import UserProtectedRoute from './components/auth/UserProtectedRoute';
import Terms from './components/Terms';
import { recipeService } from './services/api';
import './App.css'; 

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchRecipes, setSearchRecipes] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Check if admin is already logged in on mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    const storedAdminName = localStorage.getItem('adminName');
    if (adminLoggedIn === 'true' && storedAdminName) {
      setIsAdminLoggedIn(true);
      setAdminName(storedAdminName);
    }
  }, []);

  useEffect(() => {
    // Update user login status whenever token changes
    setIsUserLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  useEffect(() => {
    const loadRecipesForSearch = async () => {
      try {
        const data = await recipeService.getAllRecipes();
        const allRecipes = Array.isArray(data) ? data : data.recipes || [];
        setSearchRecipes(Array.isArray(allRecipes) ? allRecipes : []);
      } catch (err) {
        console.error('Failed to load recipes for search:', err);
      }
    };

    if (!isAdminRoute) {
      loadRecipesForSearch();
    }
  }, [isAdminRoute]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestionList = useMemo(() => {
    const query = globalSearchTerm.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    return searchRecipes
      .map((recipe) => {
        const recipeName = (recipe.name || '').toLowerCase();
        const ingredientList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        const matchedIngredient = ingredientList.find((item) => item.toLowerCase().includes(query));
        const nameMatch = recipeName.includes(query);

        if (!nameMatch && !matchedIngredient) {
          return null;
        }

        return {
          _id: recipe._id,
          name: recipe.name,
          categoryName: recipe.category?.name || '',
          matchedIngredient: matchedIngredient || ''
        };
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [globalSearchTerm, searchRecipes]);

  const handleUserLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsUserLoggedIn(false);
    navigate('/');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    const query = globalSearchTerm.trim();
    setShowSearchSuggestions(false);
    if (query) {
      navigate(`/all-recipes?search=${encodeURIComponent(query)}`);
      return;
    }
    navigate('/all-recipes');
  };

  const handleSelectSuggestion = (recipe) => {
    setGlobalSearchTerm(recipe.name);
    setShowSearchSuggestions(false);
    navigate(`/recipe/${recipe._id}`);
  };

  return (
    /* h-100 and overflow-x-hidden ensure the full-page look without side-scrolling */
    <div className="d-flex flex-column min-vh-100 overflow-x-hidden">
      
      {/* HEADER SECTION - Only show on user pages, not on admin */}
      {!isAdminRoute && (
        <header>
          <nav className="navbar navbar-expand-lg navbar-dark bg-danger border-bottom border-warning border-3 shadow-sm" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
            {/* container-fluid stretches the navbar content to the edges */}
            <div className="container-fluid px-4"> 
              <Link className="navbar-brand d-flex align-items-center" to="/">
                <img 
                  src="/images/QuickCookLogo.png" 
                  alt="QuickCook Logo" 
                  style={{ height: '98px', marginRight: '0px' }}
                  title="QuickCook"
                />
              </Link>

              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/" style={{ fontSize: '18px' }}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/about" style={{ fontSize: '18px' }}>About Us</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-semibold" to="/contact" style={{ fontSize: '18px' }}>Contact Us</Link>
                  </li>

                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle text-white fw-semibold" href="#" id="categoryDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: '18px' }}>
                      Categories
                    </a>
                    <ul className="dropdown-menu border-warning border-2 shadow" aria-labelledby="categoryDropdown">
                      <li><Link className="dropdown-item" to="/category/Breakfast"><i className="bi bi-egg-fried text-danger"></i> Breakfast</Link></li>
                      <li><Link className="dropdown-item" to="/category/Lunch"><i className="bi bi-sun text-danger"></i> Lunch</Link></li>
                      <li><Link className="dropdown-item" to="/category/Dinner"><i className="bi bi-moon-stars text-danger"></i> Dinner</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item" to="/category/Desserts"><i className="bi bi-cake2 text-danger"></i> Desserts</Link></li>
                    </ul>
                  </li>
                </ul>

                <form className="d-flex mx-auto col-lg-3 mb-2 mb-lg-0" onSubmit={handleGlobalSearch} ref={searchRef}>
                  <div className="input-group search-group">
                    <input
                      className="form-control border-warning shadow-sm"
                      type="search"
                      placeholder="Search by recipe or ingredient..."
                      aria-label="Search"
                      value={globalSearchTerm}
                      onChange={(e) => {
                        setGlobalSearchTerm(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                    />
                    <button className="btn btn-warning text-danger shadow-sm" type="submit">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>

                  {showSearchSuggestions && suggestionList.length > 0 && (
                    <div className="search-suggestions-dropdown shadow">
                      {suggestionList.map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          className="search-suggestion-item"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          <span className="search-suggestion-title">{item.name}</span>
                          {item.matchedIngredient ? (
                            <span className="search-suggestion-sub">Ingredient match: {item.matchedIngredient}</span>
                          ) : (
                            <span className="search-suggestion-sub">Category: {item.categoryName || 'Recipe'}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </form>

                <div className="d-flex align-items-center justify-content-end ms-lg-2 gap-2">
                  <button 
                    type="button"
                    className="btn btn-warning text-danger fw-bold px-3 rounded-pill shadow-sm"
                    onClick={() => window.location.href = isAdminLoggedIn ? '/admin/dashboard' : '/admin'}
                  >
                    <i className="bi bi-speedometer2 me-1"></i> Admin
                  </button>

                  {isUserLoggedIn ? (
                    <>
                      <Link to="/profile" className="profile-circle shadow-sm" title="My Profile">
                        <i className="bi bi-person-fill"></i>
                      </Link>
                      <button
                        className="btn btn-outline-danger text-white fw-bold px-3 rounded-pill shadow-sm"
                        onClick={handleUserLogout}
                      >
                        <i className="bi bi-box-arrow-right me-1"></i> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="btn btn-outline-warning text-white fw-bold px-3 rounded-pill shadow-sm">
                        <i className="bi bi-box-arrow-in-right me-1"></i> Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* MAIN CONTENT - The Wrapper for Full Width */}
      <main role="main" className="flex-grow-1">
        {/* container-fluid with p-0 and m-0 removes all side margins/padding */}
        <div className="container-fluid p-0 m-0"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/category/:name" element={<CategoryRecipes />} />
            <Route
              path="/recipe/:id"
              element={
                <UserProtectedRoute>
                  <RecipeDetail />
                </UserProtectedRoute>
              }
            />
            <Route path="/all-recipes" element={<AllRecipes />} />
            <Route path="/feedback" element={<Feedback />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} setAdminName={setAdminName} />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
                  <AdminDashboard adminName={adminName} setIsAdminLoggedIn={setIsAdminLoggedIn} setAdminName={setAdminName} />
                </ProtectedRoute>
              } 
            />

            {/* User Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </div>
      </main>

      {/* FOOTER SECTION - Only show on user pages, not on admin */}
      {!isAdminRoute && (
        <footer className="border-top footer text-white bg-dark mt-5 pt-5 pb-4">
          <div className="container-fluid px-5"> 
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
                <h3 className="fw-bold text-warning mb-2">
                  QuickCook Recipe Finder
                </h3>
                <p className="text-white-50 mb-0">
                  Providing the best recipes for every kitchen since 2026. <br />
                  Discover thousands of recipes by name or ingredients.
                </p>
              </div>

              <div className="col-md-6 text-center text-md-end">
                <div className="mb-3">
                  <Link to="/" className="text-white-50 text-decoration-none me-3">Home</Link>
                  <Link to="/about" className="text-white-50 text-decoration-none me-3">About</Link>
                  <Link to="/contact" className="text-white-50 text-decoration-none me-3">Contact</Link>
                  <Link to="/feedback" className="text-warning text-decoration-none fw-bold">Feedback</Link>
                </div>
                <div className="fs-5">
                  <a href="#" className="text-warning me-3"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="text-warning me-3"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="text-warning"><i className="bi bi-twitter-x"></i></a>
                </div>
              </div>
            </div>

            <hr className="border-warning my-4 opacity-25" />

            <div className="row">
              <div className="col-12 text-center text-white-50 small">
                &copy; 2026 - <span className="text-warning fw-bold">QuickCook</span> Recipe Finder -
                <Link to="/privacy" className="text-white-50 text-decoration-none ms-2">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;