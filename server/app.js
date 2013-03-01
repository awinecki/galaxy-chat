
// Initialize collections
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

// Meteor methods/api given to clients
Meteor.methods({

	createUser: function(obj) {
		var nid = Users.insert(obj);
		console.log(nid);
		return nid;
	},

	removeUser: function(id) {
		Users.remove({_id: id});
	}

});

// What to do if server
if (Meteor.is_server) {

	// Allow users collections to be seend by cl
  Meteor.publish("users", function(id) {

    this._session.socket.on("close", function() {
			Fiber(function() {
				console.log('user disconnected.');
				Meteor.call("removeUser", id);
				Messages.insert({
					notification: true,
					content: "User disconnected.",
					time:    new Date().getTime()
				});
			}).run();
    });

    return Users.find({});
  });

  // Publish messages collection
  Meteor.publish("messages", function() {
    return Messages.find({time: {$gt: new Date().getTime()}});
  });

  // On startup flush users db data
  Meteor.startup(function() {
		Users.remove({});
  });

}

