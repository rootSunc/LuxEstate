import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaBath,
  FaBed,
  FaChair,
  FaExternalLinkAlt,
  FaMapMarkedAlt,
  FaParking,
  FaPen,
  FaShare,
  FaTag,
} from "react-icons/fa";
import Contact from "../components/Contact";
import { apiRequest } from "../utils/api";
import {
  getDiscountLabel,
  getListingPriceLabel,
  getListingTypeLabel,
} from "../utils/listingFormat";
import {
  PROPERTY_IMAGE_FALLBACK,
  resolveListingImageUrl,
  setImageFallback,
} from "../utils/imageUrl";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/api/listings/${params.listingId}`);
        setListing(data);
        setActiveImageIndex(0);
      } catch (fetchError) {
        setError(fetchError.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.listingId]);

  const images = listing?.imageUrls?.length
    ? listing.imageUrls.map((url) => resolveListingImageUrl(url))
    : [PROPERTY_IMAGE_FALLBACK];
  const activeImage = images[activeImageIndex] || images[0];
  const isOwner = currentUser && listing?.userRef === currentUser._id;
  const mapUrl = useMemo(() => {
    if (!listing?.address) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(listing.address)}&output=embed`;
  }, [listing?.address]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Loading listing...
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-red-700">
        {error}
      </main>
    );
  }

  if (!listing) return null;

  return (
    <main className="bg-slate-50">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-lg bg-slate-200">
            <img
              src={activeImage}
              alt={listing.name}
              onError={setImageFallback}
              className="h-[360px] w-full object-cover sm:h-[560px]"
            />
            <button
              type="button"
              onClick={handleShare}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow hover:bg-white"
              aria-label="Copy listing link"
            >
              <FaShare />
            </button>
            {copied && (
              <p className="absolute right-4 top-[68px] rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow">
                Link copied
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
            {images.slice(0, 4).map((url, index) => (
              <button
                type="button"
                key={`${url}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                className={`overflow-hidden rounded-lg border-2 ${
                  activeImageIndex === index ? "border-slate-900" : "border-transparent"
                }`}
              >
                <img
                  src={url}
                  alt={`${listing.name} ${index + 1}`}
                  onError={setImageFallback}
                  className="h-20 w-full object-cover lg:h-[132px]"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-7 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                    {getListingTypeLabel(listing.type)}
                  </span>
                  {listing.offer && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white">
                      <FaTag className="text-[10px]" />
                      {getDiscountLabel(listing)}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900">
                  {listing.name}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <FaMapMarkedAlt className="text-emerald-700" />
                  {listing.address}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-semibold text-slate-900">
                  {getListingPriceLabel(listing)}
                </p>
                <p className="mt-1 text-sm text-slate-500">Listed on LuxEstate</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <FaBed className="mb-2 text-slate-500" />
                <p className="font-semibold text-slate-900">{listing.bedrooms}</p>
                <p className="text-sm text-slate-600">Bedrooms</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <FaBath className="mb-2 text-slate-500" />
                <p className="font-semibold text-slate-900">{listing.bathrooms}</p>
                <p className="text-sm text-slate-600">Bathrooms</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <FaParking className="mb-2 text-slate-500" />
                <p className="font-semibold text-slate-900">
                  {listing.parking ? "Yes" : "No"}
                </p>
                <p className="text-sm text-slate-600">Parking</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <FaChair className="mb-2 text-slate-500" />
                <p className="font-semibold text-slate-900">
                  {listing.furnished ? "Yes" : "No"}
                </p>
                <p className="text-sm text-slate-600">Furnished</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-semibold text-slate-900">Description</h2>
              <p className="mt-3 leading-7 text-slate-700">{listing.description}</p>
            </div>
          </div>

          {mapUrl && (
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Location</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    listing.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:underline"
                >
                  Open map
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
              <iframe
                title={`Map for ${listing.name}`}
                src={mapUrl}
                className="h-80 w-full border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-900">Interested?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send a concise message to the owner and keep the listing link handy while comparing homes.
          </p>

          <div className="mt-5 grid gap-3">
            {isOwner && (
              <Link
                to={`/update-listing/${listing._id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FaPen />
                Edit listing
              </Link>
            )}

            {currentUser && !isOwner && !contact && (
              <button
                onClick={() => setContact(true)}
                className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-800"
              >
                Contact owner
              </button>
            )}
            {!currentUser && (
              <Link
                to="/sign-in"
                className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:opacity-95"
              >
                Sign in to contact
              </Link>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </aside>
      </section>
    </main>
  );
}
