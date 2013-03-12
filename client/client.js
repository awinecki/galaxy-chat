
// Initialize mongoDB collections
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

var ENV = 'test';


// function for scrolling chat view down
function scrollDown(selector, selector2) {
  $(selector).scrollTop($(selector2).height());
}

// Stuff to do if client
if (Meteor.is_client) {

  // On client startup
  Meteor.startup(function() {
    Session.set("auth", false);
    refreshTimes(5000);

    if (ENV == 'development') {
      var user = { 
        name:  'awinecki',
        color: '#2e95ff'
      };
      // set session
      Session.set("user", user);
      Session.set("auth", true);
      // hide login box
      $('#overlay-wrapper').fadeOut('fast');
      // focus chat input box
      $('#input-text').focus();
      // add user to chat 
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
        setTimeout(function () {
          Messages.insert({
            author:  user.name,
            color:   user.color,
            content: 'Hai there',
            time:    new Date().getTime()
          }, function() {
            scrollDown('#chat-container', '.messages-wrapper');
          });
        }, 100);
      });
    } 

  });

  // ----------------------------------------------------
  // ----------------------------------------------------
  // TEMPLATES
  // ----------------------------------------------------

  // loginBox template 
  Template.loginBox.events({

    // color choice
    'click div.color-box': function(e) {
      var el = $(e.toElement);
      $('#login-color').val(el.data('color')); // data
      $('.color-box').removeClass('selected'); // visuals
      el.addClass('selected');
    },

    // login to chat
    'submit #login-form': function (e) {
      e.preventDefault();

      var user = { // get user data
        name:  $('#login-name').val(),
        color: $('#login-color').val()
      };

      var formIsValid = (user.name && user.color); // form validation
      var nameNotTooLong = (user.name.length < 19);

      if (formIsValid) {
        if (nameNotTooLong) {
          // set session
          Session.set("user", user);
          Session.set("auth", true);
          // hide login box
          $('#overlay-wrapper').fadeOut();
          // focus chat input box
          $('#input-text').focus();
          // add user to chat 
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
          });
        } else {
          $('#login-errors').html('Username is too long (max 18 chars).');
        }
      } else {
        $('#login-errors').html('Please choose a username and color.');
      }

    }
  });


  // chat template
  Template.chat.messages = function() {
    return Messages.find({}, {sort: {time: 1}});
  };
  Template.chat.users = function() {
    return Users.find({}, {sort: {name: -1}});
  };
  Template.chat.username = function() {
    if (Session.get("auth")) {
      var user = Session.get("user");
      return user.name;
    } else {
      return "nobody";
    }
  };

  // userStripe template
  Template.userStripe.user = function() { return Session.get("user"); };

  // usersbox template
  Template.usersList.users = function() { return Users.find({}, {}); };

  // user template
  Template.user.notTyping = function() { return !this.typing; };

  // typingBox template
  Template.typingBox.notTyping = function() { return !this.typing; };

  // Message template
	Template.message.content = function() {
		return unescape(this.content);
	};
  Template.message.timeFormatted = function() {
    return moment(this.time).fromNow();
  };
  Template.message.timeM = function() {
    return moment(this.time);
  }
  Template.message.color = function() {
    return this.color || "009cde";
  };
  Template.message.events({
  });

  // messageSendForm template
  Template.messageSendForm.username = function() {
    return Session.get('username');
  }
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
					}}, function() {
            scrollDown('#chat-container', '.messages-wrapper');
          });
				} else {
					Users.update({name: user.name}, {$set: {typing: false}});
				}
			}, 1);
		},

    // send message handler
    'submit #send-msg-form': function(e) {
      e.preventDefault();
      var content = $('#input-text').val();
      if (content) {
        var user = Session.get("user");

        Users.update({name: user.name}, {$set: {typing: false}});

        $('#input-text').val('');
        var userFromDB = Users.findOne({name: user.name});
        $('#notify-' + userFromDB._id).hide();

        Users.update({name: user.name}, {$set: {
          typing: false,
          liveMsg: '' 
        }});

        Messages.insert({
          author:  user.name,
          color:   user.color,
  				content: parseContent(content),
          time:    new Date().getTime()
        }, function() {
          scrollDown('#chat-container', '.messages-wrapper');
        });
      }
    }
    
  });
}

