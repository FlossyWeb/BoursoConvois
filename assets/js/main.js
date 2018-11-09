var globals, map, locationSelect, markers_id = [], markers, isMobile=false,
App = {

	settings: {
		pass: $.localStorage.getItem('pass'),
		defLatLng: [48.86, 2.33],
		defZoom: 6,
		bottomScrolled: false,
		serverAddress: "https://www.boursoconvois.com/db/in_app_calls.php",
		loginAddress: "https://www.boursoconvois.com/db/in_station_calls.php",
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
		$("#now-date").append(globals.year);
	},

	logMeIn: function (myParentDiv) {
		$(myParentDiv+' #sender').attr("disabled", true);
		var credLogin = $(myParentDiv+' #login').val();
		var credPass = $(myParentDiv+' #pass').val();
		//var credType = $(myParentDiv+' #businessType').val();
		$.post(globals.loginAddress, {req: 'login', login: credLogin, pass: credPass, type: 2}, function(data){
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
				$('#loginPage').fadeOut();
				$('#homePage').fadeIn();
				setTimeout(function(){
					App.refreshGlobals(data);
				}, 1000);
			}
			else {
				if(app) navigator.notification.alert("Identifiant ou mot de passe erroné !", alertDismissed, 'BoursoConvois', 'OK');
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
		$.post(globals.serverAddress, {req: 'forgottenPwd', login: forgotEmail}, function(data){
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
	
	locateMe: function(myEvent) {
		switch(myEvent) 
		{
			case "load":
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
					alert("Localisation impossible, veuillez v&eacute;rifier l'&eacute;tat de votre connection ainsi que la disponibilit&eacute; des services de localisation dans les réglages de votre appareil.");
				}
			  break;
			default:
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
					alert("Localisation impossible, veuillez v&eacute;rifier l'&eacute;tat de votre connection ainsi que la disponibilit&eacute; des services de localisation dans les réglages de votre appareil.");
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
				if(app) navigator.notification.alert('Adresse inconnue !! Veuillez la saisir manuellement SVP.', alertDismissed, 'Mon Appli Taxi', 'OK');
				else alert('Adresse inconnue !! Veuillez la saisir manuellement SVP.');
			}
		}, "json").done(function() { 
		});
		*/
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
		if (error.code == error.TIMEOUT || error.code == error.POSITION_UNAVAILABLE) {
			// Fall back to low accuracy and any cached position available...
			navigator.geolocation.getCurrentPosition(App.codeLatLng, function(){
				alert(geoAlert);
			},{enableHighAccuracy:false, maximumAge:Infinity, timeout: 6000});
		}
		else {
			alert(geoAlert);
		}
	},
	
	searchLocations: function()
	{
		App.clearMap();
		var blackIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-black.png'}), greyIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-grey.png'});
		var rdv = $('#addressInput').val();
		var dest = $('#DestAddress').val();
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
					//alert(latlng);
					globals.defLatLng = latlng;
					globals.defdestLatLng = dlatlng;
					//map.setView(L.LatLng(lat,lng), globals.defZoom);
					map.setView(latlng, globals.defZoom);
					L.marker(globals.defLatLng, {icon: greyIcon}).addTo(map)
						.bindPopup('<p><b>Départ: </b>'+rdv+'</p>', {autoClose: false})
						.openPopup();
					L.marker(globals.defdestLatLng, {icon: blackIcon}).addTo(map)
						.bindPopup('<p><b>Arrivée: </b>'+dest+'</p>')
						.openPopup();
					var circle = L.circle(globals.defLatLng, {
						color: '#FFAB00',
						fillColor: '#FFBF00',
						fillOpacity: 0.2,
						radius: 100000
					}).addTo(map);
				});
			});
		}
		else {
			if(app) navigator.notification.alert("Vous devez renseigner les adresses de départ et d'arrivée.", alertDismissed, 'Mon Appli Taxi', 'OK');
			else alert("Vous devez rensigner les adresses de départ et d'arrivée.");
		}
	},
	
	showLeadOnMap: function(auto_l, addr_l, addr_comp_l, dep_l, city_l, addr_dest_l, addr_dest_comp_l, dep_dest_l, city_dest_l, cat_l, num_arr_pref, name_l, tel_l, datedeb_l, datefin_l, long_l, large_l, height_l, weight_l, est_time, est_km, vp_av, vp_ar, guides, imat_tr, imat_sr, lat_p, lng_p, timestamp_p, page)
	{
		if(page=='bourse') App.popMapFollowLeads();
		var greenIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-green.png'}), redIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-red.png'}), orangeIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-orange.png'});
		App.clearMap('bourse');
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
							.bindPopup('<p><b>Convois positionné le:<br>'+timestamp_p+'</b></p>', {autoClose: false})
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
			if(app) navigator.notification.alert("Vous devez renseigner les adresses de départ et d'arrivée.", alertDismissed, 'Mon Appli Taxi', 'OK');
			else alert("Vous devez rensigner les adresses de départ et d'arrivée.");
		}
		// Filling info fields
		$('#addressInput').val(addr_l);
		$('#DestAddress').val(addr_dest_l);
		$('#etd').val(datedeb_l);
		$('#eta').val(datefin_l);
		$('#jobCat').val(cat_l);
		$('#Accurate').val(name_l);
		$('#cellular').val(tel_l);
		$('#depDep').val(dep_l);
		$('#depArr').val(dep_dest_l);
		$('#coms').val("Longueur: "+long_l+", Largeur: "+large_l+", Hauteur: "+height_l+"et Masse: "+weight_l+"\n"+"Estimation Durée(heures)/Km: "+est_time+" / "+est_km+"\n"+"Immatriculations TR/SR: "+imat_tr+" / "+imat_sr+"\n"+"Postes: VP AV = "+vp_av+" / VP AR = "+vp_ar+" / Guideur(s) = "+guides+"\n");
	},
	
	showDriverOnMap: function(lat_p, lng_p, timestamp_p, page)
	{
		var greenIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-green.png'}), redIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-red.png'}), orangeIcon = new globals.LeafIcon({iconUrl: 'assets/img/leaflet/marker-icon-2x-orange.png'});
		App.clearMap('bourse');
		let latlng_p = [parseFloat(lat_p), parseFloat(lng_p)];
		//map.setView(L.LatLng(lat,lng), globals.defZoom);
		map.setView(latlng_p, globals.defZoom);
		if(lat_p!=0 && lng_p!=0) {
			L.marker(latlng_p, {icon: orangeIcon}).addTo(map)
				.bindPopup('<p><b>VP / Guideur positionné le:<br>'+timestamp_p+'</b></p>')
				.openPopup();
			var circle = L.circle(latlng_p, {
				color: '#FFAB00',
				fillColor: '#FFBF00',
				fillOpacity: 0.2,
				radius: 100000
			}).addTo(map);
			// hidePanel
			$('#hidePanel').trigger('click');
		}
		else alert("Ce VP / Guideur n'a jamais été géolocalisé !!");
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
			if(myEvent=="justMineDep") filterDep = $('#filterDep0').val();
			else if (myEvent=="Dep") filterDep = $('#filterDep1').val();
			if(myEvent=="justMineDate") {
				filterYear = $('#filterYear0').val();
				filterMonth = $('#filterMonth0').val();
				filterWeek = $('#filterWeek0').val();
			}
			else if (myEvent=="Date") {
				filterYear = $('#filterYear1').val();
				filterMonth = $('#filterMonth1').val();
				filterWeek = $('#filterWeek1').val();
			}
			$.post(globals.serverAddress, {id: globals.id, admin: globals.admin, type: globals.type, pwd: globals.pwd, req: 'getLeads', filter: myEvent, dep: filterDep, year: filterYear, month: filterMonth, week: filterWeek}, function(data){ 
				if(data.ok=="ok") {
					// $('#leadsCont') to be filled
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

	modLeads: function(myFormDiv)
	{
		$(myFormDiv+' #sender').attr("disabled", true);
		let query = $(myFormDiv).serialize();
		let req = "modLeads";
		query = query + "&id=" + globals.id + "&pwd=" + globals.pwd + "&req=" + req;
		var returns = "";
		//$(myFormDiv+' #successfail').append('<div class="alert alert-success" role="alert"><b>Query : '+query+'</b></div>');
		$.post(globals.serverAddress, query, function(data){
			if(data.ok=="ok") {
				returns = '<div class="alert alert-success" role="alert"><b>Votre demande de convoi a bien été modifiée.</b></div>';
				App.getLeads('loadEvent', true);
			}
			else
				returns = '<div class="alert alert-danger" role="alert"><b>Votre demande de convoi n\'a pas été modifiée suite à un problème technique.</b></div>';
		}, "json").always(function(data){
			$(myFormDiv+' #sender').attr("disabled", false);
			$(myFormDiv+' #successfail').empty().append(returns);
		});
	},

	fillModLeads: function(auto_l, addr_l, addr_comp_l, dep_l, city_l, addr_dest_l, addr_dest_comp_l, dep_dest_l, city_dest_l, cat_l, num_arr_pref, name_l, tel_l, datedeb_l, datefin_l, long_l, large_l, height_l, weight_l, est_time, est_km, vp_av, vp_ar, guides, imat_tr, imat_sr)
	{
		$('#modFormLeads #auto_l').val(auto_l);
		$('#modFormLeads #addressAutoMod').val(addr_l);
		$('#modFormLeads #address_comp').val(addr_comp_l);
		$('#modFormLeads #depMod').val(dep_l);
		$('#modFormLeads #cityDepMod').val(city_l);
		$('#modFormLeads #addressDestAutoMod').val(addr_dest_l);
		$('#modFormLeads #address_dest_comp').val(addr_dest_comp_l);
		$('#modFormLeads #depDestMod').val(dep_dest_l);
		$('#modFormLeads #cityDestMod').val(city_dest_l);
		$('#modFormLeads #dateDepMod').val(datedeb_l);
		$('#modFormLeads #dateFinMod').val(datefin_l);
		$('#modFormLeads #categorie').val(cat_l);
		$('#modFormLeads #long').val(long_l);
		$('#modFormLeads #large').val(large_l);
		$('#modFormLeads #height').val(height_l);
		$('#modFormLeads #weight').val(weight_l);
		$('#modFormLeads #est_time').val(est_time);
		$('#modFormLeads #est_km').val(est_km);
		$('#modFormLeads #num_pref').val(num_arr_pref);
		$('#modFormLeads #vp_av').val(vp_av);
		$('#modFormLeads #vp_ar').val(vp_ar);
		$('#modFormLeads #guides').val(guides);
		$('#modFormLeads #name_drv').val(name_l);
		$('#modFormLeads #phone_drv').val(tel_l);
		$('#modFormLeads #imat_tr').val(imat_tr);
		$('#modFormLeads #imat_sr').val(imat_sr);
		// Fill the delLeadCont with detLead Button (auto_l)
		let delLeadBtn = '<a href="#modal-header" class="btn btn-danger btn-block" id="delLeadBtn" onClick="App.delLeads(\''+auto_l+'\')"><i class="fa fa-eraser"></i> Supprimer</a>';
		$('#modFormLeads #delLeadCont').empty().append(delLeadBtn);
	},

	delLeads: function(auto_l)
	{
		$('#delLeadBtn').attr("disabled", true);
		let req = "delLeads";
		let query ="&id=" + globals.id + "&pwd=" + globals.pwd + "&auto_l=" + auto_l + "&req=" + req;
		$.post(globals.serverAddress, query, function(data){
			if(data.ok=="ok") {
				alert('Cette demande de convoi a bien été supprimée');
				$('#modLeadModal').modal('toggle');
				App.getLeads('loadEvent', true);
			}
			else
				alert("Suite à un problème technique, cette demande de convoi n'a pas été supprimée.");
		}, "json").always(function(data){
			$('#delLeadBtn').attr("disabled", false);
		});
	},

	safeJsonParse: function(input) {
		try {
			return JSON.parse(input);
		} catch (e) {
			return undefined;
		}
	},
	
	bindUIActions: function() {
		// Is it Mobile device
		if(/Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent)) isMobile = true;
		if(isMobile) {
			$('#dateDep').prop('type', 'datetime');
			$('#dateFin').prop('type', 'datetime');
		}
		// Connected or not
		if(globals.pass == "OK") {
			$('#header-not-yet-connected').hide();
			$('#header-connected').show();
			switch (globals.type) {
				case '0':
					$('#header-connected-transporteurs').show();
				  break;
				case '1':
					$('#header-connected-pilotes').show();
				  break;
				case '2':
					$('#header-connected-stores').show();
				  break;
				default:
					alert("Connecté sans type !!");
			}
		}
		else {
			$('#header-connected').hide();
			$('#header-not-yet-connected').show();
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