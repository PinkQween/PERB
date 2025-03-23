import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  Outlet,
} from "react-router";
import { ReactNode, useState } from "react";

// Reusable Layout Component
interface LayoutProps {
  showSidebar?: boolean;
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ showSidebar, children }) => (
  <div className="flex">
    {showSidebar && (
      <aside className="w-64 h-screen bg-gray-800 text-white fixed p-4">
        <nav>
          <ul>
            <li>
              <Link to="/dashboard" className="block p-2 hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/settings" className="block p-2 hover:bg-gray-700">
                Settings
              </Link>
            </li>
            <li>
              <Link to="/login" className="block p-2 hover:bg-gray-700">
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    )}
    <main className={showSidebar ? "ml-64 p-6 w-full" : "p-6 w-full"}>
      {children}
      <Outlet /> {/* Ensure child routes are rendered here */}
    </main>
  </div>
);

// Basic Page Components
const Home: React.FC = () => (
  <div className="text-center">
    <h1 className="text-3xl font-bold mb-4">Welcome Home!</h1>
    <p>This is the home page.</p>
    <Link
      to="/login"
      className="bg-blue-500 text-white px-4 py-2 mt-4 rounded inline-block"
    >
      Go to Login
    </Link>
  </div>
);

const Dashboard: React.FC<{ setAuth: (auth: boolean) => void }> = ({
  setAuth,
}) => {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>This is your dashboard.</p>
      <button
        onClick={() => {
          setAuth(false);
          navigate("/login");
        }}
        className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
      >
        Logout
      </button>
    </div>
  );
};

const Settings: React.FC = () => (
  <div className="text-center">
    <h1 className="text-3xl font-bold mb-4">Settings</h1>
    <p>Configure your settings here.</p>
  </div>
);

const Login: React.FC<{ setAuth: (auth: boolean) => void }> = ({ setAuth }) => {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <p>Please log in to access the dashboard.</p>
      <button
        onClick={() => {
          setAuth(true);
          navigate("/dashboard");
        }}
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
      >
        Log In
      </button>
    </div>
  );
};

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout showSidebar={false} />}>
          <Route index element={<Home />} />
          <Route
            path="/login"
            element={<Login setAuth={setIsAuthenticated} />}
          />
        </Route>

        {/* Protected Routes for authenticated users */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout showSidebar />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard setAuth={setIsAuthenticated} />}
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;