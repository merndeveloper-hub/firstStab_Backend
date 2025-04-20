const { find } = require("../../../helpers");

const getdata = async (req, res) => {
  try {
    const data = await find("allowlist", {});
    if (!data || data.length < 0) {
      return res
        .status(404)
        .json({ status: 404, message: "Oops! No data found " });
    }
    return res.status(200).json({ status: 200, message: data });
  } catch (error) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

module.exports = getdata;
