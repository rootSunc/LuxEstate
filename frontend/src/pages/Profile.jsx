import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";
import {
  FaBookmark,
  FaEdit,
  FaEnvelope,
  FaHome,
  FaReply,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiRequest } from "../utils/api";
import { uploadImageFile, validateImageFile } from "../utils/imageUpload";
import {
  resolveListingImageUrl,
  setImageFallback,
} from "../utils/imageUrl";
import {
  getListingPriceLabel,
  getListingStatusLabel,
} from "../utils/listingFormat";

const LISTING_STATUSES = ["active", "draft", "sold", "rented"];
const DEFAULT_LISTING_STATUS_CLASS = "bg-amber-100 text-amber-900";
const LISTING_STATUS_CLASSES = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-100 text-slate-700",
  sold: DEFAULT_LISTING_STATUS_CLASS,
  rented: DEFAULT_LISTING_STATUS_CLASS,
};

const INQUIRY_STATUS_CLASSES = {
  new: "bg-emerald-100 text-emerald-800",
  replied: "bg-sky-100 text-sky-800",
};

const getListingStatusClass = (status) =>
  LISTING_STATUS_CLASSES[status] || DEFAULT_LISTING_STATUS_CLASS;

const getInquiryStatusClass = (status) =>
  INQUIRY_STATUS_CLASSES[status] || "bg-slate-100 text-slate-600";

const getReplyAuthorName = (reply, currentUser) => {
  const author = reply.authorRef;
  const authorId = typeof author === "object" ? author?._id : author;
  if (authorId === currentUser?._id) return "You";
  return author?.username || "Participant";
};

