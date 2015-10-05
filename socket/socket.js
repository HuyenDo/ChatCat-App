//client server side
module.exports = function(io, rooms){
	//accepting the connection from the front end for the 'roomlist' event in the chatrooms.html
	var chatRooms = io.of('/roomlist').on('connection', function(socket){
		console.log("Connection establish on the server for the 'room list event on chatrooms.html");
		//Update and display the list of room to the user once the connection establish
		//and As long as the user have not log out, the list of rooms still updates to the user
		socket.emit('roomupdate',JSON.stringify(rooms));

		//listen to the 'newroom'event  emitted from the 'chatrooms' client site
		//and the data here is the object that holds: room_name, and room_number
		socket.on('newroom', function(data){

			//append the data into the array
			rooms.push(data);
			//create an event to update the name of the rooms on the site to all online users
			//and convert the data from an array to string
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			//update the new room to the one that created the room
			socket.emit('roomupdate',JSON.stringify(rooms));
			console.log("Create new room: "+JSON.stringify(data.room_name));
			
		} )
	})

	//accepting connection from the front end for the 'messages' event in room.html
	var messages = io.of('/messages').on('connection', function(socket){
		console.log("Connection established on the server for the 'messages' io event on rooms.html");
	
		//listen to the 'joinroom' event from the front end(room.html)
		socket.on('joinroom', function(data){
			socket.username = data.user;
			socket.userPic = data.userPic;
			//allow the active user to join the particular partition
			//so that one can chat to the other users who are also joining the room
			socket.join(data.room);
			updateUserList(data.room, true)
		})

			//listen to the 'newMessage' event from the room.html
		socket.on('newMessage', function(data){
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
		})
		

		//update the actives users in the room
		function updateUserList(room, updateAll){
		 	var ObtainUser = io.of('/messages').clients(room);
			var userList =[];
			for(var i in ObtainUser){
				userList.push({user:ObtainUser[i].username, userPic:ObtainUser[i].userPic});
			}
			socket.to(room).emit('updateUsersList', JSON.stringify(userList));
			
			//update to all users so that all user can see who are online
			//if not only the new-entering user could see all online users
			if(updateAll){
				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
			}
		}


		socket.on('updateList', function(data){
			updateUserList(data.room);
		})

	})

}