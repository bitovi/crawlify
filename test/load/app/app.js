steal("can", "./product.js", "./app.mustache", "can/route/pushstate", function(can, Product, tmpl) {
	can.route.bindings.pushstate.root = "/load/"
	can.route(":id");

	can.route.bind("change", function(ev, attr, how, newVal) {
		if(attr === "id" && how !== "remove") {
			crawlify.stop();
			Product.findAll({}).then(function(products) {
				state.attr("products", products);
				crawlify.start();
			});
		} else if(attr === "id" && how === "remove") {
			state.attr("products", []);
		}
	});

	var state = new can.Map({
		products: []
	});

	var frag = tmpl(state);
	$("#app").html(frag);

	can.route.ready();
});
