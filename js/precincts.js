let radialSearchLocation;
let orderedPrecincts;
let watchPositionID;
let myLocationLayer;
let searchManager;
let searchRequest;
let precinctView = false;
let allowMyLocationOnUpdate = true;

const BingMapsMasterKey = 'AkLdK49z62QhePT3_wOwTgwrvyKxdfEGDg939adTVKEF341pHDylvxD-23pUS7kt';
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

let myLocation = new n(SanAntonio.center);
//$(closestToWhich).html('my location');
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
		myLocation = new n(pos.coords);
		radialSearchLocation = new n(pos.coords);
		myLocation = new n(SanAntonio.center);
		radialSearchLocation = new n(SanAntonio.center);
		setUserPin(myLocation);
	},
	null,
	{
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 1000,
	}
);

function setUserPin(l) {
	if (myLocationLayer && allowMyLocationOnUpdate) {
		myLocationLayer.clear();
		let pin = new Microsoft.Maps.Pushpin(l, {
			//text: 'My Location',
			icon: 'img/user-location.svg',
			anchor: new Microsoft.Maps.Point(24, 24),
			//textOffset: new Microsoft.Maps.Point(0, -5),
		});
		myLocationLayer.add(pin);
		Microsoft.Maps.Events.addHandler(pin, 'click', function () {
			pushPinOnClick(pin);
		});

		$(activeLocation).html('My location');
		//$('#activeDetails').html(`${l.latitude}, ${l.longitude}`);
	}
}

