
// required modules
var Http = require( 'http' ),
    Router = require( 'router' ),
    server,
    router;
var BodyParser = require( 'body-parser' );
var firebase = require('firebase');
//var admin = require("firebase-admin");

router = new Router();
router.use( BodyParser.text() );
router.use( BodyParser.raw() );
router.use( BodyParser.json());
router.use( BodyParser.urlencoded({ extended: false }));

server = Http.createServer( function( request, response ) {
  router( request, response, function( error ) {
    if ( !error ) {
      response.writeHead( 404 );
    } else {
      // Handle errors
      console.log( error.message, error.stack );
      response.writeHead( 400 );
    }
    response.end( '\n' );
  });
});

server.listen( 3000, function() {
  console.log( 'Listening on port 3000' );
});

// Initialize Firebase
 var config = {
   apiKey: "AIzaSyBq1iqpztZjwsoJ7BDY00fnlH88odWH8jo",
   authDomain: "todo-list-d4dfc.firebaseapp.com",
   databaseURL: "https://todo-list-d4dfc.firebaseio.com",
   projectId: "todo-list-d4dfc",
   storageBucket: "todo-list-d4dfc.appspot.com",
   messagingSenderId: "132140618099"
 };
 firebase.initializeApp(config);

 var counter = 0,
     userId = 0,
     todoList = {};

 var userRef = firebase.database().ref('user' +userId);

// 1. Add a todo item
function createItem( request, response ) {
  var todoId = counter += 1;
  var todoItem = request.body;

  console.log( 'Create item', todoId);

  userRef.push({
    todo_Item:todoItem,
  });

  userRef.once("child_added").then(function(snap){
    var addItem = snap.key;
    console.log('Create item', addItem);
  });

  todoList[ todoId ] = todoItem;

  response.writeHead( 201, { //status code
    'Content-Type' : 'application/json', //msg headers: status msg
    'Location' : '/todo/' + todoId
  });
  response.end( JSON.stringify() ); //callback data
}
router.post( '/todo', createItem );


// 2. Read a todo item
function readItem( request, response ) {
  var todoId = request.params.id,
      todoItem = todoList[ todoId ];

  if ( typeof todoItem !== 'object') {
    console.log( 'Item not found', todoId );
    response.writeHead( 404 );
    response.end( '\n' );
    return;
  }
  console.log( 'Read item ', todoId,  '\n', todoItem);

  response.writeHead( 200, {
    'Content-Type' : 'text/plain'
  });
  response.end( JSON.stringify() );
}
router.get( '/todo/:id', readItem );

// 3. Delete a todo item
function deleteItem( request, response ) {
  var todoId = request.params.id;

  if ( typeof todoList[ todoId ] !== 'object' ) {
    console.log( 'Delete Unsuccessful! Item ', todoId, ' not found');
    response.writeHead( 404 );
    response.end( '\n' );
    return;
  }

  console.log( 'Success! Deleted Item', todoId);
  userRef.once("child_added").then(function(snap){
    var addItem = snap.key;
    var todoRef = userRef.child(addItem);
    todoRef.remove();
  });

  todoList[ todoId ] = undefined; //remove item from todolist

  response.writeHead( 200, {
    'Content-Type' : 'application/json'
  });
  response.end( JSON.stringify() );
}
router.delete( '/todo/:id', deleteItem );

// 4. List todo items
function readList( request, response ) {
  var todoItem,
      itemList = [],
      listString;

  for ( id in todoList ) {
    if ( !todoList.hasOwnProperty( id ) ) {
      continue;
    }
    todoItem = todoList[ id ];

    if ( typeof todoItem !== 'object' ) {
      continue;
    }

    itemList.push( todoItem );
  }
  userRef.on('value', function(snapshot){
    console.log('Read List: \n', snapshot.val());
  });

  listString = itemList.join( '\n' );

  response.writeHead( 200, {
    'Content-Type' : 'application/json'
  });
  response.end( JSON.stringify() );
}
router.get( '/todo', readList );

// 5. Update todo item
function updateItem( request, response ){
  var todoId = request.params.id,
      todo_Item = request.body;

  if ( typeof todoList[ todoId ] !== 'object' ) {
    console.log( 'Item not found', todoId );
    response.writeHead( 404 );
    response.end( '\n' );
    return;
  }

  console.log( 'Update item', todoId, todo_Item );

  userRef.once("child_added").then(function(snap){
    var addItem = snap.key;
    var todoRef = userRef.child(addItem);
    todoRef.update({
      todo_Item
    });
  });

  todoList[ todoId ] = todo_Item;
  response.writeHead( 201, {
    'Content-Type' : 'application/json',
    'Location' : '/todo/' + todoId
  });
  response.end( JSON.stringify());
}
router.put( '/todo/:id', updateItem );
router.get( '/todo', readList );
