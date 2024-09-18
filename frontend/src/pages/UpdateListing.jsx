import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingForm from "../componets/ListingForm";
import { apiRequest } from "../utils/api";

export default function UpdateListing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/api/listing/get/${params.listingId}`);
        setListing(data);
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load listing.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  const handleUpdateListing = async (formData) => {
    const data = await apiRequest(`/api/listing/update/${params.listingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    navigate(`/listing/${data._id}`);
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

  return (
    <ListingForm
      title="Update listing"
      subtitle="Refresh the property details, pricing, and image order before sending buyers or renters to the listing."
      initialData={listing}
      submitLabel="Update listing"
      submittingLabel="Updating..."
      onSubmit={handleUpdateListing}
    />
  );
}
