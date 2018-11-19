var globals, map, isMobile=false, isApp, lat, lng, previousLat=0, previousLng=0, openPdf,
App = {

	settings: {
		pass: $.localStorage.getItem('pass'),
		defLatLng: [48.86, 2.33],
		defZoom: 6,
		bottomScrolled: false,
		lead: '',
		getLeadsFilter: false,
		getLeadsEvent: 'loadEvent',
		serverAddress: "https://www.boursoconvois.com/db/in_app_calls.php",
		year: (new Date).getFullYear(),
		login: $.localStorage.getItem('login'),
		pwd: $.localStorage.getItem('pwd'),
		id: $.localStorage.getItem('id'),
		nom: $.localStorage.getItem('nom'),
		tel: $.localStorage.getItem('tel'),
		company: $.localStorage.getItem('company'),
		email: $.localStorage.getItem('email'),
		type: $.localStorage.getItem('type'),
		group: $.localStorage.getItem('group'),
		operator: $.localStorage.getItem('operator'),
		pilote_comp: $.localStorage.getItem('pilote_comp'),
		imat: $.localStorage.getItem('imat'),
		vpgm: $.localStorage.getItem('vpgm'),
		LeafIcon: L.Icon.extend({
			options: {
				shadowUrl: 'assets/img/leaflet/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41],
				shadowAnchor: [12, 41]
			}
		})
		//, greenIcon: new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-green.png'}), redIcon: new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-red.png'}), orangeIcon: new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-orange.png'})
	},
//var greenIcon = new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-green.png'}), redIcon = new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-red.png'}), orangeIcon = new LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-orange.png'});
	refreshGlobals: function(data) {
		globals.pass = data.pass;
		globals.login = data.login;
		globals.pwd = data.pwd;
		globals.id = data.id;
		globals.nom = data.nom;
		globals.tel = data.tel;
		globals.company = data.company;
		globals.email = data.email;
		globals.type = data.type;
		globals.group = data.group;
		globals.operator = data.operator;
		globals.pilote_comp = data.pilote_comp;
		globals.imat = data.imat;
		globals.vpgm = data.vpgm;
	},

	init: function() {
		// kick things off
		globals = this.settings;
		this.bindUIActions();
		//$("#now-date").append(globals.year);
		// Checks App or Browser
		isApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && document.URL.indexOf("localhost") != 7;
		if ( isApp ) {
			// PhoneGap application
			// Attendre que PhoneGap soit prêt	    //
			document.addEventListener("deviceready", App.onDeviceReady, false);
		}
	},

	onDeviceReady: function() {
		// PhoneGap est prêt
		//document.addEventListener("backbutton", App.onBackKeyDown, false);
		//document.addEventListener("resume", App.onResume, false);
		//document.addEventListener("menubutton", App.onMenuKeyDown, false);
		//document.addEventListener("pause", App.onPause, false);
		StatusBar.overlaysWebView(false);
		StatusBar.backgroundColorByHexString("#E7B242");
		// prevent device from sleeping
		window.powermanagement.acquire();
		//if($.localStorage.getItem('registeredUser') != 1)
		if((navigator.network.connection.type == Connection.NONE) || !window.jQuery){
			//$("body").empty().append('<img src="no_network.png" width="'+screen.width+'" height="'+screen.height+'" onClick="window.location.reload()" />');
			navigator.notification.alert('Cette application a besoin d\'une connexion internet afin de mieux fonctionner', App.alertDismissed, 'BoursoConvois', 'OK');
		}
		openPdf = cordova.plugins.disusered.open;
		/*
		// For Android => Enable background mode
		cordova.plugins.backgroundMode.enable();
		cordova.plugins.backgroundMode.setDefaults({
			title:  'App toujours en fonction (3 MINUTES MAX)',
			ticker: 'App toujours en fonction (3 MINUTES MAX)',
			text:   'Nous vous informons des courses en cours...'
		});
		//cordova.plugins.backgroundMode.configure({
		//	title:'App toujours en fonction (3 MINUTES MAX), nous vous informons des courses en cours...'
		//});
		*/
		// For iOS => backgroundtask
		//backgroundtask.start(bgFunctionToRun);
		// Efficient and batterie saving geolocation...
		/* USING Plugin V3.X */
		// BackgroundGeolocation is highly configurable. See platform specific configuration options 
		BackgroundGeolocation.configure({
			locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
			desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY, // Or can be a number in meters
			stationaryRadius: 10,
			distanceFilter: 10,
			activityType: 'Fitness',
			startForeground: true,
			debug: false,
			interval: 60000,
			fastestInterval: 30000,
			activitiesInterval: 30000,
			notificationTitle: 'BoursoConvois',
			notificationText: 'Suivi de votre position',
			//url: globals.serverAddress,
			//httpHeaders: {
			//  'X-FOO': 'bar'
			//},
			// customize post properties
			//postTemplate: {
			//  lat: '@latitude',
			//  lng: '@longitude',
			//  foo: 'bar' // you can also add your own properties
			//},
			notificationIconColor: '#FEDD1E'
		});
		BackgroundGeolocation.on('location', function(location) {
			// handle your locations here
			// to perform long running operation on iOS
			// you need to create background task
			BackgroundGeolocation.startTask(function(taskKey) {
				// execute long running task
				// eg. ajax post location
				lat = location.latitude;
				lng = location.longitude;
				$("#returnsGeoloc").append("geoloc launch:"+lat+", "+lng);
				$.post(globals.serverAddress, {id: globals.id, lead: globals.lead, pwd: globals.pwd, lat: lat, lng: lng, req: 'updateGeolocation'}, function(data){
					if(data.ok=="ok") {
						returns = '<div class="alert alert-success" role="alert"><b>Géolocalisation effectuée.</b></div>';
					}
					else
						returns = '<div class="alert alert-danger" role="alert"><b>Géolocalisation effectuée mais erreur serveur.</b></div>';
					$("#returnsGeoloc").append(returns);
				});
				// IMPORTANT: task has to be ended by endTask
				BackgroundGeolocation.endTask(taskKey);
			});
		});
		BackgroundGeolocation.on('background', function() {
			// you can also reconfigure service (changes will be applied immediately)
			BackgroundGeolocation.configure({ locationProvider: BackgroundGeolocation.RAW_PROVIDER });
		});
		BackgroundGeolocation.on('foreground', function() {
			BackgroundGeolocation.configure({ locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER });
		});
		/*
		BackgroundGeolocation.on('stationary', function(stationaryLocation) {
			// handle stationary locations here
		});
		BackgroundGeolocation.on('error', function(error) {
			console.log('[ERROR] BackgroundGeolocation error:', error.code, error.message);
		});
		BackgroundGeolocation.on('start', function() {
			console.log('[INFO] BackgroundGeolocation service has been started');
		});
		BackgroundGeolocation.on('stop', function() {
			console.log('[INFO] BackgroundGeolocation service has been stopped');
		});
		BackgroundGeolocation.on('abort_requested', function() {
			console.log('[INFO] Server responded with 285 Updates Not Required');
			// Here we can decide whether we want stop the updates or not.
			// If you've configured the server to return 285, then it means the server does not require further update.
			// So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
			// But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
		});
		BackgroundGeolocation.on('http_authorization', () => {
			console.log('[INFO] App needs to authorize the http requests');
		});
		*/
		BackgroundGeolocation.on('error', function(error) {
			//if(isApp) navigator.notification.alert('BackgroundGeolocation error', App.alertDismissed, 'BoursoConvois', 'OK');
			//else alert('BackgroundGeolocation error');
			navigator.notification.confirm('Erreur de Géolocalisation, voulez-vous aller dans les réglages afin d\'activer le service de géolocalisation pour cette app ?', 'BoursoConvois', function() {
				backgroundGeolocation.showAppSettings();
			});
		});
		BackgroundGeolocation.on('authorization', function(status) {
			if (status !== BackgroundGeolocation.AUTHORIZED) {
				// we need to set delay or otherwise alert may not be shown
				setTimeout(function() {
					navigator.notification.confirm('Erreur de Géolocalisation, voulez-vous aller dans les réglages afin d\'activer le service de géolocalisation pour cette app ?', 'BoursoConvois', function() {
						backgroundGeolocation.showAppSettings();
					});
				}, 1000);
			}
		});
		/*
		// Using Plugin V2.X
		var geoCallbackFn = function(location) {
			//alert('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
			// Do your HTTP request here to POST location to your server. 
			// jQuery.post(url, JSON.stringify(location)); 
			lat = location.latitude;
			lng = location.longitude;
			$("#returnsGeoloc").append("geoloc launch:"+lat+", "+lng);
			$.post(globals.serverAddress, {id: globals.id, lead: globals.lead, pwd: globals.pwd, lat: lat, lng: lng, req: 'updateGeolocation'}, function(data){
				if(data.ok=="ok") {
					returns = '<div class="alert alert-success" role="alert"><b>Géolocalisation effectuée.</b></div>';
				}
				else
					returns = '<div class="alert alert-danger" role="alert"><b>Géolocalisation effectuée mais erreur serveur.</b></div>';
				$("#returnsGeoloc").append(returns);
			});
			//IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished, and the background-task may be completed. You must do this regardless if your HTTP request is successful or not. IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
			backgroundGeolocation.finish();
		};
		var geoFailureFn = function(error) {
			//if(isApp) navigator.notification.alert('BackgroundGeolocation error', alertDismissed, 'Mon Appli Taxi', 'OK');
			//else alert('BackgroundGeolocation error');
			navigator.notification.confirm('Erreur de Géolocalisation, voulez-vous aller dans les réglages afin d\'activer le service de géolocalisation pour cette app ?', 'BoursoConvois', function() {
				backgroundGeolocation.showAppSettings();
			});
		};
		// BackgroundGeolocation is highly configurable. See platform specific configuration options 
		backgroundGeolocation.configure(geoCallbackFn, geoFailureFn, {
			locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
			desiredAccuracy: 100, // Or can be a number in meters
			stationaryRadius: 1000,
			distanceFilter: 1000,
			activityType: 'AutomotiveNavigation',
			startForeground: true,
			debug: false,
			interval: 60000,
			fastestInterval: 30000,
			activitiesInterval: 30000,
			notificationTitle: 'BoursoConvois',
			notificationText: 'Suivi de votre position',
			notificationIconColor: '#FEDD1E'
		});
		*/
		// Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app. 
		backgroundGeolocation.start();
		//App.getLocation();
		cordova.plugins.notification.local.clearAll(function() {
			//alert("All notifications cleared");
		}, this);
		/*
		var assosPop = window.open('http://taximedia.fr/assos/','_blank','location=false,enableViewportScale=yes,scrollbars=no,closebuttoncaption=Fermer');
		setTimeout(function() {
			assosPop.close();
		}, 5000);
		*/
	},
	alertDismissed: function() {
		// Do nothing !
	},
	/*
	bgFunctionToRun: function() {
		if(hail_id!="") check_answer_open();
		if(idcourse!="") check_answer();
	},
	// GESTION DES BOUTONS MATERIEL
	// Bouton retour
	onBackKeyDown: function() {
		navigator.notification.alert("Veuillez ne pas quitter BoursoConvois pendant la recheche de taxi disponibles", App.alertDismissed, 'BoursoConvois', 'OK');
	},
	onResume: function() {
		setTimeout(function() {
			if((navigator.network.connection.type == Connection.NONE) || !window.jQuery){
				$("body").empty().append('<img src="no_network.png" width="'+screen.width+'" height="'+screen.height+'" onClick="window.location.reload()" />');
			}
		}, 500);// iOS Quirks
	},
	// Bouton menu
	onMenuKeyDown: function() {
		// Do something
	},
	// Escaping...
	onPause: function() {
		if(idcourse!='') {
			stopCall();
			navigator.notification.alert("SI VOUS AVIEZ UNE COMMANDE EN COURS ELLE A ETE ANNULEE ! (CELA NE S'APPLIQUE PAS AUX RESERVATIONS)");
		}
	},
	*/
	changePage: function(pageToShow, previousPage) {
		if(pageToShow != previousPage) {
			$('.fullpage').not('#'+pageToShow).fadeOut();
			$('#'+pageToShow).fadeIn();
		}
		// Modifying return link...
		$('#returnLink').attr('onclick', '').attr('onclick', 'App.changePage(\''+previousPage+'\', \''+pageToShow+'\')');
	},

	openSomeUrl: function(url) {
		window.open(url,'_blank','location=false,enableViewportScale=yes,scrollbars=yes,closebuttoncaption=Fermer');
	},
	
	logMeIn: function (myParentDiv) {
		$(myParentDiv+' #sender').attr("disabled", true);
		var credLogin = $(myParentDiv+' #login').val();
		var credPass = $(myParentDiv+' #pass').val();
		//var credType = $(myParentDiv+' #businessType').val();
		$.post(globals.serverAddress, {req: 'login', login: credLogin, pass: credPass, type: 2}, function(data){
			if(data.pass == "OK") {
				$.localStorage.setItem('pass', data.pass);
				$.localStorage.setItem('login', data.login);
				$.localStorage.setItem('pwd', data.pwd);
				$.localStorage.setItem('id', data.id);
				$.localStorage.setItem('nom', data.nom);
				$.localStorage.setItem('tel', data.tel);
				$.localStorage.setItem('company', data.nom);
				$.localStorage.setItem('email', data.email);
				$.localStorage.setItem('type', data.type);
				$.localStorage.setItem('group', data.id);
				$.localStorage.setItem('operator', data.id);
				$.localStorage.setItem('pilote_comp', data.company);
				$.localStorage.setItem('imat', data.imat);
				$.localStorage.setItem('vpgm', data.vpgm);
				App.refreshGlobals(data);
				App.changePage('homePage', '');
				$('#navLinks .connected').show();
				setTimeout(function(){
					App.getLeads('loadEvent', true);
				}, 100);
			}
			else {
				if(isApp) navigator.notification.alert("Identifiant ou mot de passe erroné !", App.alertDismissed, 'BoursoConvois', 'OK');
				else alert("Identifiant ou mot de passe erroné !");
			}
		}, "json").always(function() {
			$(myParentDiv+' #sender').attr("disabled", false);
		});
	},
	
	logMeOut: function () {
		$.localStorage.setItem('pass', false);
		$.localStorage.setItem('login', '');
		$.localStorage.setItem('pwd', '');
		$.localStorage.setItem('id', '');
		$.localStorage.setItem('nom', '');
		$.localStorage.setItem('tel', '');
		$.localStorage.setItem('company', '');
		$.localStorage.setItem('email', '');
		$.localStorage.setItem('type', '');
		$.localStorage.setItem('group', '');
		$.localStorage.setItem('operator', '');
		$.localStorage.setItem('pilote_comp', '');
		$.localStorage.setItem('imat', '');
		$.localStorage.setItem('vpgm', '');
		setTimeout(function(){
			App.refreshGlobals('');
		}, 500);
		setTimeout(function(){
			document.location.href='index.html';
		}, 1000);
	},
	
	forgottenPwd: function () {
		$('#sender-forgotten').attr("disabled", true);
		let forgotEmail = $('#forgotEmail').val();
		//let forgotType = $('#forgotType').val();
		$.post(globals.serverAddress, {req: 'forgottenPwd', email: forgotEmail}, function(data){
			if(data.ok=="ok")
				alert("Votre mot de passe vous a été envoyé par email");
			else 
				alert("Cette adresse email ne correspond à aucun identifiant !");
		}, "json").always(function() {
			$('#sender-forgotten').attr("disabled", false);
		});
	},
	
	subContact: function (myFormDiv) {
		$(myFormDiv+' #sender').attr("disabled", true);
		let query = $(myFormDiv).serialize();
		let req = "contact";
		query = query + "&req=" + req;
		var returns = "";
		//$(myFormDiv+' #successfail').append('<div class="alert alert-success" role="alert"><b>Query : '+query+'</b></div>');
		$.post(globals.serverAddress, query, function(data){
			if(data.ok=="ok")
				returns = '<div class="alert alert-success" role="alert"><b>Votre message a bien été envoyé.</b></div>';
			else
				returns = '<div class="alert alert-danger" role="alert"><b>Votre message n\'a pas été envoyé.</b></div>';
		}, "json").always(function(data){
			$(myFormDiv+' #sender').attr("disabled", false);
			$(myFormDiv+' #successfail').empty().append(returns);
		});
	},
		
	addWasValidatedClass: function (myFormDiv) {
		$(myFormDiv).addClass('was-validated');
	},
	
	getLocation: function(myEvent) {
		switch(myEvent) 
		{
			case "Map":
				if (navigator.geolocation)
				{
					if (navigator.userAgent.toLowerCase().match(/android/)) {
						navigator.geolocation.getCurrentPosition(App.codeLatLng, App.showError,{enableHighAccuracy:false, maximumAge:0, timeout: 9000});
					}
					else {
						navigator.geolocation.getCurrentPosition(App.codeLatLng, App.showError,{enableHighAccuracy:true, maximumAge:0, timeout: 9000});
					}
				}
				else {
					alert("Localisation impossible, veuillez v&eacute;rifier l'&eacute;tat de votre connexion ainsi que la disponibilité des services de localisation dans les réglages de votre appareil.");
				}
			  break;
			default:
				if (navigator.geolocation)
				{
					if (navigator.userAgent.toLowerCase().match(/android/)) {
						navigator.geolocation.getCurrentPosition(App.sendLatLng, App.showError,{enableHighAccuracy:true, maximumAge:0, timeout: 30000});
					}
					else {
						navigator.geolocation.getCurrentPosition(App.sendLatLng, App.showError,{enableHighAccuracy:true, maximumAge:0, timeout: 10000});
					}
				}
				else {
					alert("Localisation impossible, veuillez v&eacute;rifier l'&eacute;tat de votre connexion ainsi que la disponibilité des services de localisation dans les réglages de votre appareil.");
				}
		}
	},

	codeLatLng: function(position) {
		let lat = parseFloat(position.coords.latitude);
		let lng = parseFloat(position.coords.longitude);
		let latlng = [lat, lng];
		//alert(latlng);
		globals.defLatLng = latlng;
		//map.setView(L.LatLng(lat,lng), globals.defZoom);
		map.setView(latlng, globals.defZoom);
		L.marker(globals.defLatLng).addTo(map)
			.bindPopup('<p><b>Vous Êtes<br> ICI !!!</b></p>')
			.openPopup();
		var circle = L.circle(globals.defLatLng, {
			color: '#0CF',
			fillColor: '#008595',
			fillOpacity: 0.2,
			radius: 100000
		}).addTo(map);
		/*
		// Using https://adresse.data.gouv.fr
		//https://api-adresse.data.gouv.fr/reverse/?lon=2.37&lat=48.357&type=street
		$.get('https://api-adresse.data.gouv.fr/reverse/', {lat: lat, lon: lng, type: ''}, function(data) {
			//alert(data.features[0].properties.label+' - '+data.features[0].properties.postcode);
			if(data.features[0].properties.label!='baninfo') {
				// Reverse geocoding is OK...
				$('#addressInput').val(data.features[0].properties.label);
				$('#addressInput2').val(data.features[0].properties.label);
				$('#addressInputPrices').val(data.features[0].properties.label);
				insee = data.features[0].properties.citycode;
				zip = data.features[0].properties.postcode;
				dep = zip.substring(0, 2);
				$.sessionStorage.setItem('dep', dep);
			}
			else {
				if(isApp) navigator.notification.alert('Adresse inconnue !! Veuillez la saisir manuellement SVP.', App.alertDismissed, 'BoursoConvois', 'OK');
				else alert('Adresse inconnue !! Veuillez la saisir manuellement SVP.');
			}
		}, "json").done(function() { 
		});
		*/
	},

	sendLatLng: function(position) {
		lat = parseFloat(position.coords.latitude);
		lng = parseFloat(position.coords.longitude);
		if((lat!=previousLat) && (lng!=previousLng)) {
			$.post(globals.serverAddress, {id: globals.id, lead: globals.lead, pwd: globals.pwd, lat: lat, lng: lng, req: 'updateGeolocation'}, function(data){
				if(data.ok=="ok") {
					returns = '<div class="alert alert-success" role="alert"><b>Géolocalisation effectuée.</b></div>';
					previousLat = lat;
					previousLng = lng;
				}
				else
					returns = '<div class="alert alert-danger" role="alert"><b>Géolocalisation effectuée mais erreur serveur.</b></div>';
				//$("#returns").empty().append();
			}, "json").always(function(data){
				setTimeout('App.getLocation()', 60000); // Every sixty seconds you check geolocation...
			});
		}
	},

	showError: function(error)
	{
		var geoAlert="";
		switch(error.code) 
		{
			case error.PERMISSION_DENIED:
			  geoAlert="Vous avez refusé l'accès à la Géolocalisation, vous pouvez modifier cela dans les réglages.";
			  break;
			case error.POSITION_UNAVAILABLE:
			  geoAlert="Géolocalisation indisponible, veuillez regarder dans l'aide ou activer le service dans les reglages de votre appareil.";
			  break;
			case error.TIMEOUT:
			  geoAlert="La demande de Géolocalisation a expiré, veuillez vérifier l'état de votre connection ainsi que la disponibilité des services de localisation (user location request timed out).";
			  break;
			case error.UNKNOWN_ERROR:
			  geoAlert="Erreur inconnue de Géolocalisation (unknown error occurred).";
			  break;
			default:
			  geoAlert="Erreur de Géolocalisation, libre à vous d'activer le service de géolocalisation pour cette app dans les réglages.";
		}
		if (error.code == error.TIMEOUT) {
			// Fall back to low accuracy and any cached position available...
			navigator.geolocation.getCurrentPosition(App.sendLatLng, function(){
				App.getLocation(); // We got out of the loop so we get back in !
				if(!geoFailedAlertOnce) {
					geoFailedAlertOnce = true;
					if(isApp) navigator.notification.alert(geoAlert, alertDismissed, 'BoursoConvois', 'OK');
					else alert(geoAlert);
				}
			},{enableHighAccuracy:false, maximumAge:10000, timeout: 60000});
		}
		else {
			App.getLocation(); // We got out of the loop so we get back in !
			//$( "#errorPop" ).popup( "open", { positionTo: "window" } );
			if(isApp) navigator.notification.alert(geoAlert, alertDismissed, 'BoursoConvois', 'OK');
			else alert(geoAlert);
		}
	},
	
	showLeadOnMap: function(auto_l, addr_l, addr_comp_l, dep_l, city_l, addr_dest_l, addr_dest_comp_l, dep_dest_l, city_dest_l, cat_l, num_arr_pref, name_l, tel_l, datedeb_l, datefin_l, long_l, large_l, height_l, weight_l, est_time, est_km, vp_av, vp_ar, guides, imat_tr, imat_sr, lat_p, lng_p, timestamp_p, page)
	{
		App.popMapFollowLeads();
		var greenIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-green.png'}), redIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-red.png'}), orangeIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-orange.png'});
		App.clearMap('app');
		var rdv = (addr_l!="") ? addr_l : city_l;
		var dest = (addr_dest_l!="") ? addr_dest_l : city_dest_l;
		var rdvLng;
		var rdvLat;
		var destLng;
		var destLat;
		if (rdv!='' && dest!='') {
			// Using https://adresse.data.gouv.fr
			//https://api-adresse.data.gouv.fr/search/?q=8 bd du port&type=street
			$.get('https://api-adresse.data.gouv.fr/search/', {q: rdv, type: ''}, function(data) {
				rdvLng = data.features[0].geometry.coordinates[0];
				rdvLat = data.features[0].geometry.coordinates[1];
				//zipPrices = data.features[0].properties.postcode;
				//depPrices = zipPrices.substring(0, 2);
			}, "json").done(function(data) { 
				$.get('https://api-adresse.data.gouv.fr/search/', {q: dest, type: ''}, function(data) {
					destLng = data.features[0].geometry.coordinates[0];
					destLat = data.features[0].geometry.coordinates[1];
				}, "json").done(function(data) { 
					let lat = parseFloat(rdvLat);
					let lng = parseFloat(rdvLng);
					let dLat = parseFloat(destLat);
					let dLng = parseFloat(destLng);
					let latlng = [lat, lng];
					let dlatlng = [dLat, dLng];
					let latlng_p = [parseFloat(lat_p), parseFloat(lng_p)];
					globals.defLatLng = latlng;
					globals.defdestLatLng = dlatlng;
					//map.setView(L.LatLng(lat,lng), globals.defZoom);
					map.setView(latlng, globals.defZoom);
					L.marker(globals.defLatLng, {icon: greenIcon}).addTo(map)
						.bindPopup('<p><b>#'+auto_l+' Départ:<br>'+datedeb_l+'</b><br>'+rdv+'<br>'+addr_comp_l+'</p>', {autoClose: false})
						.openPopup();
					L.marker(globals.defdestLatLng, {icon: redIcon}).addTo(map)
						.bindPopup('<p><b>#'+auto_l+' Arrivée:<br>'+datefin_l+'</b><br>'+dest+'<br>'+addr_dest_comp_l+'</p>', {autoClose: false})
						.openPopup();
					if(lat_p!=0 && lng_p!=0) {
						L.marker(latlng_p, {icon: orangeIcon}).addTo(map)
							.bindPopup('<p><b>Ma dernière position enregistrée le:<br>'+timestamp_p+'</b></p>', {autoClose: false})
							.openPopup();
						var circle = L.circle(latlng_p, {
							color: '#FFAB00',
							fillColor: '#FFBF00',
							fillOpacity: 0.2,
							radius: 100000
						}).addTo(map);
					}
				});
			});
		}
		else {
			if(isApp) navigator.notification.alert("Vous devez renseigner les adresses de départ et d'arrivée.", App.alertDismissed, 'BoursoConvois', 'OK');
			else alert("Vous devez rensigner les adresses de départ et d'arrivée.");
		}
	},
	
	clearMap: function(page)
	{
		//markers.clearLayers();
		map.eachLayer(function(layer){
			//layer.bindPopup('Hello');
			map.removeLayer(layer);
		});
		map.setView(globals.defLatLng, globals.defZoom);		
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	},
	
	getLeads: function(myEvent, refresh)
	{
		if(!refresh) {
			globals.getLeadsEvent = myEvent; // if a filter is active load current event as the current event to reload next time
		}
		if(myEvent==globals.getLeadsEvent) { // Prevent next occuration of "old setTimeout" refresh after a new filter is pushed
			var filterDep = "", filterYear = "", filterMonth = "", filterWeek = "";
			if(myEvent=="justMineDate") {
				filterYear = $('#filterYear0').val();
				filterMonth = $('#filterMonth0').val();
				filterWeek = $('#filterWeek0').val();
			}
			$.post(globals.serverAddress, {id: globals.id, admin: globals.admin, type: globals.type, pwd: globals.pwd, req: 'getLeads', filter: myEvent, dep: filterDep, year: filterYear, month: filterMonth, week: filterWeek}, function(data){ 
				if(data.ok=="ok") {
					$('#leadsCont').empty().append(data.leads);
				}
				else {
					let returns = '<div class="alert alert-danger" role="alert"><b>Désolé mais nous n\'avons aucun convoi correspondant à ces critères.</b></div>';
					$('#leadsCont').empty().append(returns);
				}
			}, "json").always(function() {
				//if(!globals.getLeadsFilter) setTimeout("App.getLeads('"+myEvent+"')", 10000);
				if(!globals.getLeadsFilter) setTimeout("App.getLeads('"+globals.getLeadsEvent+"', true)", 60000);
			});
		}
	},

	addLeads: function(myFormDiv)
	{
		let nb_vp_av = $(myFormDiv+' #vp_av').val();
		let nb_vp_ar = $(myFormDiv+' #vp_ar').val();
		let nb_guides = $(myFormDiv+' #guides').val();
		let isAnyDriver = (nb_vp_av!=0 || nb_vp_ar!=0 || nb_guides!=0) ? true : false;
		//alert(isAnyDriver+" - "+nb_vp_av+" - "+nb_vp_ar+" - "+nb_guides);
		if(isAnyDriver) {
			$(myFormDiv+' #sender').attr("disabled", true);
			let query = $(myFormDiv).serialize();
			let req = "addLeads";
			query = query + "&id=" + globals.id + "&pwd=" + globals.pwd + "&req=" + req;
			var returns = "";
			//$(myFormDiv+' #successfail').append('<div class="alert alert-success" role="alert"><b>Query : '+query+'</b></div>');
			$.post(globals.serverAddress, query, function(data){
				if(data.ok=="ok") {
					returns = '<div class="alert alert-success" role="alert"><b>Votre demande de convoi a bien été prise en compte.</b></div>';
					App.getLeads('loadEvent', true);
				}
				else
					returns = '<div class="alert alert-danger" role="alert"><b>Votre demande de convoi n\'a pas été prise en compte suite à un problème technique.</b></div>';
			}, "json").always(function(data){
				$(myFormDiv+' #sender').attr("disabled", false);
				$(myFormDiv+' #successfail').empty().append(returns);
			});
		}
		else alert("Votre demande de convoi doit requérir au moins un VP ou guideur !");
	},

	modJobDocument: function(myFormDiv)
	{
		$(myFormDiv+' #sender').attr("disabled", true);
		let query = $(myFormDiv).serialize();
		let req = "modJobDocument";
		query = query + "&id=" + globals.id + "&pwd=" + globals.pwd + "&req=" + req;
		var returns = "";
		//$(myFormDiv+' #successfail').append('<div class="alert alert-success" role="alert"><b>Query : '+query+'</b></div>');
		$.post(globals.serverAddress, query, function(data){
			if(data.ok=="ok") {
				returns = '<div class="alert alert-success" role="alert"><b>Le bon de transport à été sauvegardé.</b></div>';
			}
			else
				returns = '<div class="alert alert-danger" role="alert"><b>Le bon de transport n\'a pas été sauvegardé suite à un problème technique.</b></div>';
		}, "json").always(function(data){
			$(myFormDiv+' #sender').attr("disabled", false);
			$(myFormDiv+' #successfail').empty().append(returns);
		});
	},

	fillJobDocument: function(auto_l, addr_l, addr_comp_l, dep_l, city_l, addr_dest_l, addr_dest_comp_l, dep_dest_l, city_dest_l, cat_l, num_arr_pref, name_l, tel_l, datedeb_l, datefin_l, long_l, large_l, height_l, weight_l, est_time, est_km, vp_av, vp_ar, guides, imat_tr, imat_sr, name_st)
	{
		// First time filling it...
		$('#fillJobDocument #auto_l').val(auto_l);
		//$('#fillJobDocument #number_bdt').val();
		$('#fillJobDocument #date_cv').val(datedeb_l);
		$('#fillJobDocument #transp_name').val(name_st);
		//$('#fillJobDocument #nat_charge').val();
		$('#fillJobDocument #imat_tr').val(imat_tr);
		$('#fillJobDocument #imat_sr').val(imat_sr);
		$('#fillJobDocument #imat_vp').val(globals.imat);
		$('#fillJobDocument #large').val(large_l);
		$('#fillJobDocument #long').val(long_l);
		$('#fillJobDocument #height').val(height_l);
		$('#fillJobDocument #weight').val(weight_l);
		$('#fillJobDocument #categorie').val(cat_l);
		$('#fillJobDocument #num_pref').val(num_arr_pref);
		$('#fillJobDocument #name_drv').val(name_l);
		$('#fillJobDocument #name_vp').val(globals.nom);
		// Then filling it with possible already sent informations...
		$.post(globals.serverAddress, {id: globals.id, type: globals.type, pwd: globals.pwd, auto_l: auto_l, req: 'getLeadsDocument'}, function(data){ 
			if(data.ok=="ok") {
				$('#fillJobDocument #number_bdt').val(data.number_bdt);
				$('#fillJobDocument #date_cv').val(data.date_cv);
				$('#fillJobDocument #transp_name').val(data.transp_name);
				$('#fillJobDocument #nat_charge').val(data.nat_charge);
				$('#fillJobDocument #imat_tr').val(data.imat_tr);
				$('#fillJobDocument #imat_sr').val(data.imat_sr);
				$('#fillJobDocument #imat_vp').val(data.imat_vp);
				$('#fillJobDocument #large').val(data.large_ld);
				$('#fillJobDocument #long').val(data.long_ld);
				$('#fillJobDocument #height').val(data.height_ld);
				$('#fillJobDocument #weight').val(data.weight_ld);
				$('#fillJobDocument #categorie').val(data.categorie);
				$('#fillJobDocument #num_pref').val(data.num_pref);
				$('#fillJobDocument #name_drv').val(data.name_drv);
				$('#fillJobDocument #name_vp').val(data.name_vp);
				$('#fillJobDocument #dep_datetime_1').val(data.dep_datetime_1);
				$('#fillJobDocument #arr_datetime_1').val(data.arr_datetime_1);
				$('#fillJobDocument #dep_datetime_2').val(data.dep_datetime_2);
				$('#fillJobDocument #arr_datetime_2').val(data.arr_datetime_2);
				$('#fillJobDocument #dep_datetime_3').val(data.dep_datetime_3);
				$('#fillJobDocument #arr_datetime_3').val(data.arr_datetime_3);
				$('#fillJobDocument #dep_datetime_4').val(data.dep_datetime_4);
				$('#fillJobDocument #arr_datetime_4').val(data.arr_datetime_4);
				$('#fillJobDocument #dep_datetime_5').val(data.dep_datetime_5);
				$('#fillJobDocument #arr_datetime_5').val(data.arr_datetime_5);
				$('#fillJobDocument #dep_city_dep_1').val(data.dep_city_dep_1);
				$('#fillJobDocument #arr_city_dep_1').val(data.arr_city_dep_1);
				$('#fillJobDocument #dep_city_dep_2').val(data.dep_city_dep_2);
				$('#fillJobDocument #arr_city_dep_2').val(data.arr_city_dep_2);
				$('#fillJobDocument #dep_city_dep_3').val(data.dep_city_dep_3);
				$('#fillJobDocument #arr_city_dep_3').val(data.arr_city_dep_3);
				$('#fillJobDocument #dep_city_dep_4').val(data.dep_city_dep_4);
				$('#fillJobDocument #arr_city_dep_4').val(data.arr_city_dep_4);
				$('#fillJobDocument #dep_city_dep_5').val(data.dep_city_dep_5);
				$('#fillJobDocument #arr_city_dep_5').val(data.arr_city_dep_5);
				$('#fillJobDocument #km_day_1').val(data.km_day_1);
				$('#fillJobDocument #km_day_2').val(data.km_day_2);
				$('#fillJobDocument #km_day_3').val(data.km_day_3);
				$('#fillJobDocument #km_day_4').val(data.km_day_4);
				$('#fillJobDocument #km_day_5').val(data.km_day_5);
				$('#fillJobDocument #vp_datetime_end').val(data.vp_datetime_end);
				$('#fillJobDocument #obs_driver').val(data.obs_driver);
				$('#fillJobDocument #obs_pilot').val(data.obs_pilot);
				$('#fillJobDocument #getPdfCont').empty().append('<button class="btn btn-danger btn-block" id="getPdfBtn" onclick="App.getPdf(\''+data.auto_ld+'\')"><i class="fa fa-file-pdf-o"></i> Doc PDF</button>');
			}
		}, "json");
		App.changePage('jobDocPage', 'leadPage');
	},

	getPdf: function(auto_ld)
	{
		$('#getPdfBtn').attr("disabled", true);
		let req = "getPdf";
		let query = "&id=" + globals.id + "&pwd=" + globals.pwd + "&auto_ld=" + auto_ld + "&req=" + req;
		//$(myFormDiv+' #successfail').append('<div class="alert alert-success" role="alert"><b>Query : '+query+'</b></div>');
		$.post(globals.serverAddress, query, function(data){
			if(data.ok=="ok") {
				if(isApp) {
					openPdf(data.pdf, function() { console.log('Success');}, function() { console.log('Error');});
					//window.open(data.pdf, '_blank', 'location=false,enableViewportScale=yes,closebuttoncaption=Fermer');
				}
				else {
					window.open(data.pdf, '_blank', 'location=false,enableViewportScale=yes,closebuttoncaption=Fermer');
				}
			}
			else {
				if(isApp) navigator.notification.alert('Le document ne peut être téléchargé pour le moment !', App.alertDismissed, 'BoursoConvois', 'OK');
				else alert('Le document ne peut être téléchargé pour le moment !');
			}
		}, "json").always(function(data){
			$('#getPdfBtn').attr("disabled", false);
		});
	},

	fillAnswerLeads: function(auto_l, addr_l, addr_comp_l, dep_l, city_l, addr_dest_l, addr_dest_comp_l, dep_dest_l, city_dest_l, cat_l, num_arr_pref, name_l, tel_l, datedeb_l, datefin_l, long_l, large_l, height_l, weight_l, est_time, est_km, vp_av, vp_ar, guides, imat_tr, imat_sr, name_st)
	{
		// Generate lead's details page
		globals.lead = auto_l; // remember that lead.
		//let snippet = '<form action="javascript:App.answerLeads(\'#answerFormLeads\');" method="get" id="answerFormLeads">';
		//snippet += '<input type="hidden" name="auto_l" id="auto_l" value="'+auto_l+'">';
		let snippet = '<div class="card text-center w-auto border-warning">';
		snippet += '<h4 class="card-header border-warning">Identifiant de Convoi<span style="color:#FA0;"> #'+auto_l+'</span></h4>';
		snippet += '<div class="card-body"><h5 class="card-title"><span style="color:#FA0;">Prévu du </span>'+datedeb_l+'<span style="color:#FA0;"> au </span>'+datefin_l+'</h5></div>';
		snippet += '<ul class="list-group list-group-flush">';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Départ : </span>'+addr_l+' (Dep.'+dep_l+') - '+addr_comp_l+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Arrivée : </span>'+addr_dest_l+' (Dep.'+dep_dest_l+') - '+addr_dest_comp_l+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Besoin de: </span>'+vp_av+' VP avant(s), '+vp_ar+' VP arrière(s), '+guides+' Guideur(s)</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Convoi de catégorie : </span>'+cat_l+'<span style="color:#FA0;"> | N&deg;Arrêté préfectoral : </span>'+num_arr_pref+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Durée et kilométrage estimatif du convoi : </span>'+est_time+' pour '+est_km+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Longueur : </span>'+long_l+'<span style="color:#FA0;"> x Largeur : </span>'+large_l+'<span style="color:#FA0;"> x Hauteur : </span>'+height_l+'<span style="color:#FA0;"> et Masse : </span>'+weight_l+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Immatriculation: TR (Tracteur) </span>'+imat_tr+'<span style="color:#FA0;"> | SR (Remorque) </span>'+imat_sr+'</b></li>';
		snippet += '<li class="list-group-item"><b><span style="color:#FA0;">Contact chauffeur : </span>'+name_l+' / '+tel_l+'</b></li>';
		snippet += '</ul>';
		snippet += '<div class="card-body">';
		snippet += '<div class="row">';
		// Adding fill job' document button
		snippet += '<button class="btn btn-warning btn-block" id="fillJobDocumentBtn" onclick="App.fillJobDocument(\''+auto_l+'\', \''+addr_l+'\', \''+addr_comp_l+'\', \''+dep_l+'\', \''+city_l+'\', \''+addr_dest_l+'\', \''+addr_dest_comp_l+'\', \''+dep_dest_l+'\', \''+city_dest_l+'\', \''+cat_l+'\', \''+num_arr_pref+'\', \''+name_l+'\', \''+tel_l+'\', \''+datedeb_l+'\', \''+datefin_l+'\', \''+long_l+'\', \''+large_l+'\', \''+height_l+'\', \''+weight_l+'\', \''+est_time+'\', \''+est_km+'\', \''+vp_av+'\', \''+vp_ar+'\', \''+guides+'\', \''+imat_tr+'\', \''+imat_sr+'\', \''+name_st+'\')"><i class="fa fa-hourglass-start"></i> Bon de transport</button>';
		snippet += '</div>'; // End row
		//snippet += '<button class="btn btn-warning btn-block" id="sender" onclick="App.addWasValidatedClass(\'#answerFormLeads\')" type="submit">Valider <i class="fa fa-check-circle"></i></button>';
		snippet += '<div id="successfail"></div>';
		snippet += '</div>'; // End card-body
		//snippet += '</form>';
		snippet += '<div class="card-footer border-warning"><button class="btn btn-primary btn-block" onclick="App.changePage(\'homePage\', \'leadPage\')"><i class="fa fa-chevron-circle-left"></i> Retour </i></button></div>';
		$('#leadsDetailsCont').empty().append(snippet);
		App.changePage('leadPage', 'homePage');
	},

	safeJsonParse: function(input) {
		try {
			return JSON.parse(input);
		} catch (e) {
			return undefined;
		}
	},
	
	bindUIActions: function() {	
		if(!isApp) App.getLocation();
		// Is it Mobile device
		if(/Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)) isMobile = true;
		if(isMobile) {
			//$('#dateDep').prop('type', 'datetime');
			//$('#dateFin').prop('type', 'datetime');
		}
		// Connected or not
		if(globals.pass == "OK") {
			App.changePage('homePage', '');
			App.getLeads('loadEvent', true);
			let d = new Date();
			let year = d.getFullYear();
			$('#filterYear0').val(year);
			let m = d.getMonth(); // 0 to 11
			var month = m+1; // 1 to 12
			(month<10) ? month="0"+month : month=month;
			$('#filterMonth0').val(month);
			// Calculate week number
			// Set to nearest Thursday: current date + 4 - current day number
			// Make Sunday's day number 7
			d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
			// Get first day of year
			let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
			// Calculate full weeks to nearest Thursday
			let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);				
			$('#filterWeek0').val(weekNo);
		}
		else {
			$('#navLinks .connected').hide();
		}
		$('.expends').click(function () {
			$(this).next('div').slideToggle('slow');
			//$.mobile.silentScroll($(this).next('div').offset().top);
		});
		$('section, hr').click(function () {
			if(window.innerWidth < 991) {
				$('.navbar').slideToggle("slow");
				$('#navbar-collapse').removeClass('show');
				//alert(window.innerWidth);
			}
		});
		$('.nav-item').click(function () {
			if(window.innerWidth < 768) {
				//$('.navbar').slideToggle("slow");
				$('#navbar-collapse').removeClass('show');
				//alert(window.innerWidth);
			}
		});
		/*
		// Prevent Main Menu Dropdown to close when inside selectBox is clicked
		$('#dropdownMenuMain').on('click', function (e) {
			$(this).next().toggle();
		});
		*/
		$('.learn-more[href="#noscroll"]').click(function () {
			var link_clicked = $(this);
			var closestHiddenText = $(this).prev().children('.hidden-text');
			closestHiddenText.slideToggle("fast", function() {
				//$('.hidden-text').is(":visible").(this).text("<< Cacher");
				if ( closestHiddenText.css('display') == 'none' ){
					link_clicked.text("En savoir plus »");
				}
				else {
					link_clicked.text("<< Cacher");
				}
			});
		});
		$("[data-toggle=tooltip]").tooltip();
		document.addEventListener("scroll", function (event) {
			if (App.getDocHeight() == App.getScrollXY()[1] + window.innerHeight) {
				//$('.go-up-fixed').fadeOut('slow');
				globals.bottomScrolled=true;
			}
			else {
				globals.bottomScrolled=false;
				if(App.getScrollXY()[1] == 0) {
					$('.navbar').slideDown("slow");
					$('#navbar-collapse').removeClass('show');
					$('.go-up-fixed').fadeOut('slow');
				}
				else
					$('.go-up-fixed').fadeIn('slow');
			}
		});
		// DateTime Picker...
		$('#ui-datepicker-div').css("z-index", "100000");
		$.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );
		$.timepicker.regional['fr'] = {
			timeOnlyTitle: '',
			timeText: '&Agrave;',
			hourText: 'Heure',
			minuteText: 'Minute',
			secondText: 'Seconde',
			currentText: 'Maintenant',
			closeText: 'Fermer'
		};
		$.timepicker.setDefaults($.timepicker.regional['fr']);
		$("#date_cv").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#dep_datetime_1").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#arr_datetime_1").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#dep_datetime_2").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#arr_datetime_2").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#dep_datetime_3").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#arr_datetime_3").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#dep_datetime_4").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#arr_datetime_4").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#dep_datetime_5").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#arr_datetime_5").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		$("#vp_datetime_end").datetimepicker({
			changeMonth: true,
			changeYear: true,
			altField: "",
			timeFormat: "HH':'mm",
			minDate: new Date()
		});
		/*
		// Here we hide steps in formJobDocument...
		$('#modJobDocumentStep2').fadeOut();
		$('#modJobDocumentStep3').fadeOut();
		$('#leadToJobDocStep1').click(function () {
			setTimeout(function() {$('#modJobDocumentStep1').fadeIn();}, 500);
			$('#modJobDocumentStep2').fadeOut();
			$('#modJobDocumentStep3').fadeOut();
		});
		$('#leadToJobDocStep2').click(function () {
			$('#modJobDocumentStep1').fadeOut();
			setTimeout(function() {$('#modJobDocumentStep2').fadeIn();}, 500);
			$('#modJobDocumentStep3').fadeOut();
		});
		$('#leadToJobDocStep3').click(function () {
			$('#modJobDocumentStep1').fadeOut();
			$('#modJobDocumentStep2').fadeOut();
			setTimeout(function() {$('#modJobDocumentStep3').fadeIn();}, 500);
		});
		$('#backToStep2').click(function () {
			$('#modJobDocumentStep1').fadeOut();
			setTimeout(function() {$('#modJobDocumentStep2').fadeIn();}, 500);
			$('#modJobDocumentStep3').fadeOut();
		});
		*/
	},
	
	showThis: function(toShow)
	{
		$(toShow).show();
	},
	toggleThis: function(toToggle)
	{
		$(toToggle).slideToggle();
	},
	popMapFollowLeads: function()
	{
		$('#popupmax').fadeIn();
		// Map to follow the lead if not already initialized...
		if(map == undefined || map == null){
			map = L.map('mapLeads').setView(globals.defLatLng, globals.defZoom);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
		}
		setTimeout(function(){ map.invalidateSize()}, 100);
	},
	closeMapPop: function()
	{
		$('#popupmax').fadeOut();
	},
	clearAllInputs: function() {
		//$('#mainForm')[0].reset();
		//$(':input').val('');
		$('#infos :input').each(function() {
			if ($(this).is('select')) {
				$(this).val($(this).find('option[selected]').val());
			}
			else {
				$(this).val(this.defaultValue);
			}
		});
		//$("#slider").slider( "value", 1 );
		//$('#devis').prop( "checked", false );
	},
	//below taken from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
	getScrollXY: function () {
		var scrOfX = 0, scrOfY = 0;
		if( typeof( window.pageYOffset ) == 'number' ) {
			//Netscape compliant
			scrOfY = window.pageYOffset;
			scrOfX = window.pageXOffset;
		} else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
			//DOM compliant
			scrOfY = document.body.scrollTop;
			scrOfX = document.body.scrollLeft;
		} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
			//IE6 standards compliant mode
			scrOfY = document.documentElement.scrollTop;
			scrOfX = document.documentElement.scrollLeft;
		}
		return [ scrOfX, scrOfY ];
	},

	//taken from http://james.padolsey.com/javascript/get-document-height-cross-browser/
	getDocHeight: function () {
		var D = document;
		return Math.max(
			D.body.scrollHeight, D.documentElement.scrollHeight,
			D.body.offsetHeight, D.documentElement.offsetHeight,
			D.body.clientHeight, D.documentElement.clientHeight
		);
	}
};

(function() {
	
	App.init();

})();