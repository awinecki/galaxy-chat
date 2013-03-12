
// Initialize mongoDB collections
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

// change this to development, for easier dev. No logging.
var ENV = 'production';

// Stuff to do if client
if (Meteor.is_client) {

  // On client startup
  Meteor.startup(function() {
    Session.set("auth", false);
    refreshTimes(5000);

    // ugly code, just for development
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

}
