(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

const tmdb = require('./tmdb');
const firebaseApi = require('./firebaseApi');

const apiKeys = () => {
	// promise
	return new Promise((resolve, reject) => {
		$.ajax('./db/apiKeys.json').done((data) => {
			resolve(data.apiKeys);
		}).fail((error) => {
			reject(error);
		});
	});
};

const retrieveKeys = () => {
	apiKeys().then((results) => {
		tmdb.setKey(results.tmdb.apiKey);
		firebaseApi.setKey(results.firebaseKeys);
		firebase.initializeApp(results.firebaseKeys);
	}).catch((error) => {
		console.log('error in retrieve keys', error);
	});
};

module.exports = {retrieveKeys};
},{"./firebaseApi":4,"./tmdb":6}],2:[function(require,module,exports){
"use strict";

const domString = (movieArray, imgConfig, divName) => {
	console.log("divName", divName);
	console.log("imgConfig", imgConfig);
	console.log("movieArray", movieArray);
	let domStrang = '';
	for (let i = 0; i < movieArray.length; i++) {
		if (i % 3 === 0) {
			// console.log(i % 3);
			domStrang += `<div class="row">`;
		}
		domStrang += `<div class="col-sm-6 col-md-4 movie">`;
		domStrang +=   `<div class="thumbnail">`;
		domStrang +=     `<img src="" alt="">`;
		domStrang +=     `<div class="caption">`;
		domStrang +=       `<img class="poster_path" src="${imgConfig.base_url}w342/${movieArray[i].poster_path}">`;
		domStrang +=       `<h3 class="title">${movieArray[i].title}</h3>`;
		domStrang +=       `<p class="overview">${movieArray[i].overview}</p>`;
		domStrang +=       `<p><a href="#" class="btn btn-primary" role="button">Review</a> <a class="btn btn-default wishlist" role="button">Wishlist</a></p>`;
		domStrang +=     `</div>`;
		domStrang +=   `</div>`;
		domStrang += `</div>`;
		if (i % 3 === 2 || i === movieArray.length -1) {
			domStrang += `</div>`;
		}
	}
	printToDom(domStrang, divName);
};

const printToDom = (strang, divName) => {
	console.log("string", strang, divName);
	$(`#${divName}`).append(strang);
};

const clearDom = (divName) => {
	$(`#${divName}`).html('');
};

module.exports = {domString, clearDom};
},{}],3:[function(require,module,exports){
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

const wishListEvents = () => {
	$('body').on('click', '.wishlist', (e) => {
		console.log('wishlist event', e);
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






module.exports = {pressEnter, myLinks, googleAuth, wishListEvents};
},{"./dom":2,"./firebaseApi":4,"./tmdb":6}],4:[function(require,module,exports){
"use strict";

let firebaseKey = "";
let userUid = "";

const setKey = (key) => {
	firebaseKey = key;
};

//Firebase: GOOGLE - Use input credentials to authenticate user.
let authenticateGoogle = () => {
	return new Promise((resolve, reject) => {
	  var provider = new firebase.auth.GoogleAuthProvider();
	  firebase.auth().signInWithPopup(provider)
	    .then((authData) => {
	    	userUid = authData.user.uid;
	        resolve(authData.user);
	    }).catch((error) => {
	        reject(error);
	    });
	});
};

const getMovieList = () => {
	let movies = [];
	return new Promise((resolve, reject) => {
		$.ajax(`${firebaseKey.databaseURL}/movies.json?orderBy="uid"&equalTo="${userUid}"`).then((fbMovies) => {
			if(fbMovies != null){
				Object.keys(fbMovies).forEach((key) => {
				fbMovies[key].id = key;
				movies.push(fbMovies[key]);
				});
			}
			
			resolve(movies);
		}).catch((err) => {
			reject(err);
		});
	});
};

const saveMovie = (movie) => {
	movie.uid = userUid;
	return new Promise((resolve, reject) => {
		$.ajax({
			method: "POST",
			url: `${firebaseKey.databaseURL}/movies.json`,
			data: JSON.stringify(movie)
		}).then((result) => {
			resolve(result);
		}).catch((error) => {
			reject(error);
		});
	});
};














module.exports = {setKey, authenticateGoogle, getMovieList, saveMovie};
},{}],5:[function(require,module,exports){
"use strict";

let events = require('./events');
let apiKeys = require('./apiKeys');

apiKeys.retrieveKeys();
events.myLinks();
events.googleAuth();
events.pressEnter();
events.wishListEvents();
},{"./apiKeys":1,"./events":3}],6:[function(require,module,exports){
"use strict";

let tmdbKey;
let imgConfig;
const dom = require('./dom');

const searchTMDB = (query) => {
	// promise search movies
	return new Promise((resolve, reject) => {
		$.ajax(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&language=en-US&page=1&include_adult=false
&query=${query}`).done((data) => {
			resolve(data.results);
		}).fail((error) => {
			reject(error);
		});
	});
};

const tmdbConfiguration = () => {
	return new Promise((resolve, reject) => {
		$.ajax(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`).done((data) => {
			resolve(data.images);
		}).fail((error) => {
			reject(error);
		});
	});
};

const getConfig = () => {
	tmdbConfiguration().then((results) => {
		imgConfig = results;
		console.log(imgConfig);
	}).catch((error) => {
		console.log("Error in getConfig", error);
	});
};

const searchMovies = (query) => {
	searchTMDB(query).then((data) => {
		showResults(data);
	}).catch((error) => {
		console.log("error in search Movies", error);
	});
};

const setKey = (apiKey) => {
	// sets tmdbKey
	tmdbKey = apiKey;
	getConfig();
};

const showResults = (movieArray) => {
	dom.clearDom('movies');
	dom.domString(movieArray, imgConfig, 'movies');
};

const getImgConfig = () => {
	return imgConfig;
};

module.exports = {setKey, searchMovies, getImgConfig};




},{"./dom":2}]},{},[5]);
