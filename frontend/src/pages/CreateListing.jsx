import { useNavigate } from "react-router-dom";
import ListingForm from "../componets/ListingForm";
import { apiRequest } from "../utils/api";

export default function CreateListing() {
  const navigate = useNavigate();

  const handleCreateListing = async (formData) => {
    const data = await apiRequest("/api/listing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    navigate(`/listing/${data._id}`);
  };

  return (
    <ListingForm
      title="Create listing"
      subtitle="Publish a polished property profile with accurate pricing, amenities, and a strong cover image."
      submitLabel="Create listing"
      submittingLabel="Creating..."
      onSubmit={handleCreateListing}
    />
  );
}
