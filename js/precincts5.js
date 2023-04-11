let userLocation;
let radialSearchLocation;
let orderedPrecincts;
let watchPositionID;
let userLocationLayer;

const BingMapsMasterKey = 'AkLdK49z62QhePT3_wOwTgwrvyKxdfEGDg939adTVKEF341pHDylvxD-23pUS7kt';
const dataSource = 'https://gis-bexar.opendata.arcgis.com/datasets/Bexar::bexar-county-voter-precincts/about';
const SanAntonio = {
	__type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
	bbox: [29.075069427490234, -99.14065551757812, 29.76782989501953, -97.85380554199219],
	name: 'San Antonio, TX',
	point: {
		type: 'Point',
		coordinates: [29.4251709, -98.49461365],
	},
	address: {
		adminDistrict: 'TX',
		adminDistrict2: 'Bexar County',
		countryRegion: 'United States',
		formattedAddress: 'San Antonio, TX',
		locality: 'San Antonio',
	},
	confidence: 'High',
	entityType: 'PopulatedPlace',
	geocodePoints: [
		{
			type: 'Point',
			coordinates: [29.4251709, -98.49461365],
			calculationMethod: 'Rooftop',
			usageTypes: ['Display'],
		},
	],
	matchCodes: ['Good'],
	center: {
		latitude: 29.4251709,
		longitude: -98.49461365,
		altitude: 0,
		altitudeReference: -1,
	},
};

userLocation = new n(SanAntonio.center);
radialSearchLocation = new n(SanAntonio.center);
const SanAntonioVisualCenter = {
	latitude: 29.4251709 + 0.06,
	longitude: -98.49461365,
	altitude: 0,
	altitudeReference: -1,
};
//let id =
//clearWatch(watchPositionID)

watchPositionID = navigator.geolocation.watchPosition(
	function (pos) {
		userLocation = new n(pos.coords);
		radialSearchLocation = new n(pos.coords);
		//userLocation = new n(SanAntonio.center);
		//radialSearchLocation = new n(SanAntonio.center);
		setUserPin(userLocation);
	},
	null,
	{
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 1000,
	}
);

function setUserPin(l) {
	if (userLocationLayer) {
		userLocationLayer.clear();
		let pin = new Microsoft.Maps.Pushpin(l, {
			//text: 'My Location',
			icon: 'img/user-location.svg',
			anchor: new Microsoft.Maps.Point(10.5, 10.5),
			//textOffset: new Microsoft.Maps.Point(0, -5),
		});
		userLocationLayer.add(pin);
		Microsoft.Maps.Events.addHandler(pin, 'click', function () {
			pushPinOnClick(pin);
		});
	}
}

