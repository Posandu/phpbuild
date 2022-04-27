import _ from "underscore";
const $ = (el) => document.querySelector(el);

$("#test").onclick = () => {
	$("#test").innerHTML = _.map([1, 2, 3], (n) => n * 2).join(", ");
};
