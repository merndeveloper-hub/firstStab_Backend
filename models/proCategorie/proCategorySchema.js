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

    createdAt: {
      type: schemaType.TypeDate,
      default: Date.now,
    },
  },

  { timestamps: true }
);

export default proCategorySchema;
