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

    status: { type: schemaType.TypeString, enum: ["Active", "InActive"] },
    serviceStatus: {
      type: schemaType.TypeString,
      enum: ["invited", "pending", "completed"],
    }, // e.g., 'invited', 'pending', 'completed'
    serviceCountry: {
      type: schemaType.TypeString,
      enum: ["US", "NON-US", "Both"],
    },
    bgServiceName: { type: schemaType.TypeString, enum: ["checkr", "certn"] },

    candidateId: { type: schemaType.TypeString }, // From Checkr response
    invitationUrl: { type: schemaType.TypeString }, // From Checkr response
    package: { type: schemaType.TypeString }, // 'basic_plus', 'plv', etc.
    workLocation: {
      country: { type: schemaType.TypeString },
      state: { type: schemaType.TypeString },
      city: { type: schemaType.TypeString },
    },

    bgValidation: { type: schemaType.TypeArray },

    createdAt: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default proCategorySchema;
