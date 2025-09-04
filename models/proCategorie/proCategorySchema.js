import mongoose from "mongoose";
import schemaType from "../../types/index.js";

const proCategorySchema = new mongoose.Schema(
  {
    proId: {
      type: schemaType.ObjectID,
      ref: "user",
    },
    price: {
      type: schemaType.TypeNumber,
    },
    rating: {
      type: schemaType.TypeNumber,
      default: 0,
    },
    categoryId: {
      type: schemaType.ObjectID, // Reference to Category
      ref: "category",
    },
    userBookServId: {
      type: schemaType.ObjectID, // Reference to Category
      ref: "category",
    },
    complexity_tier: {
      type: schemaType.TypeString,
      enum: ["moderate", "complex", "simple"],
      required: true,
    },
    price_model: {
      type: schemaType.TypeString,
      enum: ["fixed", "range", "quote_only"],
      required: true,
    },
    fixed_price: { type: schemaType.TypeNumber },
    min_price: { type: schemaType.TypeNumber },
    max_price: { type: schemaType.TypeNumber },
    subCategories: [
      {
        id: {
          type: schemaType.ObjectID, // Reference to SubCategory
          ref: "SubCategory",
        },
        isRemote: {
          type: schemaType.TypeBoolean,
          default: false,
        },
        isChat: {
          type: schemaType.TypeBoolean,
          default: false,
        },
        isVirtual: {
          type: schemaType.TypeBoolean,
          default: false,
        },
        isInPerson: {
          type: schemaType.TypeBoolean,
          default: false,
        },
      },
    ],

    status: {
      type: schemaType.TypeString,
      enum: ["Active", "InActive", "Pending","Reject"],
    },
    serviceStatus: {
      type: schemaType.TypeString,
      default:'pending',
      enum: ["invited", "pending","success","failure","completed","Rejected"],
    }, // e.g., 'invited', 'pending', 'completed'
    rejectReason:{
      type:schemaType.TypeString
    },
    serviceCountry: {
      type: schemaType.TypeString,
      enum: ["US", "NON-US", "Both"],
    },
    bgServiceName: { type: schemaType.TypeString, enum: ["checkr", "certn"] },
checkrReportStatus:{
  type:schemaType.TypeString
},
checkrResult:{
  type:schemaType.TypeString
},
certnReportStatus:{
  type:schemaType.TypeString
},
certnResult:{
  type:schemaType.TypeString
},
    candidateId: { type: schemaType.TypeString }, // From Checkr response
    invitationUrl: { type: schemaType.TypeString }, // From Checkr response
    invitationId: { type: schemaType.TypeString },
    package: { type: schemaType.TypeString }, // 'basic_plus', 'plv', etc.
      candidateIdCertn: { type: schemaType.TypeString }, // From Checkr response
    invitationUrlCertn: { type: schemaType.TypeString }, // From Checkr response
    invitationIdCertn: { type: schemaType.TypeString },
    package: { type: schemaType.TypeString }, // 'basic_plus', 'plv', etc.
    packageCertn: { type: schemaType.TypeString }, // 'basic_plus', 'plv', etc.
    workLocation: {
      country: { type: schemaType.TypeString },
      state: { type: schemaType.TypeString },
      city: { type: schemaType.TypeString },
    },
    bgValidation: { type: schemaType.TypeArray },
    paymentStatus: { type: schemaType.TypeString }, // 'free', 'paid'

    certificate: [{ type: schemaType.TypeString }],
    platformLinks: [{ type: schemaType.TypeString }],
    socialMediaVerification:  [{ type: schemaType.TypeString }], // For Non-US entity

    isCompany: { type: schemaType.TypeString },
    isUSBased: { type: schemaType.TypeString },
    governmentId: { type: schemaType.TypeString },
    selfAssessment: { type: schemaType.TypeString },
    certificationOrLicense: { type: schemaType.TypeString },
    proofOfInsurance: { type: schemaType.TypeString },
    companyRegistrationUrl: { type: schemaType.TypeString },
    formW9: { type: schemaType.TypeString }, // For US
    w8BenUrl: { type: schemaType.TypeString }, // For Non-US individual
    w8BenEUrl: { type: schemaType.TypeString }, // For Non-US entity
    otherDocuments: { type: schemaType.TypeString },
     passport: { type: schemaType.TypeString },
      drivingLicence: { type: schemaType.TypeString },
       selfieVideo: { type: schemaType.TypeString },
        
    createdAt: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default proCategorySchema;
