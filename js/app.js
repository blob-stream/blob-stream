$(document).ready(function(){
 
$.post( "https://api.gettyimages.com/oauth2/token", 
	{ 
		"client_id ": "67tehmaz85448g2rhrxstr9z", 
		"client_secret": "d5ncA7Hzm87xJPxcT5sRQxeGxczHKQgA9KqusrYMgrejE", 
	    
	},"jsonp").done(function( data ) {
    alert( "Data Loaded: " + data );
  });
 $.get("https://api.gettyimages.com/v3/search/images" , {"Api-Key": "zkubh65j28t2kw2pufz92etx", "keyword_ids": "art"})
 .done(function( data ) {
    alert( "Data Loaded: " + data );
 });

});


 