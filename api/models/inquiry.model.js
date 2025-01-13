import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    listingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    senderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;
