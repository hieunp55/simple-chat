$(function(){
	//This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like youer browser does not support canvas!');
		return false;
	}
	
	//The URL of your web server (the port is set in app.js)
	var url='http://localhost:8080';
	
	var doc=$(document),
		win=$(window),
		canvas=$('#paper'),
		ctx=canvas[0].getContext('2d'),
		instructions=$('#instructions');
		
	//Generate an unique ID
	var id=Math.round($.now()*Math.random());
	
	//A flag for drawing activity
	var drawing=false;
	
	var clients={};
	var cursors={};//Mot lop cua 1 user 
	
	var socket=io.connect(socketURL);
	
	socket.on('moving', function(data){
		if(!data.id in clients){
			//A new user has come online, create a cursor for them
			cursors[data.id]=$('<div class="cursor">').appendTo('#cursors');
		}
		
		//MOve the mouse pointer
		cursors[data.id].css({
			'left': data.x,
			'top': data.y
		});
		
		//Is the user drawing?
		if(data.drawing && clients[data.id]){
			//Draw a line on the canvas, clients[data.id] holds
			//the previous position of this user's mose pointer
			
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
		
		//Saving ther current client state
		clients[data.id]=data;
		clients[data.id].updated=$.now();
	});
	
	var prev={};
	
	canvas.on('mousedown', function(e){
		e.preventDefault();
		drawing=true;
		prev.x=e.pageX;
		prev.y=e.pageY;
		
		//Hide the instructions
		instructions.fadeOut();
	});
	
	doc.bind('mouseup mouseleave', function(){
		drawing=false;
	});
	
	var lastEmit = $.now();
	
	doc.on('mousemove', function(e){
		if($.now()-lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit=$.now();
		}
			
		//Draw a line for the current user's movement, as it is
		//not received in the socket.on('moving') event above
			
		if(drawing){
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
				
			prev.x=e.pageX;
			prev.y=e.pageY;
		}
	});
	
	//Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		for(ident in clients){
			if($.now()-clients[ident].updated >10000){
				//Last update was more than 0 seconds age.
				//This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
	}, 10000);
	
	function drawLine(fromx, fromy, tox, toy){
		ctx.move(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}
});