"use strict";

const tmdb = require('./tmdb');
const firebaseApi = require('./firebaseApi');
const dom = require('./dom');

const pressEnter = () => {
	$(document).keypress((e) => {
		if(e.key === 'Enter'){
			let searchText = $('#searchBar').val();
			let query = searchText.replace(/\s/g, "%20");
			tmdb.searchMovies(query);
		}
	});
};

const myLinks = () => {
	$(document).click(() => {
		if(event.target.id === "navSearch"){
			$("#search").removeClass("hide");
			$("#myMovies").addClass("hide");
			$("#authScreen").addClass("hide");
		}else if(event.target.id === "mine"){
			console.log("inside mine");
			firebaseApi.getMovieList().then((results) => {
				dom.clearDom('moviesMine');
				dom.domString(results, tmdb.getImgConfig(), 'moviesMine');
				console.log(tmdb.getImgConfig());
			}).catch((err) => {
				console.log("error in getMovieList", err);
			});
			$("#search").addClass("hide");
			$("#myMovies").removeClass("hide");
			$("#authScreen").addClass("hide");
		} else if(event.target.id === "authenticate"){
			$("#search").addClass("hide");
			$("#myMovies").addClass("hide");
			$("#authScreen").removeClass("hide");
		}
	});
};

const googleAuth = () => {
	$("#googleButton").click((e) => {
		firebaseApi.authenticateGoogle().then((result) => {
			console.log("result", result);
		}).catch((err) => {
			console.log("error in authenticateGoogle", err);
		});
	});
};

module.exports = {pressEnter, myLinks, googleAuth};