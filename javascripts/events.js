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
			firebaseApi.getMovieList().then((results) => {
				dom.clearDom('moviesMine');
				dom.domString(results, tmdb.getImgConfig(), 'moviesMine', false);
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

const wishListEvents = () => {
	$('body').on('click', '.wishlist', (e) => {
		let mommy = e.target.closest('.movie');


		let newMovie = {
			"title":$(mommy).find('.title').html(),
			"overview":$(mommy).find('.overview').html(),
			"poster_path":$(mommy).find('.poster_path').attr('src').split('/').pop(),
			"rating": 0,
			"isWatched": false,
			"uid": ""
		};
		
		firebaseApi.saveMovie(newMovie).then((results) => {
			$(mommy).remove();
		}).catch((err) => {
			console.log("error in saveMovie", err);
		});
	});
};

const reviewEvents = () => {
	$('body').on('click', '.review', (e) => {
		let mommy = e.target.closest('.movie');

		let newMovie = {
			"title":$(mommy).find('.title').html(),
			"overview":$(mommy).find('.overview').html(),
			"poster_path":$(mommy).find('.poster_path').attr('src').split('/').pop(),
			"rating": 0,
			"isWatched": true,
			"uid": ""
		};
		
		firebaseApi.saveMovie(newMovie).then((results) => {
			$(mommy).remove();
		}).catch((err) => {
			console.log("error in saveMovie", err);
		});
	});
};

const deleteMovie = () => {
	$('body').on('click', '.delete', (e) => {
		let movieId = $(e.target).data('firebase-id');
		firebaseApi.deleteMovie(movieId).then((results) => {
			console.log("results", results);
		}).catch((error) => {
			console.log("error in deleteMovie", error);
		});
	});
};

const init = () => {
	myLinks();
    googleAuth();
    pressEnter();
    wishListEvents();
    reviewEvents();
    deleteMovie();
};




module.exports = {pressEnter, myLinks, googleAuth, wishListEvents, reviewEvents, init};