
Users    = new Meteor.Collection("users");
Messages = new Meteor.Collection("messages");

Meteor.methods({
	test: function() {
		return 1;
	},
	createUser: function(obj) {
		var nid = Users.insert(obj);
		console.log(nid);
		return nid;
	},

	removeUser: function(id) {
		Users.remove({_id: id});
	}
});

if (Meteor.is_server) {
  Meteor.publish("users", function(id) {

    this.session.socket.on("close", function() {
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

  Meteor.publish("messages", function() {
    return Messages.find({});
  });

  Meteor.startup(function() {
		Users.remove({});
  });
}

