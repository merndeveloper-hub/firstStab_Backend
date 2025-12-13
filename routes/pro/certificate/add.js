
import Joi from "joi";
import { findOne, updateDocument } from "../../../helpers/index.js";
import { uploadFile } from "../../../lib/cloudinary/cloudinaryHelper.js";
import util from "util";
import fs from "fs";

const unlinkFile = util.promisify(fs.unlink);

const schema = Joi.object({
  id: Joi.string().required(),
});

const addCertificate = async (req, res) => {
  try {
    await schema.validateAsync(req.params);
    const { id } = req.params;
    const { isCompany, isUSBased, categoryId, subCategoryId, preCondition } = req.body;

    // Find professional
    const pro = await findOne("user", { _id: id, userType: "pro" });
    if (!pro) return res.status(400).json({ status: 400, message: "No Professional found" });

    const fileFields = [
      "passport","drivingLicence","selfieVideo",
      "certificationOrLicense","proofOfInsurance",
      "governmentId","companyRegistrationUrl",
      "formW9","w8BenUrl","w8BenEUrl"
    ];

    // Parallel uploads
    const uploadTasks = fileFields.map(async (field) => {
      const file = req?.files?.[field]?.[0];
      if (file?.path) {
        const uploaded = await uploadFile(file.path, `${id}_${field}`);
        req.body[field] = uploaded.secure_url;
        await unlinkFile(file.path); // Cleanup local file after upload
      }
    });

    await Promise.all(uploadTasks);

    // Conditional validations
    if (preCondition === "true" && !req.files?.selfieVideo) {
      return res.status(400).json({ status: 400, message: "Selfie video is required" });
    }


    if (isUSBased === "true" && !req.files?.formW9) {
      return res.status(400).json({ status: 400, message: "formW9 is required for US-based Pro" });
    }

    if (isUSBased === "false" && isCompany === "false" && !req.files?.w8BenUrl) {
      return res.status(400).json({ status: 400, message: "W-8BEN is required for Non-US Pro" });
    }

    if (isUSBased === "false" && isCompany === "true" &&
        (!req.files?.w8BenEUrl || !req.files?.companyRegistrationUrl)) {
      return res.status(400).json({
        status: 400,
        message: "W-8BEN-E and Company Registration are required for Non-US Companies",
      });
    }

    // Update DB
    const updated = await updateDocument(
      "proCategory",
      { proId: id, categoryId, "subCategories.id": subCategoryId },
      { status: "InActive", ...req.body }
    );

    return res.status(200).json({
      status: 200,
      data: { proCategory: updated },
    });

  } catch (e) {
    console.error("Error in addCertificate:", e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};



 export default addCertificate;