import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import { apiRequest } from "./utils/api";
import { signInSuccess, signOutUserSuccess } from "./redux/user/userSlice";

const Signin = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Listing = lazy(() => import("./pages/Listing"));
const Search = lazy(() => import("./pages/Search"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const UpdateListing = lazy(() => import("./pages/UpdateListing"));

const routerFutureConfig = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

function RouteFallback() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">
      Loading...
    </div>
  );
}

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
      <BrowserRouter future={routerFutureConfig}>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">
          Loading session...
        </div>
      </BrowserRouter>
    );
  }

  return (
    <>
      <BrowserRouter future={routerFutureConfig}>
        <Header />
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </>
  );
}
