// import { getAggregate } from "../../../helpers/index.js";

// const getProCategory = async (req, res) => {
// // console.log(req.query.page,"req.query.page");

// //   const page = parseInt(req.query.page) || 1; // Default to page 1
// //   console.log(page,"page");
  
// // const limit = 5; // Show 5 subcategories per page
// // const skip = (page - 1) * limit;
// // console.log(skip,"skip");

//   try {

//    const {categoryId,subCategoryId,serviceType} = req.body
//     const categories = await getAggregate("proCategory", [
   
//     {
//       $match: {
//         categoryId: categoryId, // Match categoryId
//         "subCategories.id": subCategoryId, // Match subCategoryId
//       },
//     },
//     {
//       $addFields: {
//         filteredSubCategories: {
//           $filter: {
//             input: "$subCategories",
//             as: "subCat",
//             cond: {
//               $and: [
//                 { $eq: ["$$subCat.id", subCategoryId] }, // Match subCategoryId
//                 {
//                   $or: serviceTypeFilters.map((field) => ({
//                     [`$$subCat.${field}`]: true, // Check if any service type is true
//                   })),
//                 },
//               ],
//             },
//           },
//         },
//       },
//     },
//     {
//       $match: {
//         "filteredSubCategories.0": { $exists: true }, // Ensure at least one filtered subcategory exists
//       },
//     },
//     {
//       $project: {
//         categoryId: 1,
//         subCategories: "$filteredSubCategories", // Return only filtered subcategories
//         price: 1,
//         rating: 1,
//         createdAt: 1,
//         updatedAt: 1,
//       },
//     },  
  
//   ]);
//     // console.log(categories,"categories");

// //     const findCategorie = await findOne("proCategory",{categoryId:categoryId})
// //   if(!findCategorie){
// //   return res
// //   .status(400)
// //   .json({ status: 400, message: "No Categorie Found"}); 
// // }

// // console.log(req.body.subCategories.id,"req.body.subCategories.id");
// // console.log([req.body.serviceType],"checkintype");


// // //const findSubCategorie = await findOne("subCategory",{_id: req.body.subCategories.id})
// // const findSubCategorie = await findOne("subCategory", {
// //   _id: req.body.subCategories.id,
// //   [req.body.subCategories.serviceType]: true // Dynamically check serviceType key
// // }); 

// // console.log(findSubCategorie,"findSubCategorie");

// // if(!findSubCategorie){
// //   return res
// //   .status(400)
// //   .json({ status: 400, message: "No Sub Categorie Found"}); 
// // }
    
//     return res.status(200).json({ status: 200, data:{categories} });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ status: 500, message: e.message });
//   }
// };

// export default getProCategory;


