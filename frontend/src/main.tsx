import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthProvider } from "./context/AuthContext";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Auth0Provider
       domain={domain}
        clientId={clientId}
        authorizationParams={{ redirect_uri: window.location.origin }}
        onRedirectCallback={(appState) => window.location.pathname = appState?.returnT0 || '/'}
      >
        
          <App />
       
      </Auth0Provider>
   </Provider>
  </StrictMode>,
);