$(window).on('load', function () {
	//$('#loadingContainer').remove();
	let focusItemPanelHold = false;
	let focusPanelClientRect;
	let focusPanelCursorStart;
	let maxFocusPanelHeight;
	let cursorDelta = {
		clientY: 0,
		pageY: 0,
		screenY: 0,
	};
	/*
	$(focusItemPanel)
		.mousedown(function (e) {
			focusPanelDown(e);
		})
		.mouseup(function (e) {
			focusPanelUp(e);
		})
		.mousemove(function (e) {
			focusPanelMove(e);
		});
    */
	focusItemPanel.ontouchstart = function (e) {
		focusPanelDown(e);
	};

	focusItemPanel.ontouchend = function (e) {
		focusPanelUp(e);
	};

	focusItemPanel.ontouchmove = function (e) {
		focusPanelMove(e);
	};

	$(focusItemInfo).click(function (e) {
		if ($('#focusItemPanel').hasClass('maximizing')) {
			$('#focusItemPanel').removeAttr('style');
			$('#focusItemPanel').removeClass('maximizing');
		} else {
			$('#focusItemPanel').addClass('maximizing');
		}
	});

	function focusPanelDown(e) {
		maxFocusPanelHeight = window.screen.height - controls.getBoundingClientRect().height;
		focusItemPanelHold = true;
		focusPanelClientRect = focusItemPanel.getBoundingClientRect();
		focusPanelCursorStart = {
			clientY: e.changedTouches[0].clientY,
			pageY: e.changedTouches[0].pageY,
			screenY: e.changedTouches[0].screenY,
		};
	}

	function focusPanelUp(e) {
		focusItemPanelHold = false;
		focusItemPanel.style.maxHeight = maxFocusPanelHeight + 'px';
		let cursorDeltaPageY = Math.round(cursorDelta.pageY);

		if (cursorDeltaPageY > 30) {
			focusItemPanel.style.height = '';
			console.log(focusPanelClientRect);
			$('#focusItemPanel').addClass('maximizing');
			setTimeout(function () {
				focusPanelClientRect = focusItemPanel.getBoundingClientRect();
				focusItemPanel.style.height = focusPanelClientRect.height;
				focusItemPanel.style.maxHeight = maxFocusPanelHeight + 'px';
			}, 200);
		} else if (cursorDeltaPageY < -30) {
			$('#focusItemPanel').removeAttr('style');
			$('#focusItemPanel').removeClass('maximizing');
		}
		cursorDelta = {
			clientY: 0,
			pageY: 0,
			screenY: 0,
		};
	}

	function focusPanelMove(e) {
		let changedTouches = {
			clientY: e.changedTouches[0].clientY,
			pageY: e.changedTouches[0].pageY,
			screenY: e.changedTouches[0].screenY,
		};

		cursorDelta = {
			clientY: focusPanelCursorStart.clientY - changedTouches.clientY,
			pageY: focusPanelCursorStart.pageY - changedTouches.pageY,
			screenY: focusPanelCursorStart.screenY - changedTouches.screenY,
		};

		//console.log(changedTouches);
		//focusPaneClientRect = focusItemPanel.getBoundingClientRect();
		focusItemPanel.style.height = focusPanelClientRect.height + cursorDelta.pageY + 'px';
		focusItemPanel.style.maxHeight = maxFocusPanelHeight + 'px';
	}

	const mapTypes = ['aerial', 'canvasDark', 'canvasLight', 'birdseye', 'grayscale', 'mercator', 'ordnanceSurvey', 'road', 'streetside'];

	const map = new Microsoft.Maps.Map('#storeLocator', {
		//center: SanAntonioVisualCenter,
		center: myLocation,
		credentials: BingMapsMasterKey,
		enableClickableLogo: false,
		liteMode: true,
		mapTypeId: Microsoft.Maps.MapTypeId.ordnanceSurvey,
		minZoom: 4,
		maxZoom: 17,
		showBreadcrumb: false,
		showDashboard: false,
		showScalebar: false,
		//showTermsLink: false,
		//supportedMapTypes: mapTypes.map(mt => Microsoft.Maps.MapTypeId[mt]),
		//zoom: 11,
		zoom: 19,
	});

	const precinctLayer = new Microsoft.Maps.Layer();
	map.layers.insert(precinctLayer);

	myLocationLayer = new Microsoft.Maps.Layer();
	map.layers.insert(myLocationLayer);

	const pushpinLayer = new Microsoft.Maps.Layer();
	map.layers.insert(pushpinLayer);

	map.getCredentials(function (sessionKey) {
		setUserPin(myLocation);

		$(gotoMyLocation).click(function () {
			allowMyLocationOnUpdate = true;
			map.setView({
				center: myLocation,
				zoom: 19,
			});
			setUserPin(myLocation);
			$(activeLocation).html('My location');

			if (searchManager && searchRequest) {
				searchRequest.location = myLocation;
				searchManager.reverseGeocode(searchRequest);
			} else {
				//$('#activeDetails').html(`${l.latitude}, ${l.longitude}`);
			}
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
			$('.bm_bottomLeftOverlay').html(`<div class="CopyrightContainer quadrantOverride multiLine" style="flex-direction: column; text-align: left;"><div class="CopyrightControl" ><span class="ShadowTextDark"><span class="CopyrightAttributionStyle">© 2023 TomTom, © 2023 Microsoft Corporation</span><a class="copyrightLink ShadowTextDark" style="pointer-events: auto; display: none;"></a></span></div><div id="TermsLinkContainer" class="TermsLinkContainer" style="text-align: left; float: left;"><a class="ShadowTextDark" href="https://www.microsoft.com/maps/assets/docs/terms.aspx" title="Terms" target="mc_bingMaps" style="pointer-events: auto">Terms</a></div></div>`);
			$('.bm_bottomRightOverlay').remove();
			$('.bm_bottomLeftOverlay').parent().get(0).style.zIndex = 0;

			const autosuggestManager = new Microsoft.Maps.AutosuggestManager(map);
			const SpatialMath = Microsoft.Maps.SpatialMath;
			searchManager = new Microsoft.Maps.Search.SearchManager(map);

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

				const outlinePolygonColors = {
					visible: true,
					fillColor: '#00000000',
					strokeColor: '#ef3d74',
					strokeThickness: 2,
				};

				const highlightPolygonColors = {
					visible: true,
					fillColor: '#00000000',
					//strokeColor: '#f99e13',
					strokeColor: '#00b5af',
					strokeThickness: 3,
					//secondaryStrokeColor: '#f99e13',
					//secondaryStrokethickness: 3,
				};

				autosuggestManager.attachAutosuggest('#addressSearchBox', '#addressSearchBoxContainer', function (autosuggestResult) {
					map.setView({
						bounds: autosuggestResult.bestView,
					});

					radialSearchLocation = autosuggestResult.location;

					//$(closestToWhich).html(autosuggestResult.title);

					let pin = new Microsoft.Maps.Pushpin(autosuggestResult.location, {
						title: autosuggestResult.title,
					});

					pushpinLayer.add(pin);

					Microsoft.Maps.Events.addHandler(pin, 'click', function () {
						pushPinOnClick(pin);
					});
				});

				$('#addressSearchBox').attr('style', '');

				$(addressSearchBox).on('search', function () {
					radialSearchLocation = myLocation;
					//$(closestToWhich).html('my location');
				});

				const precinctShape = Microsoft.Maps.GeoJson.read(precincts, {
					polygonOptions: hiddenPolygonColors,
				});

				precinctLayer.add(precinctShape);

				const precinctLayerPrimitives = precinctLayer.getPrimitives();

				$(showAllPrecinctsLabel).removeAttr('disabled');

				searchRequest = {
					includeEntityTypes: ['Address', 'Neighborhood'],
					callback: function (result) {
						let resultAddress = result.address;

						let containingPrecinct = precinctLayerPrimitives.filter(function (p) {
							return SpatialMath.Geometry.contains(p, result.location);
						})[0];

						console.log(searchRequest.showPushpin);

						if (containingPrecinct) {
							if (searchRequest.showPushpin) {
								let pin = new Microsoft.Maps.Pushpin(result.location, {
									title: result.name,
									subTitle: `Precinct: ${precinctName(containingPrecinct)}`,
								});

								pushpinLayer.add(pin);

								Microsoft.Maps.Events.addHandler(pin, 'click', function () {
									infobox.setOptions({
										location: result.location,
										visible: true,
									});
								});
							}

							$(withinPrecinct).html(`Precinct ${precinctName(containingPrecinct)}`);
						} else {
							$(withinPrecinct).html('This location is not within the bounds of a San Antonio precinct');
						}

						Object.keys(resultAddress).map(function (key) {
							$(`.${key}`).html(resultAddress[key]);
						});

						//$('#activeDetails').html(resultAddress.formattedAddress);

						let googleURL = `https://maps.google.com/?q=${result.name}`.replace(/\s/g, '+');

						$('#getDirections').attr('href', googleURL);
						$('#getDirections').html(result.name + '<i class="fa fa-external-link ms-2" aria-hidden="true"></i>');

						$(activeLocation).html(result.address.addressLine);
						console.log(result);
					},
				};

				Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
					allowMyLocationOnUpdate = false;
					//$(minorLoader).removeClass('d-none');
					searchRequest.location = e.location;
					radialSearchLocation = searchRequest.location;
					searchRequest.showPushpin = true;
					searchManager.reverseGeocode(searchRequest);
					//$(minorLoader).addClass('d-none');
				});

				$(showAllPrecincts).change(function () {
					let precinctColors = defaultPolygonColors;
					precinctColors.visible = this.checked;
					precinctLayerPrimitives.map(x => x.setOptions(precinctColors));
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
									allowMyLocationOnUpdate = false;
									$(precinctSearchResults).empty();
									precinctLayerPrimitive.setOptions(outlinePolygonColors);
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

				precinctLayerPrimitives.map(function (thisPrecinct) {
					let precinctMapPDF = `https://home.bexar.org/electionsResources/precincts/vp_{4054}.pdf`;

					Microsoft.Maps.Events.addHandler(thisPrecinct, 'click', function (e) {
						allowMyLocationOnUpdate = false;
						//$(minorLoader).removeClass('d-none');
						console.log(precinctView);
						highlightPrecinct(thisPrecinct);
						let thisPrecinctBounds = thisPrecinct.geometry.boundingBox;
						let thisPrecinctCenter = thisPrecinctBounds.center;
						//$(minorLoader).addClass('d-none');

						searchRequest.location = e.location;
						searchManager.reverseGeocode(searchRequest);
					});
				});

				$(showClosestPrecinct).click(function () {});

				$(showNearbyPrecincts).click(function () {
					allowMyLocationOnUpdate = false;
					pushpinLayer.clear();
					precinctView = true;
					orderedPrecincts = calculateDistanceFromRadialSearch(radialSearchLocation);
					let closestPrecinct = orderedPrecincts[0];

					highlightPrecinct(closestPrecinct);
				});

				$(resetMap).click(function () {
					allowMyLocationOnUpdate = true;
					$('#controls input[type="checkbox"]').prop('checked', false);
					$(activeLocation).html('My location');
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

				function highlightPrecinct(precinct) {
					let precinctBounds = precinct.geometry.boundingBox;
					let precinctCenter = precinctBounds.center;
					map.setView({bounds: precinctBounds});

					autosuggestManager.setOptions({
						userLocation: precinctCenter,
					});

					if (!orderedPrecincts || !compareObjects(precinct, orderedPrecincts[0])) {
						orderedPrecincts = calculateDistanceFromRadialSearch(precinctCenter);
					}

					pushpinLayer.clear();
					precinctLayer.getPrimitives().map(function (p) {
						let isOutlined = p._options.strokeColor == outlinePolygonColors.strokeColor;
						p.setOptions(hiddenPolygonColors);
						if (isOutlined) {
							p.setOptions({strokeColor: outlinePolygonColors.strokeColor});
						}
					});

					let nearbyPrecincts = orderedPrecincts.filter((x, y) => y < 10);

					nearbyPrecincts.map(function (nearbyPrecinct) {
						let nearbyPrecinctBoundingBox = nearbyPrecinct.geometry.boundingBox;
						let nearbyPrecinctIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" version="1.1">
                            <style> text { font: bold 14px Helvetica, Arial, sans-serif; }</style>
                            <rect y="0" width="100" height="30" rx="4" ry="4" fill="__ICON_COLOR__"/>
                            <text text-anchor="start" x="5" y="18" fill="#404041">${precinctName(nearbyPrecinct)}</text>
                        </svg>`;

						let pin = new Microsoft.Maps.Pushpin(nearbyPrecinctBoundingBox.center, {
							icon: nearbyPrecinctIcon.replace(/__ICON_COLOR__/, '#f99e1380'),
							anchor: new Microsoft.Maps.Point(20, 12.5),
						});

						Microsoft.Maps.Events.addHandler(pin, 'mousedown', function () {
							pin.setOptions({icon: nearbyPrecinctIcon.replace(/__ICON_COLOR__/, '#f99e13')});
							searchRequest.location = nearbyPrecinctBoundingBox.center;
							searchManager.reverseGeocode(searchRequest);
						});

						Microsoft.Maps.Events.addHandler(pin, 'mouseup', function () {
							pin.setOptions({icon: nearbyPrecinctIcon.replace(/__ICON_COLOR__/, '#f99e1380')});
							map.setView({bounds: nearbyPrecinctBoundingBox});
							radialSearchLocation = nearbyPrecinctBoundingBox.center;
						});

						pin.type = 'precinctlabel';

						pushpinLayer.add(pin);

						if (compareObjects(precinct, nearbyPrecinct)) {
							nearbyPrecinct.setOptions(highlightPolygonColors);
						} else {
							nearbyPrecinct.setOptions(outlinePolygonColors);
						}
					});

					let precinctsConvexHull = SpatialMath.Geometry.convexHull(nearbyPrecincts);

					map.setView({
						bounds: precinctsConvexHull.geometry.boundingBox,
					});

					infobox.setOptions({
						location: precinctCenter,
						visible: false,
						htmlContent: null,
						title: precinctName(precinct),
					});
				}

				function calculateDistanceFromRadialSearch(precinctRadialSearch) {
					return precinctLayerPrimitives
						.map(function (precinct) {
							precinct.distanceToRadialSearch = SpatialMath.Geometry.distance(precinctRadialSearch, precinct, SpatialMath.DistanceUnits.Miles);
							return precinct;
						})
						.sort((a, b) => a.distanceToRadialSearch - b.distanceToRadialSearch);
				}

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

