// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players  = new Meteor.Collection("players");
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

if (Meteor.is_client) {
  Meteor.startup(function () {
    //Session.set("username", "Andrzej");
    Session.set("auth", false);
  });

  Template.loginBox.events({
    'click .login-button': function () {
      console.log(this);
      var name = $('#login-name').val(),
          color = $('#login-color').val();
      if (name != '') {
        console.log(name, color);
        $('#overlay-wrapper').hide();
        Session.set("username", name);
        Session.set("color", name);
        Session.set("auth", true);
      }
    }
  });

  Template.leaderboard.messages = function () {
    return Messages.find({}, {sort: {time: 1}});
  };

  Template.message.timeFormatted = function () {
    return moment(this.time).fromNow();
  };

  Template.leaderboard.username = function () {
    if (Session.get("auth")) {
      return Session.get("username");
    } else {
      return "nobody";
    }
  };

  Template.authNavbox.username = function () {
    if (Session.get("auth")) {
      return Session.get("username");
    } else {
      return "nobody";
    }
  };

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.authNavbox.events({
    'click #input-nick': function(e) {
      e.preventDefault();
    }
  });

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click #send-message-button': function () {
      var content = $('#input-text').val();
      Messages.insert({
        author:  Session.get("username"),
        content: content,
        time:    new Date().getTime()
      });
    },
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    }
  });
}
