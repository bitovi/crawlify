steal("can", function(can) {

	return can.Model.extend({

		findAll: "GET /api/products"

	}, {});

});
