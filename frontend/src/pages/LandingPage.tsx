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

      <section>
        <h2>Trending Stocks</h2> 
        {landingData.trendingStocks.map((stock) => (<p key={stock}>{stock}</p>))}  
      </section>

      <section>
        <h2>Trending Performance</h2>
        {landingData.trendingPerformance.map((performance, index) => (
          <p key={index}>{performance}%</p>
        ))}  
      </section>


      <section>
        <h2>FinSight</h2> 
        <p>{landingData.aiInsight}</p>  
      </section>

      <section>
        <h2>Trending Highlights</h2>
        {landingData.trendingHighlights.map((highlight) => (
          <p key={highlight}>{highlight}</p>
        ))}
      </section>
    </main>
  );
}
