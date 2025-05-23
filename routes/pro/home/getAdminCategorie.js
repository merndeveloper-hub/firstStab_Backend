import { find, findOne } from "../../../helpers/index.js";

const getCategories = async (req, res) => {
  const US_COUNTRIES = [
    "United States",
    "American Samoa",
    "Guam",
    "Northern Mariana Islands",
    "Puerto Rico",
    "U.S. Virgin Islands",
    "United States Minor Outlying Islands",
  ].map(country => country.toLowerCase()); // convert to lowercase for comparison

  const nonUSCategory = [
    "Film, Video & Motion Graphics",
    "Visual Arts and Graphic Design",
    "Online Marketing / Digital Advertising",
    "Company and Business Solutions",
    "Information Technology",
  ].map(category => category.toLowerCase()); // convert to lowercase

  try {
    const { id } = req.params;

    // 1. Get user and normalize country name
    const findPro = await findOne("user", { _id: id, userType: "pro" });

    if (!findPro) {
      return res.status(400).send({
        status: 400,
        message: "No pro found",
      });
    }

    const userCountry = (findPro.country || "").toLowerCase();
    const isUSUser = US_COUNTRIES.includes(userCountry);

    let categories;

    if (isUSUser) {
      // US user → show all active categories
      categories = await find("category", { status: "Active" });
    } else {
      // Non-US user → show only specific categories (case-insensitive)
      // Use regex to match case-insensitive names in $or
      categories = await find("category", {
        status: "Active",
        $or: nonUSCategory.map(name => ({
          name: { $regex: `^${name}$`, $options: "i" },
        })),
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).send({
        status: 400,
        message: "Category Not found",
      });
    }

    return res.status(200).json({ status: 200, data: { categories } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getCategories;
