import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/constants";

// =============================================================================
// AuthRoute — /login and /register, without a login page
// =============================================================================
//
// Auth on this storefront is a modal (components/AuthModal), and Prompt 30 keeps
// it that way: signing in should never cost a visitor the page they were
// reading. But /login and /register are URLs the world expects to exist — an
// email, a bookmark, a redirect from somewhere else — and a 404 for them is
// indefensible.
//
// So the route is a DOOR, not a page: it opens the modal (which Header mounts
// on every storefront route) and immediately navigates back to wherever the
// visitor came from, replacing itself in the history stack. The modal stays up
// over that page. Back therefore returns to the page BEFORE /login, never to
// /login itself — which would re-open the modal in a loop.
//
//   <Link to="/login" state={{ from: location.pathname }}>  → returns there
//   a cold visit to /login                                  → returns home
//
// An already-signed-in visitor is sent on without the modal: there is nothing
// for them to do here.
// =============================================================================

const AuthRoute = ({ tab = "login" }) => {
  const location = useLocation();
  const { openAuthModal, isAuthenticated } = useAuth();
  // openAuthModal is re-created on every AuthProvider render, so the effect is
  // guarded by a ref rather than by its dependency list: this must fire once.
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current || isAuthenticated) return;
    opened.current = true;
    openAuthModal(tab);
  }, [isAuthenticated, openAuthModal, tab]);

  const back = location.state?.from || ROUTES.HOME;

  return <Navigate to={back} replace />;
};

export default AuthRoute;
