if (Meteor.is_client) {

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

}