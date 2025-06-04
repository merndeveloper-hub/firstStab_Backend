
import { find, findOne, insertNewDocument, updateDocument } from "../../../helpers/index.js";

const updateServiceType = async (req, res) => {
  const { id: proId } = req.params; // proId
  const { subCategories } = req.body;

let getSubCategories = subCategories[0].id

  try {
 const proCategories = await findOne("proCategory", { proId, "subCategories.id": getSubCategories});
console.log("proCategories",proCategories);

if (!proCategories || proCategories.length === 0) {
  return res.status(404).json({ message: "ProCategory not found for this proId" });
}


   const updateCategory = await updateDocument("proCategory",{proId, "subCategories.id": getSubCategories},
       {
      
        ...req.body,
       

      });


//let isUpdated = false;

// for (const proCategory of proCategories) {
//   for (const subCat of subCategories) {
//     const index = proCategory.subCategories.findIndex(
//       (sc) => sc.id == subCat.id
//     );


 

//   if (index !== -1) {
//     const existing = proCategory.subCategories[index];

//     proCategory.subCategories[index] = {
//       ...existing,
//       id:proCategory.subCategories[index].id,
//       isChat: subCat.isChat !== undefined ? subCat.isChat == true : existing.isChat,
//       isVirtual: subCat.isVirtual !== undefined ? subCat.isVirtual == true : existing.isVirtual,
//       isRemote: subCat.isRemote !== undefined ? subCat.isRemote == true : existing.isRemote,
//       isInPerson: subCat.isInPerson !== undefined ? subCat.isInPerson == true : existing.isInPerson,
//     };

//     isUpdated = true;
//   }
// //   else{
// // console.log(proCategories,"existing");
// //     await insertNewDocument('proCategory',{...proCategories ,
// //          subCategories: {
// //            id: subCat.id,
// //            ...(subCat.isChat !== undefined && { isChat: flags.isChat }),
// //            ...(subCat.isVirtual !== undefined && { isVirtual: flags.isVirtual }),
// //            ...(subCat.isRemote !== undefined && { isRemote: flags.isRemote }),
// //            ...(subCat.isInPerson !== undefined && { isInPerson: flags.isInPerson })}

// //          })
         
        
  
    
    
    
 
  

//     }

//       await updateDocument("proCategory", { _id: proCategory._id }, {
//         subCategories: proCategory.subCategories,
//       });
//     }
  


// if (!isUpdated) {
  
//   return res.status(404).json({ message: "No matching subcategory found to update" });
// }

return res.status(200).json({
  message: "Subcategories updated successfully",
});

  } catch (error) {
    console.error("Error in updateServiceType:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export default updateServiceType;