import { memo } from "react";
import { Link } from "react-router-dom";
import { FaBath, FaBed, FaTag } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import PropTypes from "prop-types";
import {
  getDiscountLabel,
  getListingPriceLabel,
  getListingStatusLabel,
  getListingTypeLabel,
} from "../utils/listingFormat";
import {
  resolveListingImageUrl,
  setImageFallback,
} from "../utils/imageUrl";

const ListingItem = memo(function ListingItem({ listing }) {
  return (
    <article className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[330px]">
      <Link to={`/listing/${listing._id}`} className="block">
        <div className="relative h-[260px] overflow-hidden sm:h-[215px]">
          <img
            src={resolveListingImageUrl(listing.imageUrls[0])}
            alt={listing.name}
            loading="lazy"
            decoding="async"
            onError={setImageFallback}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800">
            {getListingTypeLabel(listing.type)}
          </div>
          {listing.status && listing.status !== "active" && (
            <div className="absolute right-3 top-3 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
              {getListingStatusLabel(listing.status)}
            </div>
          )}
          {listing.offer && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white">
              <FaTag className="text-[10px]" />
              {getDiscountLabel(listing)}
            </div>
          )}
        </div>
        <div className="flex min-h-[190px] flex-col gap-2 p-4">
          <p className="truncate text-lg font-semibold text-slate-900">
            {listing.name}
          </p>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MdLocationOn className="h-4 w-4 shrink-0 text-emerald-700" />
            <p className="w-full truncate text-sm">
              {listing.address}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {listing.description}
          </p>
          <p className="mt-auto text-lg font-semibold text-slate-900">
            {getListingPriceLabel(listing)}
          </p>
          <div className="flex gap-4 border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <FaBed className="text-slate-500" />
              {listing.bedrooms} {listing.bedrooms > 1 ? "beds" : "bed"}
            </div>
            <div className="flex items-center gap-1.5">
              <FaBath className="text-slate-500" />
              {listing.bathrooms} {listing.bathrooms > 1 ? "baths" : "bath"}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
});

ListingItem.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    bathrooms: PropTypes.number.isRequired,
    bedrooms: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    discountPrice: PropTypes.number.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    name: PropTypes.string.isRequired,
    offer: PropTypes.bool.isRequired,
    regularPrice: PropTypes.number.isRequired,
    status: PropTypes.oneOf(["active", "draft", "sold", "rented"]),
    type: PropTypes.oneOf(["rent", "sale"]).isRequired,
  }).isRequired,
};

export default ListingItem;
