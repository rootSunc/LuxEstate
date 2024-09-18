import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaFilter, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import ListingItem from "../componets/ListingItem.jsx";
import { apiRequest } from "../utils/api";

const DEFAULT_FILTERS = {
  searchTerm: "",
  type: "all",
  parking: false,
  furnished: false,
  offer: false,
  sort: "createdAt",
  order: "desc",
};

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest" },
  { value: "regularPrice_asc", label: "Price low to high" },
  { value: "regularPrice_desc", label: "Price high to low" },
  { value: "createdAt_asc", label: "Oldest" },
];

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [sidebarData, setSidebarData] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const nextFilters = {
      searchTerm: urlParams.get("searchTerm") || "",
      type: urlParams.get("type") || "all",
      parking: urlParams.get("parking") === "true",
      furnished: urlParams.get("furnished") === "true",
      offer: urlParams.get("offer") === "true",
      sort: urlParams.get("sort") || "createdAt",
      order: urlParams.get("order") || "desc",
    };
    setSidebarData(nextFilters);

    const fetchListings = async () => {
      try {
        setLoading(true);
        setShowMore(false);
        setFetchError("");
        const searchQuery = urlParams.toString();
        const data = await apiRequest(`/api/listing/get?${searchQuery}`);
        const parsedListings = Array.isArray(data) ? data : [];
        setShowMore(parsedListings.length > 8);
        setListings(parsedListings);
      } catch {
        setListings([]);
        setShowMore(false);
        setFetchError("Failed to load listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (sidebarData.searchTerm) filters.push(`Search: ${sidebarData.searchTerm}`);
    if (sidebarData.type !== "all") filters.push(sidebarData.type === "rent" ? "Rent" : "Buy");
    if (sidebarData.offer) filters.push("Offers");
    if (sidebarData.parking) filters.push("Parking");
    if (sidebarData.furnished) filters.push("Furnished");
    return filters;
  }, [sidebarData]);

  const updateFilter = (field, value) => {
    setSidebarData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebarData.searchTerm.trim());
    urlParams.set("type", sidebarData.type);
    urlParams.set("parking", String(sidebarData.parking));
    urlParams.set("furnished", String(sidebarData.furnished));
    urlParams.set("offer", String(sidebarData.offer));
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("order", sidebarData.order);
    navigate(`/search?${urlParams.toString()}`);
  };

  const handleSortChange = (event) => {
    const [sort = "createdAt", order = "desc"] = event.target.value.split("_");
    setSidebarData((prev) => ({ ...prev, sort, order }));
  };

  const clearFilters = () => {
    setSidebarData(DEFAULT_FILTERS);
    navigate("/search");
  };

  const onShowMoreClick = async () => {
    try {
      setLoadingMore(true);
      const numberOfListings = listings.length;
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("startIndex", String(numberOfListings));
      const data = await apiRequest(`/api/listing/get?${urlParams.toString()}`);
      const parsedListings = Array.isArray(data) ? data : [];
      setShowMore(parsedListings.length >= 9);
      setListings((prev) => [...prev, ...parsedListings]);
    } catch {
      setShowMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-600" />
              <h1 className="text-lg font-semibold text-slate-900">Filters</h1>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <FaTimes className="text-xs" />
              Clear
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Search
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5">
                <FaSearch className="text-slate-500" />
                <input
                  type="text"
                  placeholder="City, address, property"
                  className="w-full bg-transparent outline-none"
                  value={sidebarData.searchTerm}
                  onChange={(event) => updateFilter("searchTerm", event.target.value)}
                />
              </div>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-300 text-sm font-semibold">
                {["all", "rent", "sale"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFilter("type", type)}
                    className={`px-3 py-2.5 ${
                      sidebarData.type === type
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {type === "all" ? "All" : type === "rent" ? "Rent" : "Buy"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Amenities</span>
              <div className="grid gap-2">
                {[
                  ["offer", "Offers only"],
                  ["parking", "Parking"],
                  ["furnished", "Furnished"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700"
                  >
                    {label}
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-slate-900"
                      checked={sidebarData[field]}
                      onChange={(event) => updateFilter(field, event.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Sort
              <select
                onChange={handleSortChange}
                value={`${sidebarData.sort}_${sidebarData.order}`}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-700"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:opacity-95">
              Apply filters
            </button>
          </form>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Marketplace search
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-slate-900">
                  {loading ? "Loading listings" : `${listings.length} listings found`}
                </h2>
              </div>
              {currentUser && (
                <Link
                  to="/create-listing"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  <FaPlus />
                  Add listing
                </Link>
              )}
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[405px] animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          )}

          {!loading && fetchError && (
            <div className="rounded-lg border border-red-200 bg-white p-5 text-red-700">
              {fetchError}
            </div>
          )}

          {!loading && !fetchError && listings.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-slate-900">No listings match these filters</h3>
              <p className="mt-2 max-w-xl text-slate-600">
                Try broadening the location, removing amenities, or switching between rent and buy.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </button>
                <Link
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  to={currentUser ? "/create-listing" : "/sign-in"}
                >
                  {currentUser ? "Create listing" : "Sign in to publish"}
                </Link>
              </div>
            </div>
          )}

          {!loading && !fetchError && listings.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {listings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
          )}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              disabled={loadingMore}
              className="mt-6 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-70"
            >
              {loadingMore ? "Loading more..." : "Show more listings"}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
