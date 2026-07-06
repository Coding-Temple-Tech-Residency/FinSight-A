//FinSight-A/frontend/src/pages/LandingPage.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { getLanding } from "../store/landing";
import { useAuth0 } from "@auth0/auth0-react";

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const landingData = useAppSelector((state) => state.landing);

  const { isAuthenticated, isLoading, user} = useAuth0();

  console.log({
    isLoading,
    isAuthenticated,
    user
  })

  useEffect(() => {
    dispatch(getLanding());
    {/*dispatch(landingData());*/}
  }, [dispatch]);

  return (
    <main>
      <header>
        <h1>FinSight</h1>
        <p>AI-powered investment intelligence platform.</p>

        <Link to="/login">Login</Link>
        <br />
        <Link to="/register">Register</Link>
      </header>

      <section>Trending Stocks </section>

      <section>Trending Performance</section>

      <section>FinSight </section>

      <section>Trending Highlights</section>
    </main>
  );
}
