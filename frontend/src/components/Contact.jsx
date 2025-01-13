import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { apiRequest } from "../utils/api";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError("");
      await apiRequest("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listing._id, message }),
      });
      setSent(true);
      setMessage("");
    } catch (error) {
      setSubmitError(error.message || "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const data = await apiRequest(`/api/users/${listing.userRef}`);
        setLandlord(data);
      } catch {
        setLandlord(null);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
      {landlord && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-slate-700">
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows="4"
            minLength={10}
            maxLength={1000}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Enter your message here..."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-700"
          ></textarea>

          <button
            disabled={submitting}
            className="rounded-lg bg-slate-900 p-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:opacity-95 disabled:opacity-70"
          >
            {submitting ? "Sending..." : "Send inquiry"}
          </button>
          {sent && <p className="text-sm font-medium text-emerald-700">Inquiry sent.</p>}
          {submitError && <p className="text-sm text-red-700">{submitError}</p>}
        </form>
      )}
    </>
  );
}

Contact.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    userRef: PropTypes.string.isRequired,
  }).isRequired,
};
