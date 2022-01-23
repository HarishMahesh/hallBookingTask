var express = require("express");
var router = express.Router();

/* post request to create a room

required input for creating room
{
    name, - it will be unique
    capacity,
    anmities, - it will accept array of values
    pricePerHour,
} */
const roomData = []; //room details are stored here in above mentioned format
const bookingDetails = [];

router.post("/create-room", (req, res) => {
  let data = roomData.find((val) => val.name === req.body.name); // to check whether name is available allready

  if (data) {
    res.json({
      message: "room name allready exists- room creation unsuccessful",
    });
  } else {
    let { name, capacity, anmities, pricePerHour } = req.body;
    roomData.push({ name, capacity, anmities, pricePerHour });
    res.json({
      message: "room created successfully",
      values: { name, capacity, anmities, pricePerHour },
    });
  }

  console.log(roomData);
});

/* post request to book a room
required details to book room 
{
    custName,
    date, - in the format ('YYYY/MM/DD') eg 2022/01/30
    startTime, - in the format ('HH:MM') eg 10:30 - time in 24 hours format
    endTime, - in the format ('HH:MM') eg 10:30 - time in 24 hours format
}

room id to be booked to be passed in the endpoint as param
*/

router.post("/book-room/:roomId", (req, res) => {
  let roomId = req.params.roomId;
  let { custName, date, startTime, endTime } = req.body;

  let [year, month, day] = date.split("/").map(Number);
  --month;
  console.log(year, month, day);
  let [hour1, minutes1] = startTime.split(":").map(Number);
  let [hour2, minutes2] = endTime.split(":").map(Number);

  let g1 = new Date(year, month, day, hour1, minutes1).getTime(); // to convert time into numeric value and to compare
  let g2 = new Date(year, month, day, hour2, minutes2).getTime(); // to convert time into numeric value and to compare

  let isRoomAvailable = roomData.find((val) => val.name === roomId);

  let timeAvalibale = true;

  function checkTimeavailable(roomid) {
    for (let i in bookingDetails) {
      let { roomId, sTime, eTime } = bookingDetails[i];
      if (roomId === roomid) {
        if (!((g1 < sTime || g1 >= eTime) && (g2 < sTime || g2 > eTime))) {
          timeAvalibale = false;
          return timeAvalibale;
        }
      }
    }

    return timeAvalibale;
  }

  if (!isRoomAvailable) {
    res.json({ message: "Room does not exists " });
  } else {
    if (g1 > g2) {
      res.json({ message: "end time should be greater than start time" });
    } else {
      console.log(checkTimeavailable(roomId));
      if (!checkTimeavailable(roomId)) {
        res.json({ message: "specified time slot is not avaialable" });
      } else {
        bookingDetails.push({
          custName: custName,
          date: date,
          startTime: startTime,
          endTime: endTime,
          sTime: g1,
          eTime: g2,
          bookingStatus: "booked",
          roomId: roomId,
        });

        res.json({
          message: "booking sucessfull",
          values: {
            custName: custName,
            date: date,
            startTime: startTime,
            endTime: endTime,
            sTime: g1,
            eTime: g2,
            bookingStatus: "booked",
            roomId: roomId,
          },
        });
      }
    }
  }

  console.log(bookingDetails);
});

//list all customers with booked data

router.get("/all-bookings", (req, res) => {
  let data = [];
  console.log("hi");
  data = bookingDetails.map((val) => {
    return {
      custName: val.custName,
      date: val.date,
      startTime: val.startTime,
      endTime: val.endTime,
      roomId: val.roomId,
    };
  });
  console.log(data);
  res.json({ message: "fetch sucessfull", data: data });
});

// list room with booked data

router.get("/all-bookings/:roomName", (req, res) => {
  let roomid = req.params.roomName;
  let data = [];

  let filteredData = bookingDetails.filter((val) => val.roomId === roomid);
  data = filteredData.map((val) => {
    return {
      roomId: val.roomId,
      bookingStatus: val.bookingStatus,
      custName: val.custName,
      date: val.date,
      startTime: val.startTime,
      endTime: val.endTime,
    };
  });

  res.json({ message: "fetch sucessful", data: data });
});
module.exports = router;
