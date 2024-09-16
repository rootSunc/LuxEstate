import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
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
import { apiRequest } from "../utils/api";
import { uploadImageFile, validateImageFile } from "../utils/imageUpload";

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
  const dispatch = useDispatch();

  useEffect(() => {
    if (!file) return;

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

  const handleShowListings = async () => {
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
  };

  const handleListingDelete = async (listingId) => {
    try {
      await apiRequest(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch {
      setShowListingsError(true);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      handleShowListings();
    }
  }, [currentUser?._id]);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
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
          }}
          hidden
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
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
          className="p-3 border rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          className="p-3 border rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="p-3 border rounded-lg"
        />
        <button className="bg-slate-700 text-white p-3 border rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-2">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        {listingsLoading ? "Loading Listings..." : "Refresh Listings"}
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>
      {!listingsLoading && userListings.length === 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-slate-700">You have not created any listings yet.</p>
          <Link
            to="/create-listing"
            className="mt-3 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white hover:opacity-90"
          >
            Create Your First Listing
          </Link>
        </div>
      )}
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-3">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            My Listing
          </h1>
          {userListings.map((listing) => (
            <div
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
              key={listing._id}
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold flex-1 hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
