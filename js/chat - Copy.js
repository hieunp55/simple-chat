//create a chat module to use
var websocketGame = {
	//indicates if it is drawing now.
	isDrawing: false,
	
	//The starting point of next line drawing.
	startX: 0,
	startY:0
}
//canvas context
var canvas = document.getElementById('drawing-pad');
var ctx = canvas.getContext('2d');


function drawLine(ctx, x1, y1, x2, y2, thickness){
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#000";
	ctx.stroke();
}
(function(){
	window.Chat = {
		socket: null,
		
		initialize: function(socketURL){
			this.socket = io.connect(socketURL);
			
			//send message on button click or enter
			$('#send').click(function(){
				Chat.send();
			});
			
			$('#message').keyup(function(evt){
				if((evt.keyCode || evt.which) == 13){
					Chat.send();
					return false;
				}
			});
			//process any incoming messages
			this.socket.on('new', this.add);
		},
		
		//Adds a new message to the chat.
		add : function(data){
			var name = data.name || 'Anonymous';
			var msg = $('<div class="msg"></div>')
				.append('<span class="name">' + name + '</span>: ')
				.append('<span class="text">' + data.msg + '</span>');
				
			$('#messages')
				.append(msg)
				.animate({scrollTop: $('#messages').prop('scrollHeight')}, 0);
		},
		
		//Send a message to the server
		//then clears it from the textarea
		send : function(){
			this.socket.emit('msg', {//send
				name: $('#name').val(),//get name of user
				msg: $('#message').val()//get content
			});
			
			$('#message').val(' ');//Clear the textarea
			
			return false;
		}
	};
}() );