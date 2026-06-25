import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main>
      <h1>FinSight</h1>
      <p>AI-powered investment intelligence platform.</p>

      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
      <br />
      <Link to="/dashboard">Dashboard</Link>
    </main>
  );
}