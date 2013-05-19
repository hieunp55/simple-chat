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
var data={};

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
				data.charOrDraw=false;
				Chat.send(data);
			});
			
			$('#message').keyup(function(evt){
				if((evt.keyCode || evt.which) == 13){
					data.charOrDraw=false;
					Chat.send(data);
					return false;
				}
			});
			
			//The logic of drawing on canvas
			$("#drawing-pad").mousedown(function(e){
				//get the mouse x and y relative to the canvas top-left point.
				websocketGame.startX = e.pageX - this.offsetLeft;
				websocketGame.startY = e.pageY - this.offsetTop;
					
				websocketGame.isDrawing = true;
			});
				
			$("#drawing-pad").mousemove(function(e){
				//draw lines when is drawing
				if(websocketGame.isDrawing){
					//get the mouse x and y relative to othe canvas top-left point
					var mouseX = e.pageX - this.offsetLeft;
					var mouseY = e.pageY - this.offsetTop;
					if(!(mouseX == websocketGame.startX 
							&& mouseY == websocketGame.startY)){
						data.startX=websocketGame.startX;
						data.startY=websocketGame.startY;
						data.endX=mouseX;
						data.endY=mouseY;
						data.charOrDraw=true;
						
						websocketGame.startX = mouseX;
						websocketGame.startY = mouseY;
						
						Chat.send(data);
					}
				}
			});
				
			$("#drawing-pad").mouseup(function(e){
				websocketGame.isDrawing = false;
			});
			//process any incoming messages
			this.socket.on('new', this.add);
		},
		
		//Adds a new message to the chat.
		add : function(data){
			if(!data.charOrDraw){
				var name = data.name || 'Anonymous';
				var msg = $('<div class="msg"></div>')
					.append('<span class="name">' + name + '</span>: ')
					.append('<span class="text">' + data.msg + '</span>');
				
				$('#messages')
					.append(msg)
					.animate({scrollTop: $('#messages').prop('scrollHeight')}, 0);
			}else{
				var info = document.getElementById ("test");
						
				drawLine(ctx, data.startX,data.startY,data.endX, data.endY, 4);
				
				info.innerHTML = "layerX: " + data.endX + " layerY: " + data.endY;
			}
		},
		
		//Send a message to the server
		//then clears it from the textarea
		send : function(data){
			if(!data.charOrDraw){
				this.socket.emit('msg', {//send
					name: $('#name').val(),//get name of user
					msg: $('#message').val(),//get content
					charOrDraw: false
				});
			
				$('#message').val(' ');//Clear the textarea
			}else{
				this.socket.emit('msg', {//send
					name: $('#name').val(),//get name of user
					startX: data.startX,
					startY: data.startY,
					endX: data.endX,
					endY: data.endY,
					charOrDraw: true
				});
			}
			return false;
		}
	};
}() );