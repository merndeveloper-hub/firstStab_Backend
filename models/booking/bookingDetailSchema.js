import mongoose from "mongoose";
import schemaType from "../../types/index.js";

//const booking = new mongoose.Schema({

//   userId: {
//     type: schemaType.ObjectID, 
//    ref:"user",
//     required: true,
//   },
//   professsionalId: {
//     type: schemaType.ObjectID,
//     ref:"user",
//   },
//   bookServiceId: {
//     type: schemaType.ObjectID,
//     ref:"userBookServ",
//   },
//   categoryId: {
//     type: schemaType.ObjectID,
//     ref:"category",
//   },
//   subCategoryId: {
//     type: schemaType.ObjectID,
//     ref:"subCategory",
//   },

//   requestId: {
//     type: schemaType.TypeString, 
//     deafult:0,
//     required: true,
//   },
//   cancelledReason: {
//     type: schemaType.TypeString, 
//     default:""
//   },
//   serviceType: {
//     type: schemaType.TypeString, 
//    enum:['chat','video','remote','inPerson'],
//     required: true,
//   },
//   serviceName: {
//     type: schemaType.TypeString, 
  
//     required: true,
//   },
//   typeOfWork: {
//     type: schemaType.TypeString, 
  
//     required: true,
//   },
//   problemDesc: {
//     type: schemaType.TypeString, 
  
//     required: true,
//   },
//   quotesReceived: {
//     type: schemaType.TypeNumber, 
//   desfault:0,
   
//   },
//   desiredDateTime: {
//     type: schemaType.TypeDate, 
  
//     required: true,
//   },
//   serviceAssign: {
//     type: schemaType.TypeString,
//     enum: ["Professional", "Random"],
//     default: "Random",
//   },
//   serviceStatus: {
//         type: schemaType.TypeString,
//         enum: ["Cancelled", "Approved", "Completed","OnGoing"],
//         default: "OnGoing",
//       },
//   },
//   { timestamps: true }
// );

// export default booking;



const bookingDetailsSchema = new mongoose.Schema({
    ID: { type: schemaType.TypeNumber, required: true, unique: true },
    OrderType: { type: schemaType.TypeString, required: true },
    BookingDate: { type: schemaType.TypeDate, required: true },
    StartTime: { type: schemaType.TypeString, required: true },
    EndTime: { type: schemaType.TypeString, required: true },
    Total: { type: schemaType.TypeNumber, required: true },
    OurCharges: { type: schemaType.TypeNumber, required: true },
    ProfessionalPayableAmount: { type: schemaType.TypeNumber, required: true },
    Status: { type: schemaType.TypeString, required: true },
    PaymentStatus: { type: schemaType.TypeString, required: true },
    ConfirmedDateTime: { type: schemaType.TypeDate, required: true },
    PaymentDateTime: { type: schemaType.TypeDate, required: true },
    CancelReason: { type: schemaType.TypeString, default: null },
    CancellationChargesApplyTo: { type: schemaType.TypeString, default: null },
    RefundableAmount: { type: schemaType.TypeNumber, default: 0.00 },
    userBookServiceId: { type: schemaType.TypeObjectId, ref: 'userBookServ' } 
},{ timestamps: true });



export default bookingDetailsSchema;


// booking
// bookingRatings
// bookingQuotes
// bookingPayment
// bookingStatus
// bookingTimeline