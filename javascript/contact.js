var app = app || {}; // create namespace for our app, if not present

// One contact entry in our rolodex
app.Contact = Backbone.Model.extend({
  defaults: {
    name: '',
    note: '',
    image: 'http://www.fillmurray.com/300/300'
  }
});

// renders individual contacts in our rolodex
app.ContactView = Backbone.View.extend({
  tagName: 'article',
  className: function() {
    var className = 'rolodex-entry'
    // rolodex-expanded is applied directly to the core HTML
    // element, so we need to preserve it when we re-render.
    if (this.$el && this.$el.hasClass('rolodex-expanded')) {
      className += ' rolodex-expanded'
    }
    return className;
  },
  template: _.template($('#contact-template').html()),

  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
    this.model.fields = new app.FieldList();

    console.log("Before creating new FieldListView")
    this.fieldListView = new app.FieldListView({
      model: this.model.fields
    });
    console.log("After creating new FieldListView")
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));

    this.name_input = this.$('input.name');
    this.note_input = this.$('input.note');

    this.$el.append(this.fieldListView.render().el);

    return this; // enable chained calls
  },

  events: {
    'dblclick header': 'expand',
    'click .rolodex-buttons .edit': 'beginEditing',
    'click .rolodex-buttons .save': 'finishEditing',
    'keypress input.edit': 'updateOnEnter',
    'click button.destroy': 'destroy'
  },

  expand: function() {
    var target = this.$el;
    if (target.hasClass('rolodex-collapsing')) {
      // Do nothing if animation is in progress
      return;
    }

    if (target.hasClass('rolodex-expanded')) {
      console.log("Collapse");
      // Collapse
      target.addClass('rolodex-collapsing');
      this.$('.rolodex-fields').slideUp(400, function() {
        console.log("Done");
        target.removeClass('rolodex-expanded');
        target.removeClass('rolodex-collapsing');
      });

    } else {
      console.log("Expand");
      // Expand
      target.addClass('rolodex-expanded');
      target.addClass('rolodex-collapsing');
      this.$('.rolodex-fields').hide().slideDown(400, function() {
        console.log("Done");
        target.removeClass('rolodex-collapsing');
      });
    }
  },

  beginEditing: function(){
    this.$('.rolodex-buttons button.edit').addClass('hidden');
    this.$('.rolodex-buttons button.save').removeClass('hidden');
    this.$('header .display').addClass('hidden');
    this.$('header input.edit').removeClass('hidden');
  },

  finishEditing: function(){
    // The next 4 lines happen implicitly, because the view re-renders
    // when saveChanges is called. Spooky!

    // this.$('.rolodex-buttons button.save').addClass('hidden');
    // this.$('.rolodex-buttons button.edit').removeClass('hidden');
    // this.$('header input.edit').addClass('hidden');
    // this.$('header .display').removeClass('hidden');
    this.saveChanges();
  },

  saveChanges: function(){
    var changes = {};
    var name = this.name_input.val().trim();
    if (name) {
      changes["name"] = name;
    }

    var note = this.note_input.val().trim();
    if (note) {
      changes["note"] = note;
    }

    if(!_.isEmpty(changes)) {
      this.model.save(changes);
    }
  },

  updateOnEnter: function(e){
    if(e.which == 13){
      this.finishEditing();
    }
  },

  destroy: function(){
    // this isn't available in the inline function, so gotta make
    // a closure
    var destroy_me = this.model
    this.$el.slideUp(400, function () {
      destroy_me.destroy();
    });
  }
});
