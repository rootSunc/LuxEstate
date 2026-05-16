import { Link } from "react-router-dom";
import { FaBath, FaBed, FaTag } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import PropTypes from "prop-types";
import {
  getDiscountLabel,
  getListingPriceLabel,
  getListingTypeLabel,
} from "../utils/listingFormat";

const FALLBACK_IMAGE =
  "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg";

export default function ListingItem({ listing }) {
  return (
    <article className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[330px]">
      <Link to={`/listing/${listing._id}`} className="block">
        <div className="relative h-[260px] overflow-hidden sm:h-[215px]">
          <img
            src={listing.imageUrls[0] || FALLBACK_IMAGE}
            alt={listing.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800">
            {getListingTypeLabel(listing.type)}
          </div>
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
}

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
    type: PropTypes.oneOf(["rent", "sale"]).isRequired,
  }).isRequired,
};
