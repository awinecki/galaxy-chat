
// This file contains Handlebars templating language helpers

// Escape string content
Handlebars.registerHelper('contentParse', function() {
  return new Handlebars.SafeString(this.content);
});