export default function Profile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState("");
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [savedListings, setSavedListings] = useState([]);
  const [savedListingsLoading, setSavedListingsLoading] = useState(false);
  const [savedListingsError, setSavedListingsError] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState(false);
  const [sentInquiries, setSentInquiries] = useState([]);
  const [sentInquiriesLoading, setSentInquiriesLoading] = useState(false);
  const [sentInquiriesError, setSentInquiriesError] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState("");
  const [replyErrorId, setReplyErrorId] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!file) return undefined;

    let isCancelled = false;
    const handleFileUpload = async () => {
      try {
        setFileUploadError("");
        setFilePerc(1);
        const uploadedImageUrl = await uploadImageFile(file);
        if (isCancelled) return;
        setFormData((prev) => ({ ...prev, avatar: uploadedImageUrl }));
        setFilePerc(100);
      } catch (uploadError) {
        if (isCancelled) return;
        setFileUploadError(uploadError.message || "Image upload failed");
        setFilePerc(0);
      }
    };

    handleFileUpload();
    return () => {
      isCancelled = true;
    };
  }, [file]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleProfileImageChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setFilePerc(0);
    setFileUploadError("");
    if (!selectedFile) {
      setFile(undefined);
      return;
    }

    const validationError = validateImageFile(selectedFile);
    if (validationError) {
      setFileUploadError(validationError);
      setFile(undefined);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const data = await apiRequest(`/api/users/update/${currentUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      await apiRequest(`/api/users/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await apiRequest("/api/auth/signout", {
        method: "POST",
      });
      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      setShowListingsError(false);
      setListingsLoading(true);
      const data = await apiRequest(`/api/users/listings/${currentUser._id}`);
      setUserListings(Array.isArray(data) ? data : []);
    } catch {
      setShowListingsError(true);
    } finally {
      setListingsLoading(false);
    }
  }, [currentUser?._id]);

  const handleShowSavedListings = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      setSavedListingsError(false);
      setSavedListingsLoading(true);
      const data = await apiRequest("/api/users/saved-listings");
      setSavedListings(Array.isArray(data) ? data : []);
    } catch {
      setSavedListingsError(true);
    } finally {
      setSavedListingsLoading(false);
    }
  }, [currentUser?._id]);

  const handleShowInquiries = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      setInquiriesError(false);
      setInquiriesLoading(true);
      const data = await apiRequest("/api/inquiries/mine");
      setInquiries(Array.isArray(data) ? data : []);
    } catch {
      setInquiriesError(true);
    } finally {
      setInquiriesLoading(false);
    }
  }, [currentUser?._id]);

  const handleShowSentInquiries = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      setSentInquiriesError(false);
      setSentInquiriesLoading(true);
      const data = await apiRequest("/api/inquiries/sent");
      setSentInquiries(Array.isArray(data) ? data : []);
    } catch {
      setSentInquiriesError(true);
    } finally {
      setSentInquiriesLoading(false);
    }
  }, [currentUser?._id]);

  const handleListingDelete = async (listingId) => {
    try {
      await apiRequest(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch {
      setShowListingsError(true);
    }
  };

  const handleListingStatusChange = async (listingId, status) => {
    try {
      setShowListingsError(false);
      const updatedListing = await apiRequest(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      setUserListings((prev) =>
        prev.map((listing) =>
          listing._id === listingId ? updatedListing : listing
        )
      );
    } catch {
      setShowListingsError(true);
    }
  };

  const handleRemoveSavedListing = async (listingId) => {
    try {
      setSavedListingsError(false);
      await apiRequest(`/api/users/saved-listings/${listingId}`, {
        method: "DELETE",
      });
      setSavedListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch {
      setSavedListingsError(true);
    }
  };

  const handleMarkInquiryRead = async (inquiryId) => {
    try {
      const updatedInquiry = await apiRequest(`/api/inquiries/${inquiryId}/read`, {
        method: "PATCH",
      });
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry._id === inquiryId
            ? { ...inquiry, status: updatedInquiry.status }
            : inquiry
        )
      );
    } catch {
      setInquiriesError(true);
    }
  };

  const updateInquiryCollections = (updatedInquiry) => {
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry._id === updatedInquiry._id ? updatedInquiry : inquiry
      )
    );
    setSentInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry._id === updatedInquiry._id ? updatedInquiry : inquiry
      )
    );
  };

  const handleReplyChange = (inquiryId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [inquiryId]: value }));
  };

  const handleReplySubmit = async (event, inquiryId) => {
    event.preventDefault();
    const message = String(replyDrafts[inquiryId] || "").trim();
    if (!message) return;

    try {
      setReplySubmittingId(inquiryId);
      setReplyErrorId("");
      const updatedInquiry = await apiRequest(`/api/inquiries/${inquiryId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      updateInquiryCollections(updatedInquiry);
      setReplyDrafts((prev) => ({ ...prev, [inquiryId]: "" }));
    } catch {
      setReplyErrorId(inquiryId);
    } finally {
      setReplySubmittingId("");
    }
  };

  const handleConfirm = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;

    if (action.type === "account") {
      await handleDeleteUser();
      return;
    }

    if (action.type === "listing") {
      await handleListingDelete(action.listingId);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      handleShowListings();
      handleShowSavedListings();
      handleShowInquiries();
      handleShowSentInquiries();
    }
  }, [
    currentUser?._id,
    handleShowInquiries,
    handleShowListings,
    handleShowSavedListings,
    handleShowSentInquiries,
  ]);

  const renderListingRow = (listing, { saved = false } = {}) => (
    <div
      className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-lg border border-slate-200 p-3"
      key={listing._id}
    >
      <Link to={`/listing/${listing._id}`}>
        <img
          src={resolveListingImageUrl(listing.imageUrls[0])}
          alt="listing cover"
          loading="lazy"
          decoding="async"
          onError={setImageFallback}
          className="h-16 w-16 rounded-md object-cover"
        />
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="block truncate font-semibold text-slate-800 hover:underline"
            to={`/listing/${listing._id}`}
          >
            {listing.name}
          </Link>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${getListingStatusClass(
              listing.status
            )}`}
          >
            {getListingStatusLabel(listing.status)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {getListingPriceLabel(listing)}
        </p>
      </div>
      {saved ? (
        <button
          type="button"
          onClick={() => handleRemoveSavedListing(listing._id)}
          className="rounded-md p-2 text-red-700 hover:bg-red-50"
          aria-label="Remove saved listing"
        >
          <FaTrash />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <select
            value={listing.status || "active"}
            onChange={(event) =>
              handleListingStatusChange(listing._id, event.target.value)
            }
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 outline-none"
            aria-label="Listing status"
          >
            {LISTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getListingStatusLabel(status)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              setConfirmAction({ type: "listing", listingId: listing._id })
            }
            className="rounded-md p-2 text-red-700 hover:bg-red-50"
            aria-label="Delete listing"
          >
            <FaTrash />
          </button>
          <Link to={`/update-listing/${listing._id}`}>
            <button
              type="button"
              className="rounded-md p-2 text-emerald-700 hover:bg-emerald-50"
              aria-label="Edit listing"
            >
              <FaEdit />
            </button>
          </Link>
        </div>
      )}
    </div>
  );

  const renderInquiryCard = (inquiry, { sent = false } = {}) => (
    <div key={inquiry._id} className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {sent
              ? inquiry.ownerRef?.username || "Listing owner"
              : inquiry.senderRef?.username || "Interested buyer"}
          </p>
          <p className="text-sm text-slate-500">
            {sent
              ? inquiry.ownerRef?.email || "No email available"
              : inquiry.senderRef?.email || "No email available"}
          </p>
        </div>
        <span
          className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${getInquiryStatusClass(
            inquiry.status
          )}`}
        >
          {inquiry.status}
        </span>
      </div>
      {inquiry.listingRef?._id ? (
        <Link
          to={`/listing/${inquiry.listingRef._id}`}
          className="mt-3 block text-sm font-semibold text-sky-800 hover:underline"
        >
          {inquiry.listingRef.name}
        </Link>
      ) : (
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Listing unavailable
        </p>
      )}
      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Original message
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {inquiry.message}
        </p>
      </div>

      {inquiry.replies?.length > 0 && (
        <div className="mt-3 grid gap-2">
          {inquiry.replies.map((reply) => (
            <div key={reply._id || reply.createdAt} className="rounded-lg border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-500">
                {getReplyAuthorName(reply, currentUser)}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {reply.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => handleReplySubmit(event, inquiry._id)}
        className="mt-3 grid gap-2"
      >
        <textarea
          minLength={2}
          maxLength={1000}
          required
          value={replyDrafts[inquiry._id] || ""}
          onChange={(event) => handleReplyChange(inquiry._id, event.target.value)}
          placeholder={sent ? "Add a follow-up..." : "Reply to this inquiry..."}
          className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-700"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={replySubmittingId === inquiry._id}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
          >
            <FaReply />
            {replySubmittingId === inquiry._id ? "Sending..." : "Reply"}
          </button>
          {!sent && inquiry.status === "new" && (
            <button
              type="button"
              onClick={() => handleMarkInquiryRead(inquiry._id)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Mark read
            </button>
          )}
        </div>
        {replyErrorId === inquiry._id && (
          <p className="text-sm text-red-700">Unable to send reply.</p>
        )}
      </form>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-7">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage account details, saved homes, property status, and inquiry conversations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              onChange={handleProfileImageChange}
              hidden
            />
            <img
              onClick={() => fileRef.current?.click()}
              src={formData.avatar || currentUser.avatar}
              alt="profile"
              className="mt-2 h-24 w-24 cursor-pointer self-center rounded-full object-cover"
            />
            <p className="self-center text-sm">
              {fileUploadError ? (
                <span className="text-red-700">{fileUploadError}</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-slate-700"> {`uploading ${filePerc}%`} </span>
              ) : filePerc === 100 ? (
                <span className="text-green-700">Image upload successfully!</span>
              ) : (
                ""
              )}
            </p>
            <input
              type="text"
              placeholder="username"
              id="username"
              defaultValue={currentUser.username}
              className="rounded-lg border p-3"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="email"
              id="email"
              defaultValue={currentUser.email}
              className="rounded-lg border p-3"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="password"
              id="password"
              className="rounded-lg border p-3"
              onChange={handleChange}
            />
            <button className="rounded-lg border bg-slate-700 p-3 uppercase text-white hover:opacity-95 disabled:opacity-80">
              {loading ? "Loading..." : "Update"}
            </button>
            <Link
              className="rounded-lg bg-green-700 p-3 text-center uppercase text-white hover:opacity-95"
              to="/create-listing"
            >
              Create Listing
            </Link>
          </form>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction({ type: "account" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <FaTrash />
              Delete account
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FaSignOutAlt />
              Sign out
            </button>
          </div>

          <p className="mt-5 text-red-700">{error || ""}</p>
          <p className="mt-5 text-green-700">
            {updateSuccess ? "User is updated successfully!" : ""}
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FaHome className="text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">My listings</h2>
            </div>
            <button
              type="button"
              onClick={handleShowListings}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {listingsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <p className="mt-5 text-red-700">
            {showListingsError ? "Error showing listings" : ""}
          </p>
          {!listingsLoading && userListings.length === 0 && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-slate-700">You have not created any listings yet.</p>
              <Link
                to="/create-listing"
                className="mt-3 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
              >
                Create Your First Listing
              </Link>
            </div>
          )}
          {userListings.length > 0 && (
            <div className="flex flex-col gap-3">
              {userListings.map((listing) => renderListingRow(listing))}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaBookmark className="text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-900">Saved listings</h2>
              </div>
              <button
                type="button"
                onClick={handleShowSavedListings}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {savedListingsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
            {savedListingsError && (
              <p className="mb-3 text-sm text-red-700">Error loading saved listings.</p>
            )}
            {!savedListingsLoading && savedListings.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Saved homes will appear here.
              </div>
            )}
            {savedListings.length > 0 && (
              <div className="grid gap-3">
                {savedListings.map((listing) => renderListingRow(listing, { saved: true }))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-slate-600" />
                <h2 className="text-xl font-semibold text-slate-900">Inquiries</h2>
              </div>
              <button
                type="button"
                onClick={handleShowInquiries}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {inquiriesLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
            {inquiriesError && (
              <p className="mb-3 text-sm text-red-700">Error loading inquiries.</p>
            )}
            {!inquiriesLoading && inquiries.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No buyer or renter inquiries yet.
              </div>
            )}
            {inquiries.length > 0 && (
              <div className="grid gap-3">
                {inquiries.map((inquiry) => renderInquiryCard(inquiry))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Sent inquiries</h2>
              <button
                type="button"
                onClick={handleShowSentInquiries}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {sentInquiriesLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
            {sentInquiriesError && (
              <p className="mb-3 text-sm text-red-700">Error loading sent inquiries.</p>
            )}
            {!sentInquiriesLoading && sentInquiries.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Messages you send to owners will appear here.
              </div>
            )}
            {sentInquiries.length > 0 && (
              <div className="grid gap-3">
                {sentInquiries.map((inquiry) =>
                  renderInquiryCard(inquiry, { sent: true })
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {confirmAction && (
        <ConfirmDialog
          destructive
          title={confirmAction.type === "account" ? "Delete account?" : "Delete listing?"}
          description={
            confirmAction.type === "account"
              ? "This removes your account and all listings you own. This cannot be undone."
              : "This removes the listing from search and your profile. This cannot be undone."
          }
          confirmLabel={confirmAction.type === "account" ? "Delete account" : "Delete listing"}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </main>
  );
}
