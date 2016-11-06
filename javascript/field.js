var app = app || {}; // create namespace for our app, if not present

app.Field = Backbone.Model.extend({
  defaults: {
    name: 'Dflt Name',
    value: 'Dflt Value'
  }
});

app.FieldView = Backbone.View.extend({
  tagName: 'section',
  template: _.template($('#field-template').html()),

  initialize: function() {

  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));

    this.value_input = this.$('input.value');
    this.value_input.mask("(999) 999-9999");

    return this; // enable chained calls
  },

  events: {
    // TODO
  }
});

app.FieldList = Backbone.Collection.extend({
  model: app.Field,
  localStorage: new Store("backbone-rolodex")
});

// Should be initialized with an 'el' property for the contact's
// field list, and a 'model' property for the contact's FieldList
app.FieldListView = Backbone.View.extend({
  tagName: 'section',
  template: _.template($('#field-list-template').html()),

  initialize: function() {
    console.log(this.$el);
  },

  render: function() {
    console.log("In FieldListView.render()");
    this.$el.html(this.template(this.model.toJSON()));

    this.addFieldButton = this.$('button.create-field');
    this.addFieldButton.addClass('test-class');
    console.log(this.addFieldButton);

    this.fieldList = $('field-list')

    // TODO: took these from initialize, not sure if they belong here
    this.model.on('add', this.addOne, this);
    this.model.on('reset', this.addAll, this);
    this.model.fetch();

    return this; // enable chained calls
  },

  events: {
    'click button.create-field': 'createField'
  },

  createField: function() {
    console.log("Add a new field!");
  },

  addOne: function(field) {
    var view = new app.FieldView({model: field});
    this.fieldList.append(view.render().el);
  },

  addAll: function() {
    // TODO: is this ever even called?
    this.fieldList.html('');
    this.model.each(this.addOne, this);
  }
})
