$(document).ready(function() {
  console.log("ready");

  var config = {
    apiKey: "AIzaSyBoFBZ9NvwFmHTjqMijUnkvQNBLqFych7U",
    authDomain: "rps-multiplayer-e8679.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-e8679.firebaseio.com",
    projectId: "rps-multiplayer-e8679",
    storageBucket: "rps-multiplayer-e8679.appspot.com",
    messagingSenderId: "974770230072"
  };
  firebase.initializeApp(config);
  database = firebase.database();

  sessionStorage.clear();
  sessionStorage.setItem("connected", 0);
  sessionStorage.setItem("queNum", 0);

  var connectionsRef = database.ref("/connections");

  var connectedRef = database.ref(".info/connected");

  var queRef = database.ref("/queData");

  connectionsRef.on("value", function(snapshot) {
    console.log("# of connections: " + snapshot.numChildren());
    console.log(
      "Is this user connected? " + sessionStorage.getItem("connected")
    );
    playerQue(snapshot.numChildren());
    connectPlayer();
    if (sessionStorage.getItem("queNum") > "2") {
      console.log("You don't get to play, sorry!");
    }
  });

  queRef.on("value", function(queNums) {
    var previousValue = 0;
    var decrementFlag = 0;
    queNums.forEach(function(child) {
      console.log("Database value: " + child.val());
      console.log(
        "Initial session storage value: " + sessionStorage.getItem("queNum")
      );
      console.log("decrement Flag: ", decrementFlag);
      if (
        decrementFlag === 1 &&
        child.val() == sessionStorage.getItem("queNum")
      ) {
        sessionStorage.setItem("queNum", sessionStorage.getItem("queNum") - 1);
        console.log(
          "New session storage value: " + sessionStorage.getItem("queNum")
        );
      }
      if (
        child.val() != 1 &&
        child.val() - previousValue != 1 &&
        child.val() == sessionStorage.getItem("queNum")
      ) {
        sessionStorage.setItem("queNum", sessionStorage.getItem("queNum") - 1);
        console.log(
          "New session storage value: " + sessionStorage.getItem("queNum")
        );

        decrementFlag = 1;
      }
      previousValue = child.val();
    });
  });

  function connectPlayer() {
    if (sessionStorage.getItem("connected") < 1) {
      sessionStorage.setItem("connected", 1);
      connectedRef.on("value", function(snapshot) {
        if (snapshot.val()) {
          var con = connectionsRef.push(true);
          con.onDisconnect().remove();
          var queNum = queRef.push(sessionStorage.getItem("queNum"));
          queNum.onDisconnect().remove();
        }
      });
    }
  }

  function playerQue(numConnected) {
    if (sessionStorage.getItem("queNum") == 0) {
      sessionStorage.setItem("queNum", numConnected + 1);
      console.log(
        "This player's que number is " + sessionStorage.getItem("queNum")
      );
    } else {
      console.log(
        "This user doesn't need to change anything for their que number"
      );
    }
  }
});
