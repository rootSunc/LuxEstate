import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ListingItem from "../componets/ListingItem.jsx";
import { apiRequest } from "../utils/api";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");
    const offerFromUrl = urlParams.get("offer");

    setSidebarData({
      searchTerm: searchTermFromUrl || "",
      type: typeFromUrl || "all",
      parking: parkingFromUrl === "true",
      furnished: furnishedFromUrl === "true",
      offer: offerFromUrl === "true",
      sort: sortFromUrl || "createdAt",
      order: orderFromUrl || "desc",
    });

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

  const handleChange = (e) => {
    if (["all", "rent", "sale"].includes(e.target.id)) {
      setSidebarData((prev) => ({ ...prev, type: e.target.id }));
      return;
    }

    if (e.target.id === "searchTerm") {
      setSidebarData((prev) => ({ ...prev, searchTerm: e.target.value }));
      return;
    }

    if (["parking", "furnished", "offer"].includes(e.target.id)) {
      setSidebarData((prev) => ({
        ...prev,
        [e.target.id]: e.target.checked,
      }));
      return;
    }

    if (e.target.id === "sort_order") {
      const [sort = "createdAt", order = "desc"] = e.target.value.split("_");
      setSidebarData((prev) => ({ ...prev, sort, order }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("type", sidebarData.type);
    urlParams.set("parking", String(sidebarData.parking));
    urlParams.set("furnished", String(sidebarData.furnished));
    urlParams.set("offer", String(sidebarData.offer));
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("order", sidebarData.order);
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    try {
      const numberOfListings = listings.length;
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("startIndex", String(numberOfListings));
      const data = await apiRequest(`/api/listing/get?${urlParams.toString()}`);
      const parsedListings = Array.isArray(data) ? data : [];
      setShowMore(parsedListings.length >= 9);
      setListings((prev) => [...prev, ...parsedListings]);
    } catch {
      setShowMore(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Search Term:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="all"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.type === "all"}
              />
              <span>Rent & Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.parking}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={sidebarData.furnished}
              />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              value={`${sidebarData.sort}_${sidebarData.order}`}
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-95">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">Loading</p>
          )}
          {!loading && fetchError && (
            <p className="text-xl text-red-600 w-full">{fetchError}</p>
          )}
          {!loading && listings.length === 0 && (
            <div className="w-full rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xl text-slate-700">No listing found!</p>
              <p className="mt-2 text-slate-600">
                Try a different filter or publish your own listing.
              </p>
              <div className="mt-3">
                {currentUser ? (
                  <Link
                    className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
                    to="/create-listing"
                  >
                    Create Listing
                  </Link>
                ) : (
                  <Link
                    className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
                    to="/sign-in"
                  >
                    Sign In to Publish
                  </Link>
                )}
              </div>
            </div>
          )}
          {listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Show More..
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
