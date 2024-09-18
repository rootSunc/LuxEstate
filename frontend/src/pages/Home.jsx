import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaArrowRight, FaBuilding, FaHome, FaKey, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import ListingItem from "../componets/ListingItem";
import { apiRequest } from "../utils/api";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85";

const CITY_SHORTCUTS = ["San Diego", "Seattle", "Austin", "Los Angeles", "Portland"];

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");

  useEffect(() => {
    const fetchHomeListings = async () => {
      try {
        setLoading(true);
        setLoadingError("");
        const [offers, rents, sales] = await Promise.all([
          apiRequest("/api/listing/get?offer=true&limit=4"),
          apiRequest("/api/listing/get?type=rent&limit=4"),
          apiRequest("/api/listing/get?type=sale&limit=4"),
        ]);
        setOfferListings(Array.isArray(offers) ? offers : []);
        setRentListings(Array.isArray(rents) ? rents : []);
        setSaleListings(Array.isArray(sales) ? sales : []);
      } catch {
        setOfferListings([]);
        setRentListings([]);
        setSaleListings([]);
        setLoadingError("Unable to load listings right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeListings();
  }, []);

  const allFeaturedListings = useMemo(
    () => [...offerListings, ...rentListings, ...saleListings],
    [offerListings, rentListings, saleListings]
  );
  const hasAnyListings = allFeaturedListings.length > 0;
  const heroImage = offerListings[0]?.imageUrls?.[0] || HERO_FALLBACK_IMAGE;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("searchTerm", searchTerm.trim());
    params.set("type", searchType);
    navigate(`/search?${params.toString()}`);
  };

  const handleCityShortcut = (city) => {
    const params = new URLSearchParams();
    params.set("searchTerm", city);
    params.set("type", "all");
    navigate(`/search?${params.toString()}`);
  };

  const handleCreateDemoListing = async () => {
    try {
      setCreatingDemo(true);
      setDemoError("");
      const sample = await apiRequest("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Sunny Downtown Apartment",
          description:
            "Modern apartment with city view, close to metro, restaurants, and business district.",
          address: "120 Main Street, San Francisco, CA",
          type: "rent",
          bedrooms: 2,
          bathrooms: 1,
          regularPrice: 2800,
          discountPrice: 2500,
          offer: true,
          parking: true,
          furnished: true,
          imageUrls: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
          ],
        }),
      });
      navigate(`/listing/${sample._id}`);
    } catch (error) {
      setDemoError(error.message);
    } finally {
      setCreatingDemo(false);
    }
  };

  const renderSection = (title, href, listings) => {
    if (!listings.length) return null;

    return (
      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">Fresh properties ready to compare.</p>
          </div>
          <Link
            to={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:underline"
          >
            View all
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {listings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div>
      <section
        className="relative min-h-[540px] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative mx-auto flex min-h-[540px] max-w-6xl flex-col justify-center px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
              <FaKey />
              Curated homes for rent and sale
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Find a home that fits the way you live.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
              Search real listings, compare amenities, and contact owners from a single focused marketplace.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 grid gap-3 rounded-lg bg-white p-3 text-slate-900 shadow-xl md:grid-cols-[1fr_auto_auto]"
          >
            <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
              <FaMapMarkerAlt className="text-emerald-700" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="City, address, or property name"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 text-sm font-semibold">
              {["all", "rent", "sale"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 ${
                    searchType === type ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {type === "all" ? "All" : type === "rent" ? "Rent" : "Buy"}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              <FaSearch />
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {CITY_SHORTCUTS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityShortcut(city)}
                className="rounded-md bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <FaHome className="text-xl text-emerald-700" />
            <div>
              <p className="text-xl font-semibold text-slate-900">{allFeaturedListings.length}</p>
              <p className="text-sm text-slate-600">featured listings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaBuilding className="text-xl text-sky-700" />
            <div>
              <p className="text-xl font-semibold text-slate-900">{rentListings.length}</p>
              <p className="text-sm text-slate-600">rent-ready homes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaKey className="text-xl text-amber-700" />
            <div>
              <p className="text-xl font-semibold text-slate-900">{saleListings.length}</p>
              <p className="text-sm text-slate-600">purchase options</p>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600">
          Loading listings...
        </div>
      )}

      {!loading && loadingError && (
        <div className="mx-auto max-w-6xl px-4 py-8 text-red-700">
          {loadingError}
        </div>
      )}

      {!loading && !loadingError && !hasAnyListings && (
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">No listings yet</h2>
            <p className="mt-2 text-slate-600">
              The marketplace is empty. Add the first property so the demo has real content to explore.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {currentUser ? (
                <>
                  <Link
                    to="/create-listing"
                    className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Create listing
                  </Link>
                  <button
                    type="button"
                    onClick={handleCreateDemoListing}
                    disabled={creatingDemo}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                  >
                    {creatingDemo ? "Creating demo..." : "Create demo listing"}
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Sign in to publish
                </Link>
              )}
              <Link
                to="/search"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse search
              </Link>
            </div>
            {demoError && <p className="mt-3 text-sm text-red-700">{demoError}</p>}
          </div>
        </div>
      )}

      {!loading && !loadingError && (
        <>
          {renderSection("Recent offers", "/search?offer=true", offerListings)}
          {renderSection("Places for rent", "/search?type=rent", rentListings)}
          {renderSection("Homes for sale", "/search?type=sale", saleListings)}
        </>
      )}
    </div>
  );
}
