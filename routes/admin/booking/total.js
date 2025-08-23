import { find } from "../../../helpers/index.js";

const findBooking = async (req, res) => {
  try {
    console.log("in----------");

    const findBooking = await find('userBookServ')

    const findBookingPending = await find('userBookServ', { status: 'Pending' })

    const findBookingConfirmed = await find('userBookServ', { status:'Confirmed'  })

    const findBookingCompleted = await find('userBookServ', { status:'Completed'  })

    const findBookingReshedule = await find('userBookServ', { orderRescheduleStatus:'Requested' || 'Accepted' || 'Completed'  })

    // if (!findUser || findUser.length === 0) {
    //   return res.status(400).send({
    //     status: 400,
    //     message: "No Users found",
    //   });
    // }
    const counts = {
      Pending: findBookingPending.length || 0,
      Confirmed: findBookingConfirmed.length || 0,
      Completed: findBookingCompleted.length || 0,
      Reshdedule:findBookingReshedule.length || 0,
      TotalBooking: findBooking.length || 0
    };
    return res.status(200).json({ status: 200, data: { counts } });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default findBooking;





















