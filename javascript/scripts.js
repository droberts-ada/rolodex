
var app = {}; // create namespace for our app

// todo item
app.Todo = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  },
  toggle: function() {
    this.save({ completed: !this.get('completed')});
  }
});

// todo list, composed of many items
app.TodoList = Backbone.Collection.extend({
  model: app.Todo,
  localStorage: new Store("backbone-todo"),
  completed: function() {
    return this.filter( function(todo) {
      return todo.get('completed');
    });
  },
  remaining: function() {
    return this.without.apply(this, this.completed() );
  }
});
app.todoList = new app.TodoList();



// renders individual todo items list (li)
app.TodoView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),

  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this; // enable chained calls
  },

  events: {
    'dblclick label' : 'edit',
    'keypress .edit' : 'updateOnEnter',
    'blur .edit' : 'close',
    'click .toggle': 'toggleCompleted',
    'click .destroy': 'destroy'
  },

  edit: function(){
    this.$el.addClass('editing');
    this.input.focus();
  },

  close: function(){
    var value = this.input.val().trim();
    if(value) {
      this.model.save({title: value});
    }
    this.$el.removeClass('editing');
  },

  updateOnEnter: function(e){
    if(e.which == 13){
      this.close();
    }
  },

  toggleCompleted: function(){
    this.model.toggle();
  },

  destroy: function(){
    this.model.destroy();
  }
});

// renders the full list of todo items calling TodoView for each one.
app.AppView = Backbone.View.extend({
  el: '#todoapp',

  initialize: function () {
    this.input = this.$('#new-todo');
    // when new elements are added to the collection render then with addOne
    app.todoList.on('add', this.addOne, this);
    app.todoList.on('reset', this.addAll, this);
    app.todoList.fetch(); // Loads list from local storage
  },

  events: {
    'keypress #new-todo': 'createTodoOnEnter'
  },

  createTodoOnEnter: function(e){
    if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
      return;
    }
    app.todoList.create(this.newAttributes());
    this.input.val(''); // clean input box
  },

  addOne: function(task){
    var view = new app.TodoView({model: task});
    $('#todo-list').append(view.render().el);
  },

  addAll: function(){
    this.$('#todo-list').html(''); // clean the todo list
    switch(window.filter) {
    case 'pending':
      _.each(app.todoList.remaining(), this.addOne);
      break;
    case 'completed':
      _.each(app.todoList.completed(), this.addOne);
      break;
    default:
      app.todoList.each(this.addOne, this);
      break;
    }
  },

  newAttributes: function(){
    return {
      title: this.input.val().trim(),
      completed: false
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
    app.todoList.trigger('reset');
  }
});

app.router = new app.Router();
Backbone.history.start();
app.appView = new app.AppView();
