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

const domString = (movieArray, imgConfig) => {
	let domStrang = '';
	for (let i = 0; i < movieArray.length; i++) {
		if (i % 3 === 0) {
			// console.log(i % 3);
			domStrang += `<div class="row">`;
		}
		domStrang += `<div class="col-sm-6 col-md-4">`;
		domStrang +=   `<div class="thumbnail">`;
		domStrang +=     `<img src="" alt="">`;
		domStrang +=     `<div class="caption">`;
		domStrang +=       `<img src="${imgConfig.base_url}w300${movieArray[i].poster_path}">`;
		domStrang +=       `<h3>${movieArray[i].original_title}</h3>`;
		domStrang +=       `<p>${movieArray[i].overview}</p>`;
		domStrang +=       `<p><a href="#" class="btn btn-primary" role="button">Review</a> <a href="#" class="btn btn-default" role="button">Watchlist</a></p>`;
		domStrang +=     `</div>`;
		domStrang +=   `</div>`;
		domStrang += `</div>`;
		if (i % 3 === 2 || i === movieArray.length -1) {
			domStrang += `</div>`;
		}
	}
	printToDom(domStrang);
};

const printToDom = (strang) => {
	$('#movies').append(strang);
};

const clearDom = () => {
	$('#movies').html('');
};

module.exports = {domString, clearDom};
},{}],3:[function(require,module,exports){
"use strict";

const tmdb = require('./tmdb');

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

module.exports = {pressEnter, myLinks};
},{"./tmdb":6}],4:[function(require,module,exports){
"use strict";

let firebaseKey = "";

const setKey = (key) => {
	firebaseKey = key;
};

module.exports = {setKey};
},{}],5:[function(require,module,exports){
"use strict";

let events = require('./events');
let apiKeys = require('./apiKeys');

apiKeys.retrieveKeys();
events.myLinks();
events.pressEnter();
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
	// dom.domString
	dom.clearDom();
	dom.domString(movieArray, imgConfig);
};

module.exports = {setKey, searchMovies};




},{"./dom":2}]},{},[5]);
