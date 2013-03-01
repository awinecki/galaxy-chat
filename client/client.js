
// Initialize collections
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

// Stuff to do if client
if (Meteor.is_client) {

  // On client startup
  Meteor.startup(function() {

    Session.set("username", "Andrzej");
    //console.log(Users.find({}));
    // Session.set("auth", false);
    Session.set("auth", true);

    // Dev
    var user = {
      name: "awinecki",
      color: "red"
    }
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
        Meteor.subscribe("messages");
      })
    }
  });

  // loginBox template 
  Template.loginBox.events({

    // Submit/ log in handler TODO: this is too long, 
    // kick out some of this code
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
					Meteor.subscribe("messages");
				})
      }

    }
  });

  // leaderboard template
  Template.leaderboard.messages = function() {
    return Messages.find({}, {sort: {time: 1}});
  };
  Template.leaderboard.users = function() { 
    return Users.find({}, {sort: {name: -1}}); 
  };
  Template.leaderboard.username = function() {
    if (Session.get("auth")) {
      var user = Session.get("user");
      return user.name;
    } else {
      return "nobody";
    }
  };

  // usersbox template
  Template.usersbox.users = function() { return Users.find({}, {}); };

  // user template
  Template.user.notTyping = function() { return !this.typing; };

  // typingBox template
  Template.typingBox.notTyping = function() { return !this.typing; };

  // Message template
	Template.message.content = function() {
		console.log(this.content);
		console.log(unescape(this.content));
		return unescape(this.content);
	};
  Template.message.timeFormatted = function() {
    return moment(this.time).fromNow();
  };
  Template.message.color = function() {
    return this.color || "009cde";
  };
  Template.message.events({
  });

  // authNavbox template
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

  Template.messageSendForm.events({
		// ugly hack with setTimeout. Maybe this can be done some other way?
		// TODO: check if this can be done more neat.
    // on keydown action, live refresh
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

    // send message handler
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