$(window).on('load', function () {
	$(document).click(function (e) {
		/*if (e.target.closest('#precinctRouteMenu') == null && e.target != ellipsesDropdown && e.target != precinctRouteOptionsBtn) {
            $('#precinctRouteMenu').addClass('d-none');
        }*/
		//console.log(e.target)
		/*if (e.target.closest('#precinctRouteMenu') == null && e.target != ellipsesDropdown && e.target != precinctRouteOptionsBtn) {
            $('#precinctRouteMenu').addClass('d-none');
        }*/
	});

	let tapHold = false;
	let timeoutId;
	let multiSelectArray = [];

	document.addEventListener('touchstart', function (e) {
		tapHold = true;
		//console.log(e.timeStamp)
		timeoutID = setTimeout(() => {
			console.log('selected');
		}, 500);
	});

	document.addEventListener('touchend', function (e) {
		tapHold = false;
		clearTimeout(timeoutID);
	});

	const mapTypes = ['aerial', 'canvasDark', 'canvasLight', 'birdseye', 'grayscale', 'mercator', 'ordnanceSurvey', 'road', 'streetside'];

	const map = new Microsoft.Maps.Map('#storeLocator', {
		credentials: BingMapsMasterKey,
		navigationBarMode: Microsoft.Maps.NavigationBarMode.square,
		minZoom: 4,
		maxZoom: 17,
		center: SanAntonioVisualCenter,
		showDashboard: false,
		mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
		supportedMapTypes: mapTypes.map(mt => Microsoft.Maps.MapTypeId[mt]),
		navigationBarMode: Microsoft.Maps.NavigationBarMode.minified,
		navigationBarMode: Microsoft.Maps.NavigationBarMode.square,
		zoom: 11,
	});

	const precinctLayer = new Microsoft.Maps.Layer();
	map.layers.insert(precinctLayer);

	userLocationLayer = new Microsoft.Maps.Layer();
	map.layers.insert(userLocationLayer);

	const pushpinLayer = new Microsoft.Maps.Layer();
	map.layers.insert(pushpinLayer);

	map.getCredentials(function (sessionKey) {
		setUserPin(userLocation);

		$(gotoMyLocation).click(function () {
			map.setView({
				center: userLocation,
				zoom: 19,
			});
			setUserPin(userLocation);
		});

		$(showFullCity).click(function () {
			map.setView({
				center: SanAntonioVisualCenter,
				zoom: 11,
			});
		});

		let infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
			//htmlContent: $('#infoboxHTML').html(),
			visible: false,
		});
		infobox.setMap(map);

		Microsoft.Maps.loadModule(['Microsoft.Maps.GeoJson', 'Microsoft.Maps.SpatialDataService', 'Microsoft.Maps.SpatialMath', 'Microsoft.Maps.Search', 'Microsoft.Maps.AutoSuggest'], function () {
			removeLoader();

			//'Microsoft.Maps.AutoSuggest',

			const autosuggestManager = new Microsoft.Maps.AutosuggestManager(map);
			const SpatialMath = Microsoft.Maps.SpatialMath;
			const searchManager = new Microsoft.Maps.Search.SearchManager(map);

			$.getJSON('Bexar_County_Voter_Precincts.geojson', function (precincts) {
				const defaultPolygonColors = {
					visible: true,
					fillColor: '#00b5af20',
					strokeColor: '#00b5af',
					strokeThickness: 1,
				};

				const hiddenPolygonColors = {
					visible: false,
				};

				const highlightPolygonColors = {
					visible: true,
					fillColor: '#00000000',
					strokeColor: '#ef3d74',
					strokeThickness: 2,
				};

				autosuggestManager.attachAutosuggest('#addressSearchBox', '#addressSearchBoxContainer', function (autosuggestResult) {
					map.setView({
						bounds: autosuggestResult.bestView,
					});
					//.map(x => x.metadata.NAME)
					radialSearchLocation = autosuggestResult.location;
					let pin = new Microsoft.Maps.Pushpin(autosuggestResult.location, {
						title: autosuggestResult.title,
					});
					pushpinLayer.add(pin);
					Microsoft.Maps.Events.addHandler(pin, 'click', function () {
						pushPinOnClick(pin);
					});
				});

				$(addressSearchBox).on('search', function () {
					radialSearchLocation = userLocation;
				});

				$('#addressSearchBox').attr('style', '');

				const precinctShape = Microsoft.Maps.GeoJson.read(precincts, {
					polygonOptions: hiddenPolygonColors,
				});

				//map.entities.push(shape);
				precinctLayer.add(precinctShape);
				const precinctLayerPrimitives = precinctLayer.getPrimitives();
				$(showAllPrecinctsLabel).removeAttr('disabled');

				let searchRequest = {
					includeEntityTypes: ['Address', 'Neighborhood'],
					callback: function (r) {
						// console.log(r);
						// console.log(r.location);
						// console.log(r.name);
						//  console.log(r.address.locality);

						let containingPrecinct = precinctLayerPrimitives.filter(function (p) {
							return SpatialMath.Geometry.contains(p, r.location);
						})[0];
						let pin = new Microsoft.Maps.Pushpin(r.location, {
							title: r.name,
							subTitle: `Precinct: ${precinctName(containingPrecinct)}`,
						});
						pushpinLayer.add(pin);

						Microsoft.Maps.Events.addHandler(pin, 'click', function () {
							pushPinOnClick(pin);
						});

						let googleURL = `https://maps.google.com/?q=${r.name}`.replace(/\s/g, '+');

						$('#getDirections').attr('href', googleURL);
						$('#getDirections').html(r.name + '<i class="fa fa-external-link ms-2" aria-hidden="true"></i>');
						infobox.setOptions({
							location: r.location,
							//visible: true,
						});
					},
				};

				Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
					$(minorLoader).removeClass('d-none');
					searchRequest.location = e.location;
					console.log(searchRequest);
					searchManager.reverseGeocode(searchRequest);
					$(minorLoader).addClass('d-none');
				});

				$(showAllPrecincts).change(function () {
					let precinctColors = defaultPolygonColors;
					precinctColors.visible = this.checked;
					precinctLayerPrimitives.map(x => x.setOptions(precinctColors));
				});

				$(showNearbyPrecincts).change(function () {
					if (orderedPrecincts) {
						if (this.checked) {
							let filteredPrecincts = orderedPrecincts.filter((x, y) => y < 10 && y > 0);
							filteredPrecincts.map(function (precinct) {
								precinct.setOptions(hiddenPolygonColors);
								precinct.setOptions(highlightPolygonColors);
							});
							let precinctsConvexHull = SpatialMath.Geometry.convexHull(filteredPrecincts);

							map.setView({
								bounds: precinctsConvexHull.geometry.boundingBox,
							});
						} else {
							orderedPrecincts
								.filter((x, y) => y > 0)
								.map(function (precinct) {
									precinct.setOptions(hiddenPolygonColors);
								});
							map.setView({
								bounds: orderedPrecincts[0].geometry.boundingBox,
							});
						}
					}
				});
				/*

                <div class="d-none">
                    <label for="precinctRadius" class="form-label">Example range</label>
                    <input type="range" class="form-range" id="precinctRadius" min="0" max="10" value="0">
                </div>
                $(precinctRadius).on('input', function(r) {
                    let searchRadius = parseInt(this.value) / 100;
                    if (orderedPrecincts); {
                        orderedPrecincts.filter((x, y) => searchRadius && y > 0).map(p => p.setOptions(hiddenPolygonColors));
                        let filteredPrecincts = orderedPrecincts.filter((x, y) => x.distanceToRadialSearch <= searchRadius && y > 0);
                        filteredPrecincts.map(function(precinct) {
                            precinct.setOptions(hiddenPolygonColors);
                            precinct.setOptions(highlightPolygonColors);
                        });
                    }
                });
                */
				$(findClosestPrecinct).click(function () {
					//pushpinLayer.clear();

					orderedPrecincts = calculateDistanceFromRadialSearch(radialSearchLocation);
					$(showNearbyPrecinctsLabel).removeClass('d-none');

					let closestPrecinct = orderedPrecincts[0];

					let outlinedPrecinct = precinctLayer.getPrimitives().filter(x => x.isOutlined)[0];

					map.setView({
						bounds: closestPrecinct.geometry.boundingBox,
					});

					let pin = new Microsoft.Maps.Pushpin(closestPrecinct.geometry.boundingBox.center, {
						title: precinctName(closestPrecinct),
					});

					pin.for = 'closestPrecinct';

					pushpinLayer.add(pin);

					Microsoft.Maps.Events.addHandler(pin, 'click', function () {
						pushPinOnClick(pin);
					});

					closestPrecinct.setOptions(highlightPolygonColors);
					closestPrecinct.isOutlined = true;

					let maxDistance = Math.max.apply(
						null,
						orderedPrecincts.filter((x, i) => i < 12).map(x => x.distanceToRadialSearch)
					);
					//$(precinctRadius).attr('max', Math.round(maxDistance * 100));
					//console.log(SpatialMath.Geometry.shortestLineTo(radialSearchLocation, precinctLayerPrimitives));
				});

				$(precinctSearchBox).on('input', function () {
					$(precinctSearchResults).empty();
					let thisVal = $(this).val().replace(/\D/g, '');
					$(this).val(thisVal);
					if (thisVal != '') {
						let precinctArray = orderedPrecincts || precinctLayerPrimitives;
						precinctArray
							.filter(function (p) {
								let pName = precinctName(p);
								let r = new RegExp('^' + thisVal);
								return pName.match(r) != null;
							})
							.sort((a, b) => parseInt(precinctName(a)) - parseInt(precinctName(b)))
							.filter((x, i) => i < 9)
							.map(function (precinctLayerPrimitive) {
								let pName = precinctName(precinctLayerPrimitive);
								let precinctResultButton = $(`<button type="button" class="list-group-item list-group-item-action">${pName}</button>`);
								$(precinctSearchResults).append(precinctResultButton);

								precinctResultButton.click(function () {
									$(precinctSearchResults).empty();
									precinctLayerPrimitive.setOptions(highlightPolygonColors);
									let pin = new Microsoft.Maps.Pushpin(precinctLayerPrimitive.geometry.boundingBox.center, {
										title: pName,
									});
									pushpinLayer.add(pin);
									Microsoft.Maps.Events.addHandler(pin, 'click', function () {
										pushPinOnClick;
									});

									map.setView({
										bounds: precinctLayerPrimitive.geometry.boundingBox,
									});
								});
							});
					}
				});

				precinctLayerPrimitives.map(function (precinct) {
					let precinctMapPDF = `https://home.bexar.org/electionsResources/precincts/vp_{4054}.pdf`;

					Microsoft.Maps.Events.addHandler(precinct, 'click', function (e) {
						//$(minorLoader).removeClass('d-none');
						let precinctBounds = precinct.geometry.boundingBox;
						let precinctCenter = precinctBounds.center;
						map.setView({bounds: precinctBounds});

						autosuggestManager.setOptions({
							userLocation: precinctCenter,
						});

						if (!orderedPrecincts || !compareObjects(precinct, orderedPrecincts[0])) {
							orderedPrecincts = calculateDistanceFromRadialSearch(precinctCenter);
						}

						$(showNearbyPrecinctsLabel).removeClass('d-none');
						let pin = new Microsoft.Maps.Pushpin(precinctCenter, {
							//text: precinctName(closestPrecinct),
							icon: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" version="1.1">
                            <rect width="100" height="30" stroke="none" fill="none"/>
                                <style>
                                        text {
                                                font: bold 24px Helvetica, Arial, sans-serif;
                                        }
                                </style>
                                <text text-anchor="start" x="0" y="24" fill="#404041">${precinct.metadata.NAME}</text>
                            </svg>`,
						});
						pushpinLayer.add(pin);
						precinctLayer.getPrimitives().map(p => p.setOptions(hiddenPolygonColors));
						precinct.setOptions(highlightPolygonColors);
						//map.setview;
						searchRequest.location = e.location;

						infobox.setOptions({
							location: precinctCenter,
							visible: true,
							htmlContent: null,
							title: precinct.metadata.NAME,
						});
						//searchManager.reverseGeocode(searchRequest);
						//$(minorLoader).addClass('d-none');
					});
					/*
                    Microsoft.Maps.Events.addOne(precinct, 'click', function() {
                        //$('#pre').html(JSON.stringify(precinct.metadata, null, 4));
                        unfocusPrecincts();
                        map.setView({ bounds: precinct.geometry.boundingBox });
                        precinct.setOptions({
                            fillColor: '#0000',
                            strokeColor: '#00b5af',
                            strokeThickness: 1
                        });
                    });
                    */
				});

				function calculateDistanceFromRadialSearch(precinctRadialSearch) {
					return precinctLayerPrimitives
						.map(function (precinct) {
							precinct.distanceToRadialSearch = SpatialMath.Geometry.distance(precinctRadialSearch, precinct, SpatialMath.DistanceUnits.Miles);
							return precinct;
						})
						.sort((a, b) => a.distanceToRadialSearch - b.distanceToRadialSearch);
				}

				$(resetMap).click(function () {
					$('#controls input[type="checkbox"]').prop('checked', false);
					hidePrecincts();
					pushpinLayer.clear();
					map.setView({
						center: SanAntonioVisualCenter,
						zoom: 11,
					});
					infobox.setOptions({
						visible: false,
					});
				});

				function hidePrecincts() {
					precinctLayerPrimitives.map(function (p) {
						p.setOptions({
							visible: false,
						});
					});
				}

				function unfocusPrecincts() {
					precinctLayerPrimitives.map(function (p) {
						p.setOptions({
							fillColor: '#ccc',
							strokeThickness: 0,
						});
					});
				}
				removeLoader();
			});
		});

		function removeLoader() {
			if (precinctLayer.getPrimitives().length > 0) {
				$('#loadingContainer').remove();
			}
		}
	});
});

function pushPinOnClick(pin) {
	console.log(pin);
}

function filterPrecinctPrimitive(precinctPrimitive, searchVal) {
	let r = new RegExp(searchVal, 'gi');
	return precinctPrimitive.metadata.NAME.match(r) != null;
}

function n(obj) {
	this.latitude = obj.latitude || obj.Latitude;
	this.longitude = obj.longitude || obj.Longitude;
	this.altitude = obj.altitude || 0;
	this.altitudeReference = obj.altitudeReference || -1;
}

function precinctName(precinct) {
	return precinct.metadata.NAME;
}

function compareObjects(obj1, obj2) {
	let arr1 = Object.keys(obj1);
	let arr2 = Object.keys(obj2);
	for (i = 0; i < arr1.length; i++) {
		let a1 = arr1[i];
		if (obj1[a1] != obj2[a1]) {
			return false;
		}
	}
	for (i = 0; i < arr2.length; i++) {
		let a2 = arr1[i];
		if (obj2[a2] != obj1[a2]) {
			return false;
		}
	}
	return true;
}

