import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
import Signin from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Listing from "./pages/Listing";
import Search from "./pages/Search";
import Header from "./componets/Header";
import PrivateRoute from "./componets/PrivateRoute";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import { apiRequest } from "./utils/api";
import { signInSuccess, signOutUserSuccess } from "./redux/user/userSlice";

export default function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await apiRequest("/api/auth/me");
        dispatch(signInSuccess(user));
      } catch {
        dispatch(signOutUserSuccess());
      } finally {
        setAuthChecking(false);
      }
    };

    restoreSession();
  }, [dispatch]);

  if (authChecking) {
    return (
      <BrowserRouter>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">
          Loading session...
        </div>
      </BrowserRouter>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:listingId" element={<Listing />} />

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route
              path="/update-listing/:listingId"
              element={<UpdateListing />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
