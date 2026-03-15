import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ListingItem from "../componets/ListingItem";
import { apiRequest } from "../utils/api";

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

  SwiperCore.use(Navigation);

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

  const hasAnyListings =
    offerListings.length > 0 || rentListings.length > 0 || saleListings.length > 0;

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

  return (
    <div>
      {/* top description */}
      <div className="flex flex-col gap-5 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-slate-500">perfect</span>
          <br />
          home easily
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          LuxEstate is the best place to find your next perfect place to live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          to={"/search"}
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
        >
          Let's get start...
        </Link>
      </div>

      {loading && (
        <div className="max-w-6xl mx-auto px-3 py-6 text-slate-600">
          Loading listings...
        </div>
      )}

      {!loading && loadingError && (
        <div className="max-w-6xl mx-auto px-3 py-6 text-red-600">
          {loadingError}
        </div>
      )}

      {!loading && !loadingError && offerListings.length > 0 && (
        <Swiper navigation>
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {!loading && !loadingError && !hasAnyListings && (
        <div className="max-w-6xl mx-auto px-3 pb-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-700">No listings yet</h2>
            <p className="mt-2 text-slate-600">
              The marketplace is currently empty. Create your first listing to get started.
            </p>
            <div className="mt-4 flex gap-3">
              {currentUser ? (
                <>
                  <Link
                    to="/create-listing"
                    className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
                  >
                    Create Listing
                  </Link>
                  <button
                    type="button"
                    onClick={handleCreateDemoListing}
                    disabled={creatingDemo}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                  >
                    {creatingDemo ? "Creating Demo..." : "Create Demo Listing"}
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
                >
                  Sign In to Publish
                </Link>
              )}
              <Link
                to="/search"
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Go to Search
              </Link>
            </div>
            {demoError && <p className="mt-3 text-red-600">{demoError}</p>}
          </div>
        </div>
      )}

      {/* Recent offers */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent offers
              </h2>
              <Link
                to={"/search?offer=true"}
                className="text-sm text-blue-800 hover:underline"
              >
                Show more offers
              </Link>
              <div className="flex flex-wrap gap-4">
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Recent places for rent */}
        {rentListings && rentListings.length > 0 && (
          <div className="div">
            <div className="text-2xl font-semibold text-slate-600">
              <h2>Recent places for rent</h2>
              <Link
                to={"/search?type=rent"}
                className="text-sm text-blue-800 hover:underline"
              >
                Show more places for rent
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {/* Recent places for sale */}
        {saleListings && saleListings.length > 0 && (
          <div className="div">
            <div className="text-2xl font-semibold text-slate-600">
              <h2>Recent places for sale</h2>
              <Link
                to={"/search?type=sale"}
                className="text-sm text-blue-800 hover:underline"
              >
                Show more places for sale
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
