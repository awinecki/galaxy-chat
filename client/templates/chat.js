if (Meteor.is_client) {

	// chat template
	// -------------------------------------------
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
	// -------------------------------------------
	Template.userStripe.user = function() { return Session.get("user"); };


	// usersbox template
	// -------------------------------------------
	Template.usersList.users = function() { return Users.find({}, {}); };


	// user template
	// -------------------------------------------
	Template.user.notTyping = function() { return !this.typing; };


	// typingBox template
	// -------------------------------------------
	Template.typingBox.notTyping = function() { return !this.typing; };


	// Message template
	// -------------------------------------------
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


	// messageSendForm template
	// -------------------------------------------
	Template.messageSendForm.username = function() {
	  return Session.get('username');
	}
	// messageSendForm events
	Template.messageSendForm.events({
		// ugly hack with setTimeout.
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