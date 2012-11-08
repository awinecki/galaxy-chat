
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

// Utilities
// TODO: kick this out to a different file, make some structure
// for God's sake!
// =============
Handlebars.registerHelper('contentParse', function() {
  return new Handlebars.SafeString(this.content);
});

function parseLinks(string) {
    return string
			.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/gi, "<img src='$1' />");
			//.replace(/(((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?))/gi, "<a href='$1'>$1</a>");
};
// ============= end of spaghetti code (just kidding ;p)

if (Meteor.is_client) {
  Meteor.startup(function() {
    //Session.set("username", "Andrzej");
    //console.log(Users.find({}));
    Session.set("auth", false);
  });

  // client: autosubscribe to the count for the current room
  //Meteor.autosubscribe(function () {
  Meteor.subscribe("messages");
  //});

  Template.loginBox.events({
		'submit #login-form': function (e) {
      e.preventDefault();
      var user = {
        name:  $('#login-name').val(),
        color: $('#login-color').val()
      };
      if (user.name != '') {
        $('#overlay-wrapper').fadeOut();
        $('#top-nav-stripe').fadeIn();
        Session.set("user", user);
        Session.set("auth", true);
        $('#overlay-wrapper').fadeOut();
        $('#top-nav-stripe').fadeIn();
				//document.getElementById('send-msg-form').scrollIntoView(true); //ugly
				$('#input-text').focus();
				Meteor.call('createUser', {
					name:   user.name,
					color:  user.color,
					online: true,
					typing: false
				}, function(err, data) {
					if (err) console.log(err);
					Session.set('_id', data);
					Meteor.subscribe("users", data);
				})
      }

    }
  });

  // usersbox template ****
  // **********************
  Template.leaderboard.messages = function() {
    return Messages.find({}, {sort: {time: 1}});
  };
  Template.leaderboard.users = function() { return Users.find({}, {sort: {name: -1}}); };

  // usersbox template ****
  // **********************
  Template.usersbox.users = function() { return Users.find({}, {}); };

  // user template ********
  // **********************
  Template.user.notTyping = function() { return !this.typing; };

  // typingBox template ***
  // **********************
  Template.typingBox.notTyping = function() { return !this.typing; };

  // Message template *****
  // **********************
	Template.message.content = function() {
		console.log(this.content);
		console.log(unescape(this.content));
		return unescape(this.content);
	};
  Template.message.timeFormatted = function() {
    return moment(this.time).format("LLLL") + " (" + moment(this.time).fromNow() + ")";
  };
  Template.message.color = function() {
    return this.color || "009cde";
  };
  Template.message.events({
    'click .single-message': function() {
			console.log('click!');
    }
  });

  Template.leaderboard.username = function() {
    if (Session.get("auth")) {
      var user = Session.get("user");
      return user.name;
    } else {
      return "nobody";
    }
  };

  Template.authNavbox.username = function() {
    if (Session.get("auth")) {
      return Session.get("username");
    } else {
      return "nobody";
    }
  };

  Template.authNavbox.events({
    'click #input-nick': function(e) {
      e.preventDefault();
    }
  });

  Template.leaderboard.events({
		// ugly hack with setTimeout. Maybe this can be done some other way?
		// TODO: check if this can be done more neat.
		'keydown #input-text': function() {
			setTimeout(function() {
				var user = Session.get("user"),
						text = $('#input-text').val();
				if (text) {
					Users.update({name: user.name}, {$set: {
						typing: true,
						liveMsg: text
					}});
				} else {
					Users.update({name: user.name}, {$set: {typing: false}});
				}
			}, 1);
		},
    'submit #send-msg-form': function(e) {
      e.preventDefault();
      var user = Session.get("user");
      var content = $('#input-text').val();
      var userFromDB = Users.findOne({name: user.name});
      $('#notify-' + userFromDB._id).hide();
      Messages.insert({
        author:  user.name,
        color:   user.color,
				content: parseLinks(content),
        time:    new Date().getTime()
      });
      $('#input-text').val('');
    }
  });
}

