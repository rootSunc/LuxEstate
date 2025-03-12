import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaCheck, FaCloudUploadAlt, FaHome, FaImage, FaLink, FaTrash } from "react-icons/fa";
import { uploadImageFile, validateImageFile } from "../utils/imageUpload";
import {
  resolveListingImageUrl,
  setImageFallback,
} from "../utils/imageUrl";

const DEFAULT_LISTING_FORM = {
  imageUrls: [],
  name: "",
  description: "",
  address: "",
  type: "rent",
  bedrooms: 1,
  bathrooms: 1,
  regularPrice: 2500,
  discountPrice: 0,
  offer: false,
  parking: false,
  furnished: false,
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

const numberFieldClass =
  "w-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

const normalizeInitialData = (initialData) => ({
  ...DEFAULT_LISTING_FORM,
  ...initialData,
  imageUrls: Array.isArray(initialData?.imageUrls) ? initialData.imageUrls : [],
});

const isValidHttpUrl = (value) => /^https?:\/\/.+/i.test(value);

export default function ListingForm({
  title,
  subtitle,
  initialData,
  submitLabel,
  submittingLabel,
  onSubmit,
}) {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState(() => normalizeInitialData(initialData));
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setFormData(normalizeInitialData(initialData));
  }, [initialData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSubmit = () => {
    if (files.length === 0) {
      setImageUploadError("Choose at least one image first.");
      return;
    }
    if (files.length + formData.imageUrls.length > 6) {
      setImageUploadError("Each listing can include up to 6 images.");
      return;
    }

    const validationError = files.map((file) => validateImageFile(file)).find(Boolean);
    if (validationError) {
      setImageUploadError(validationError);
      return;
    }

    setUploading(true);
    setImageUploadError("");
    Promise.all(files.map((file) => uploadImageFile(file)))
      .then((urls) => {
        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls.concat(urls),
        }));
        setFiles([]);
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      })
      .catch((uploadError) => {
        setImageUploadError(uploadError.message || "Image upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleAddImageUrl = () => {
    const normalizedUrl = imageUrlInput.trim();
    if (!normalizedUrl) {
      setImageUploadError("Enter an image URL first.");
      return;
    }
    if (!isValidHttpUrl(normalizedUrl)) {
      setImageUploadError("Image URL must start with http:// or https://.");
      return;
    }
    if (formData.imageUrls.length >= 6) {
      setImageUploadError("Each listing can include up to 6 images.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, normalizedUrl],
    }));
    setImageUrlInput("");
    setImageUploadError("");
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (formData.imageUrls.length < 1) {
      setSubmitError("Add at least one image before publishing.");
      return;
    }
    if (Number(formData.discountPrice) > Number(formData.regularPrice)) {
      setSubmitError("Discount price must be lower than regular price.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(error.message || "Unable to save listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <FaHome className="text-slate-600" />
            <h2 className="text-lg font-semibold">Property details</h2>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Listing name
              <input
                type="text"
                className={fieldClass}
                minLength={3}
                maxLength={100}
                required
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Address
              <input
                type="text"
                className={fieldClass}
                required
                value={formData.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Description
              <textarea
                className={`${fieldClass} min-h-32 resize-y`}
                minLength={10}
                maxLength={2000}
                required
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Listing type</span>
              <div className="grid grid-cols-2 gap-2">
                {["rent", "sale"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("type", type)}
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                      formData.type === type
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {type === "rent" ? "For Rent" : "For Sale"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                Bedrooms
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  className={numberFieldClass}
                  value={formData.bedrooms}
                  onChange={(event) => updateField("bedrooms", event.target.value)}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                Bathrooms
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  className={numberFieldClass}
                  value={formData.bathrooms}
                  onChange={(event) => updateField("bathrooms", event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["parking", "furnished", "offer"].map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => updateField(field, !formData[field])}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                    formData[field]
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {formData[field] && <FaCheck className="text-xs" />}
                  {field === "parking" ? "Parking" : field === "furnished" ? "Furnished" : "Offer"}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Regular price {formData.type === "rent" && <span className="text-xs">USD / month</span>}
                <input
                  type="number"
                  min="0"
                  required
                  className={fieldClass}
                  value={formData.regularPrice}
                  onChange={(event) => updateField("regularPrice", event.target.value)}
                />
              </label>
              {formData.offer && (
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Discount price {formData.type === "rent" && <span className="text-xs">USD / month</span>}
                  <input
                    type="number"
                    min="0"
                    required
                    className={fieldClass}
                    value={formData.discountPrice}
                    onChange={(event) => updateField("discountPrice", event.target.value)}
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2 text-slate-900">
            <FaImage className="text-slate-600" />
            <h2 className="text-lg font-semibold">Photos</h2>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                ref={imageInputRef}
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
                className={fieldClass}
                type="file"
                accept="image/*"
                multiple
              />
              <button
                type="button"
                onClick={handleImageSubmit}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-70"
              >
                <FaCloudUploadAlt />
                {uploading ? "Uploading" : "Upload"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="url"
                placeholder="Paste an image URL"
                className={fieldClass}
                value={imageUrlInput}
                onChange={(event) => setImageUrlInput(event.target.value)}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-700 px-4 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-50"
              >
                <FaLink />
                Add URL
              </button>
            </div>

            {imageUploadError && <p className="text-sm text-red-700">{imageUploadError}</p>}

            <div className="grid gap-3">
              {formData.imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 p-2"
                >
                  <img
                    src={resolveListingImageUrl(url)}
                    alt="Listing preview"
                    onError={setImageFallback}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {index === 0 ? "Cover image" : `Image ${index + 1}`}
                    </p>
                    <p className="truncate text-xs text-slate-500">{url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="rounded-md p-2 text-red-700 hover:bg-red-50"
                    aria-label="Remove image"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <button
              disabled={submitting || uploading}
              className="rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:opacity-95 disabled:opacity-70"
            >
              {submitting ? submittingLabel : submitLabel}
            </button>
            {submitError && <p className="text-sm text-red-700">{submitError}</p>}
          </div>
        </section>
      </form>
    </main>
  );
}

ListingForm.propTypes = {
  initialData: PropTypes.shape({
    address: PropTypes.string,
    bathrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    bedrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    description: PropTypes.string,
    discountPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    furnished: PropTypes.bool,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    offer: PropTypes.bool,
    parking: PropTypes.bool,
    regularPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.oneOf(["rent", "sale"]),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  submittingLabel: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
