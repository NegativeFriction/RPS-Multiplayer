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
  sessionStorage.setItem("Player Number", 0);
  sessionStorage.setItem("wins", 0);
  sessionStorage.setItem("losses", 0);

  var player1Throw = null;
  var player2Throw = null;
  var player1Name;
  var player2Name;

  var connectionsRef = database.ref("/connections");

  var connectedRef = database.ref(".info/connected");
  database.ref("/chat").set(null);

  connectionsRef.on("value", function(snapshot) {
    console.log("# of connections: " + snapshot.numChildren());
    if (sessionStorage.getItem("Player Number") === "0") {
      console.log("Player Number: " + snapshot.numChildren());
      sessionStorage.setItem("Player Number", snapshot.numChildren());
    }
  });

  connectedRef.on("value", function(snapshot) {
    if (snapshot.val()) {
      var con = connectionsRef.push(true);
      con.onDisconnect().remove();
    }
  });

  database.ref("/Player1").on("value", function(snapshot) {
    player1Name = snapshot.child("name").val();
    if (snapshot.child("throw").exists()) {
      player1Throw = snapshot.child("throw").val();
      //   console.log(player1Throw.val());
    } else {
      player1Throw = null;
    }
    if (player1Throw != null && player2Throw != null) {
      resolve();
    }
  });

  database.ref("/Player2").on("value", function(snapshot) {
    player2Name = snapshot.child("name").val();
    if (snapshot.child("throw").exists()) {
      player2Throw = snapshot.child("throw").val();
      console.log(player2Throw);
    } else {
      player2Throw = null;
    }
    if (player1Throw != null && player2Throw != null) {
      resolve();
    }
  });

  function mainGame() {
    // }
    if (sessionStorage.getItem("Player Number") == 1) {
      clearInterval(intervalId);
      $("#game-Info").text("You are Player 1");
      clearp2();
      player1();
    } else if (sessionStorage.getItem("Player Number") == 2) {
      clearInterval(intervalId);
      $("#game-Info").text("You are Player 2");
      player2();
    } else {
      $("#game-Info").text("Please wait to play...");
    }
  }

  function clearp2() {
    database.ref("Player2").set({
      throw: null
    });

    database.ref("/chat").set(null);
    $("#chatBox").empty();
  }

  function resolve() {
    var win11 = player1Throw === "rock" && player2Throw === "scissors";
    var win12 = player1Throw === "paper" && player2Throw === "rock";
    var win13 = player1Throw === "scissors" && player2Throw === "paper";

    var win21 = player2Throw === "rock" && player1Throw === "scissors";
    var win22 = player2Throw === "paper" && player1Throw === "rock";
    var win23 = player2Throw === "scissors" && player1Throw === "paper";

    $("#results").empty();
    $("#results").text(
      player1Name +
        " threw " +
        player1Throw +
        ". " +
        player2Name +
        " threw " +
        player2Throw
    );
    newDiv = $("<div>");
    if (win11 || win12 || win13) {
      newDiv.text(player1Name + " wins");
      console.log("player 1 wins");
      if (sessionStorage.getItem("Player Number") == 1) {
        sessionStorage.setItem(
          "wins",
          parseInt(sessionStorage.getItem("wins")) + 1
        );
      } else {
        sessionStorage.setItem(
          "losses",
          parseInt(sessionStorage.getItem("losses")) + 1
        );
      }
    } else if (win21 || win22 || win23) {
      newDiv.text(player2Name + " wins");
      console.log("Player 2 wins");
      if (sessionStorage.getItem("Player Number") == 2) {
        sessionStorage.setItem(
          "wins",
          parseInt(sessionStorage.getItem("wins")) + 1
        );
      } else {
        sessionStorage.setItem(
          "losses",
          parseInt(sessionStorage.getItem("losses")) + 1
        );
      }
    } else if (player1Throw === player2Throw) {
      newDiv.text("It's a tie!");
      console.log("It's a tie");
    } else {
      console.log("This is broken");
    }
    $("#results").append(newDiv);
    zeroOut();
  }

  var intervalId;
  intervalId = setInterval(mainGame, 1000);

  function player1() {
    $("#chatBox").empty();
    console.log("I am player 1!");

    var name = prompt("Please enter your name", "Harry Potter");
    sessionStorage.setItem("name", name);
    $("#game-Info").text("You are " + name);
    zeroOut();
    playRPS();
  }

  function player2() {
    $("#chatBox").empty();
    console.log("I am player 2!");
    var name = prompt("Please enter your name", "Ron Weasley");
    sessionStorage.setItem("name", name);
    $("#game-Info").text("You are " + name);
    zeroOut();
    playRPS();
  }

  function zeroOut() {
    database.ref("Player" + sessionStorage.getItem("Player Number")).set({
      playerNumber: sessionStorage.getItem("Player Number"),
      throw: null,
      wins: sessionStorage.getItem("wins"),
      losses: sessionStorage.getItem("losses"),
      name: sessionStorage.getItem("name")
    });
    drawStats();
  }

  function playRPS() {}

  $(document).on("click", "#submit-play", function() {
    event.preventDefault();
    console.log("Clicked");
    var threw = $("#play")
      .val()
      .trim();
    if (threw != "rock" && threw != "paper" && threw != "scissors") {
      alert(
        "Please enter rock, paper, or scissors. '" +
          threw +
          "' is not an appropriate entry."
      );
    } else {
      database.ref("Player" + sessionStorage.getItem("Player Number")).set({
        playerNumber: sessionStorage.getItem("Player Number"),
        throw: threw,
        wins: sessionStorage.getItem("wins"),
        losses: sessionStorage.getItem("losses"),
        name: sessionStorage.getItem("name")
      });
    }
  });

  function drawStats() {
    $("#wins").text("Wins: " + sessionStorage.getItem("wins"));
    $("#losses").text("Losses: " + sessionStorage.getItem("losses"));
  }

  $("#submit-chat").on("click", function() {
    var name = sessionStorage.getItem("name");
    var chat = name + ": " + $("#chatText").val();
    $("#chatText").text("");
    database.ref("/chat").push(chat);
  });

  database.ref("/chat").on("child_added", function(snapshot) {
    var newDiv = $("<div>");

    newDiv.text(snapshot.val());
    $("#chatBox").append(newDiv);
    // $("#chatBox").append($("<br>"));
    updateScroll();
  });

  function updateScroll() {
    var chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
