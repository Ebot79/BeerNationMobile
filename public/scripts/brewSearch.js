var breweryInput = $('#brewerySearch')
			,listContainer = $('#listOfBeer')
			,beerSearch = $('#beerLookup')
			,addBeer = $('#addBeer')
			,beerModal = $('#beerModal');
			

		//typeahead 
		breweryInput.typeahead({
			name: 'brewery'
			,remote:'http://beernation.us/addBeer/brewerLookup/%QUERY'
		});
		
		

		//handlers
		//
		listContainer.on('click', 'button', function(){
			var id = $(this).attr('data-dbid')
			,name= $(this).attr('data-name')
			title = $('#modalTitle');
			beerModal.data('name',name);
			beerModal.data('brewerydbId',id);
			title.html(name);
			console.log('data dat data '+beerModal.data('name'));
			beerModal.modal('show');
			
		});
		//
		breweryInput.change(function(){
			listContainer.html("");
		});
			
		//
		beerSearch.click(function(e){
			
			console.log('beerLookup fired');
			
			var brewery = {brewery : breweryInput.val() };
			console.log(brewery.brewery);
			//ajax 
			$.get('/beerLookup/', brewery , function(data){
				
				var beers = JSON.parse(data)
					,raw = beers.data
					,buttonNode;
					
				for(var i=0; i<raw.length; i++){
					
					
					listContainer.append(buildButton(raw[i].name, raw[i].id));
					
				}
			});
			
		});
		//
		addBeer.click(function(e){
			console.log('addBeer Clicked');
			console.log(beerModal.data());
			data = {brewerydbId:beerModal.data('brewerydbId'), name: beerModal.data('name'), rate: beerModal.data('rate')};
			$.post('/addBeer',data, function(){
				console.log('success!');
			}).success(function(){
				window.location ='/home';
			});
		});
		
		$('.ratings_stars').hover( 
			function() {
				$(this).prevAll().andSelf().addClass('ratings_over');
				$(this).nextAll().removeClass('ratings_vote');   
			},
			
			function() {  
				$(this).prevAll().andSelf().removeClass('ratings_over');  
				set_votes($(this));
			}
		);
		
		$('.ratings_stars').bind('click', function() {  
			var star = this;
			set_votes(star)
		});
		
		//functions
		//
		function set_votes(star) {
			var rating =parseInt( $(star).attr('class').charAt(5))
			
			
			console.log(rating);
			beerModal.data('rate', rating);
			$(star).prevAll().andSelf().addClass('ratings_vote');  
			$(star).nextAll().removeClass('ratings_vote');
		}
		
		//
		function buildButton(name, bdid) {
			var button= '<button data-name="'+name+'" data-dbid="'+bdid+'"  data-target="#beerModal" class="btn btn-block">'+name+'</button>';
			
			return $(button);
		}
		//
		function getRate(star){};

