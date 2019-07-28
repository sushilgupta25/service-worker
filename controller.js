var repository = require('./repository');
var controller = (function(repository){
	var getData = function(){
		repository.httpService(repository.getData, function success(data){
			// success handler
		}, function error(error){
			// error handler
		});
	}
})(repository);