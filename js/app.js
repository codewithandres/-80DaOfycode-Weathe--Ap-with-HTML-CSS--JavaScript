const searchInput = document.querySelector('.search--input');
const currentWeatherDiv = document.querySelector('.current--waather');
const locationButton = document.querySelector('.location--button');
const hourlyWeatherDiv = document.querySelector(
	'.hourly--weather .weather--list',
);

const API_KEY = 'c9b527cd8e9e4da38b0235433241108';

const weatherCodes = {
	clear: [1000],
	clouds: [1003, 1006, 1009],
	mist: [1030, 1135, 1147],
	moderate_heavy_rain: [1186, 1189, 1192, 1243, 1246],
	thunder: [1087, 1279, 1282],
	thunder_rain: [1273, 1276],
	rain: [
		1063, 1150, 1153, 1168, 1171, 1180, 1183, 1189, 1201, 1240, 1243, 1246,
		1273, 1276,
	],
	snow: [
		1066, 1069, 1072, 1114, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225,
		1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
	],
};

const displayHourlyForescat = (hourlyData) => {
	const currentHour = new Date().setMinutes(0, 0, 0);
	const next24Hours = currentHour + 24 * 60 * 60 * 1000;

	//filter the hourly data to only include the next 24 hours
	const next24HoursData = hourlyData.filter(({ time }) => {
		const forescatTime = new Date(time).getTime();
		return forescatTime >= currentHour && forescatTime <= next24Hours;
	});

	hourlyWeatherDiv.innerHTML = next24HoursData
		.map(({ temp_c, condition, time }) => {
			const temperature = Math.floor(temp_c);
			const times = time.split(' ').at(1).substring(0, 5);

			const weatherIcon = Object.keys(weatherCodes).find((icon) =>
				weatherCodes[icon].includes(condition.code),
			);

			return `
				<li class="weather--item animate__animated animate__bounceIn animate__delay-1s">
					<p class="time">${times}</p>
					<img src="assets/icons/${weatherIcon}.svg" class="weather--icon">
					<p class="temperature">${temperature}°</p>
				</li>`;
		})
		.join('');

	//console.log(hourlyWeatherHTML);
};

const getWeatherDetails = async (API_URL) => {
	window.innerWidth <= 768 && searchInput.blur();
	document.body.classList.remove('show--no--result');

	try {
		//Fetch weather data from the Api and parse the response as Json
		const response = await fetch(API_URL);
		const { current, forecast } = await response.json();

		//extrac current weather details
		const { temp_c } = current;
		const { text, code } = current.condition;

		const weatherIcon = Object.keys(weatherCodes).find((icon) =>
			weatherCodes[icon].includes(code),
		);

		//Update the current weather display
		currentWeatherDiv.querySelector(
			'.temperature',
		).innerHTML = `${Math.floor(temp_c)} <span>°C</span>`;

		currentWeatherDiv.querySelector(
			'.weather--icon',
		).src = `assets/icons/${weatherIcon}.svg`;
		currentWeatherDiv
			.querySelector('.weather--icon')
			.classList.add('animate__jello', 'animate__animated');

		currentWeatherDiv.querySelector('.description').textContent = text;
		currentWeatherDiv
			.querySelector('.description')
			.classList.add(
				'animate__animated',
				'animate__slideInDown',
				'animate__delay-300ms',
			);

		//combine hourly data from today and tomorrow
		const combinedHourliData = [
			...forecast.forecastday.at(0).hour,
			...forecast.forecastday.at(1).hour,
		];

		displayHourlyForescat(combinedHourliData);
	} catch (error) {
		document.body.classList.add('show--no--result');
	}
};

//set up the weather request for a specific city
const setuWeatherRequest = (cityName) => {
	const API_URL = ` http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;

	getWeatherDetails(API_URL);
};

// handle user input in the search box
searchInput.addEventListener('keyup', (event) => {
	const cityName = searchInput.value.trim();

	if (event.key === 'Enter' && cityName) setuWeatherRequest(cityName);
});

//Get user coordinates
locationButton.addEventListener('click', () => {
	navigator.geolocation.getCurrentPosition(
		(position) => {
			const { altitude, longitude } = position.coords;

			const API_URL = ` http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${altitude},${longitude}&days=2`;

			getWeatherDetails(API_URL);
		},
		(error) => {
			alert(
				'Location accees denied, please enable permission to use this feature ',
			);
		},
	);
});
