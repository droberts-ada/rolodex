var app = app || {}; // create namespace for our app, if not present

// The full rolodex, full of contacts
app.Rolodex = Backbone.Collection.extend({
  model: app.Contact,
  localStorage: new Store("backbone-rolodex")
})

app.rolodex = new app.Rolodex();

// renders the full rolodex of contacts calling ContactView for each one.
app.AppView = Backbone.View.extend({
  el: '#rolodexapp',

  initialize: function () {
    this.createForm = this.$('#new-contact-form');
    // when new elements are added to the collection render then with addOne
    app.rolodex.on('add', this.addOne, this);
    app.rolodex.on('reset', this.addAll, this);
    app.rolodex.fetch(); // Loads list from local storage
  },

  events: {
    'click #create-contact-button': 'createContact'
  },

  createContact: function(e){
    if (!this.createForm.find('input.name').val().trim()) {
      return;
    }
    app.rolodex.create(this.newAttributes());

    this.clearInput();
  },

  clearInput: function() {
    this.createForm.find('input.name').val('');
    this.createForm.find('input.note').val('');
  },

  addOne: function(contact){
    var view = new app.ContactView({model: contact});
    $('#rolodex-zone').append(view.render().el);
  },

  addAll: function(){
    this.$('#todo-list').html(''); // clean the todo list
    switch(window.filter) {
      case 'pending':
      _.each(app.rolodex.remaining(), this.addOne);
      break;
      case 'completed':
      _.each(app.rolodex.completed(), this.addOne);
      break;
      default:
      app.rolodex.each(this.addOne, this);
      break;
    }
  },

  newAttributes: function(){
    return {
      name: this.createForm.find('input.name').val().trim(),
      note: this.createForm.find('input.note').val().trim()
    }
  }
});

// Router: use hashtags in the URI to filter between
// pending, completed or all tasks
app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params) {
    console.log('app.router.params = ' + params); // just for didactical purposes.
    window.filter = params.trim() || '';
    app.rolodex.trigger('reset');
  }
});

app.router = new app.Router();
Backbone.history.start();
app.appView = new app.AppView();
