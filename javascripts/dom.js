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
		domStrang +=       `<p><a class="btn btn-primary review" role="button">Review</a> <a class="btn btn-default wishlist" role="button">Wishlist</a></p>`;
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