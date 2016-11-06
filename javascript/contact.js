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
  tagName: 'section',
  template: _.template($('#contact-template').html()),

  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
    this.model.fields = new app.FieldList();

    console.log("Before creating new FieldListView")
    this.fieldListView = new app.FieldListView({
      el: this.$('.rolodex-fields'),
      model: this.model.fields
    });
    console.log("After  creating new FieldListView")
  },

  render: function() {
    template_data = this.model.toJSON();
    template_data["expanded"] = this.isExpanded();

    this.$el.html(this.template(template_data));

    this.name_input = this.$('input.name');
    this.note_input = this.$('input.note');

    return this; // enable chained calls
  },

  events: {
    'dblclick header': 'expand',
    'click .rolodex-buttons .edit': 'beginEditing',
    'click .rolodex-buttons .save': 'finishEditing',
    'keypress input.edit': 'updateOnEnter',
    'click button.destroy': 'destroy',
    'click button.create-field': 'createField'
  },

  createField: function() {
    console.log('In contact.createField')
  },

  isExpanded: function() {
    return this.$el.find('.rolodex-entry').hasClass('rolodex-expanded');
  },

  expand: function() {
    var target = this.$el.find('.rolodex-entry');
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
    this.$('.rolodex-entry header .display').addClass('hidden');
    this.$('.rolodex-entry header input.edit').removeClass('hidden');
  },

  finishEditing: function(){
    this.$('.rolodex-buttons button.save').addClass('hidden');
    this.$('.rolodex-buttons button.edit').removeClass('hidden');
    this.$('.rolodex-entry header input.edit').addClass('hidden');
    this.$('.rolodex-entry header .display').removeClass('hidden');
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
