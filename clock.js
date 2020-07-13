/*
 *
 *  Feature clock engine
 *  Peter Maloy
 *  MIT Licensed July 2020
 *
 */

const zipcode = '14609';


//const weatherapikey = 'Get your api key from https://openweathermap.org/price';

let weatherapikey = ''; // this will be initialized at the bottom of this file


const phases = [
    "New Moon",
    "Waxing Crescent Moon",
    "First Quarter Moon",
    "Waxing Gibbous Moon",
    "Full Moon",
    "Waning Gibbous Moon",
    "Third Quarter Moon",
    "Waning Crescent Moon",
    ];


function getTranslateXY( element ){
    const matrix = window.getComputedStyle( element ).transform.split(', ');
    const tX = matrix[4];
    const tY = matrix[5].slice(0,-1);

    return { tX, tY };
}


function weather(){
    fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&units=imperial&appid=${weatherapikey}`)
    .then(response => response.json())
    .then(data => renderweather(data));
}


function renderweather( data ){
    let icon;
    switch(data.weather[0].id){
        case 200:
        case 201:
        case 202:
        case 210:
        case 211:
        case 212:
        case 221:
        case 230:
        case 231:
        case 232: icon = 'climacon-cloud_lightning_sun.svg'; break;

        case 300:
        case 301:
        case 302:
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321: icon = 'climacon-cloud_drizzle_sun.svg'; break;

        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 511: icon = 'climacon-cloud_rain_sun.svg'; break;

        case 520:
        case 521:
        case 522:
        case 531: icon = 'climacon-cloud_rain_alt_sun.svg'; break;

        case 600: icon = 'climacon-cloud_snow_sun.svg'; break;

        case 601:
        case 602: icon = 'climacon-cloud_snow_alt_sun.svg'; break;

        case 611:
        case 612:
        case 615:
        case 616: icon = 'climacon-cloud_hail_alt_sun.svg'; break;

        case 620:
        case 621: icon = 'climacon-cloud_snow_sun.svg'; break;

        case 622: icon = 'climacon-cloud_snow_alt_sun.svg'; break;

        case 701: icon = 'climacon-cloud_fog_sun.svg'; break;

        case 711: icon = 'climacon-cloud_fog_alt_sun.svg'; break;

        case 721: icon = 'climacon-cloud_fog_sun.svg'; break;

        case 731: icon = 'climacon-tornado.svg'; break;

        case 741: icon = 'climacon-cloud_fog_sun.svg'; break;

        case 751:
        case 761:
        case 762:
        case 771: icon = 'climacon-cloud_fog_alt_sun.svg'; break;

        case 781: icon = 'climacon-tornado.svg'; break;

        case 800: icon = 'climacon-sun.svg'; break;

        case 801:
        case 802:
        case 803:
        case 804: icon = 'climacon-cloud_sun.svg'; break;
    }

    if( 'n' == data.weather[0].icon.substr(-1) ){
        icon = icon.replace( 'sun', 'moon' );
    }

    const wind = document.getElementsByClassName('windicon')[0];
    const translate = getTranslateXY( wind );
    wind.style.transform = `translateX(${translate.tX}px) translateY(${translate.tY}px) rotate(${data.wind.deg}deg)`;

    document.getElementsByClassName('weathericon')[0].src = '/styleclock/icons/'+icon;
    document.getElementsByClassName('mph')[0].textContent = Math.round(data.wind.speed)+'';
    document.getElementsByClassName('temperature')[0].textContent = Math.round(data.main.temp)+"°F";
}


function moonphase(){
    const date = new Date;
    const day   = date.getDate();
    let month = date.getMonth() + 1;
    let year  = date.getFullYear();

    if( month < 3 ){
        year--;
        month += 12;
    }
    ++month;
    const c = 365.25 * year;
    const e = 30.6 * month;
    let jd= c + e + day - 694039.09;
    jd /= 29.5305882;   // divide elapsed days by moon cycle
    const phase = Math.round(jd * 8) % 8;

    document.getElementsByClassName('moonphase')[0].style.backgroundImage = 'url("/styleclock/phase'+phase+'.png")';
}


function updateClock(){
    const date = new Date;
    const ms = date.getMilliseconds();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hour = date.getHours() % 12;

    const s = 360 * (seconds+ms/1000)/60;
    const m = 360 * (minutes/60 + seconds/3600);
    const h = 360 * (hour/12 + minutes/720 + seconds/43200) ;

    if( window.moment ){
        document.getElementsByClassName('calendar')[0].textContent = moment().format('ddd MMM Do');
    }

    if( window.dayjs ){
        document.getElementsByClassName('calendar')[0].textContent = dayjs().format('ddd MMM Do');
    }

    const hands = document.getElementsByClassName('hand');

    let rotate = 0;

    for( const hand of hands ){
        if( hand.classList.contains( 'hour' )){
            rotate = h;
        } else if( hand.classList.contains( 'minute' )){
            rotate = m;
        } else if( hand.classList.contains( 'second' )){
            rotate = s;
        }

        const translate = getTranslateXY( hand );

        hand.style.transform = `translateX(${translate.tX}px) translateY(${translate.tY}px) rotate(${rotate}deg)`;

    }
}


//
// Setup - fire off first calls & create interval timers
//

if( window.dayjs ){
    dayjs.extend(dayjs_plugin_advancedFormat);
}
setInterval( updateClock, 100 );
setInterval( moonphase, 1000*3600*8 );
moonphase();

//
// This is a convenience function to avoid putting the
// openweathermap api key into the git repo
//
fetch('/styleclock/apikey.txt')
    .then(response => response.json())
    .then(data => weatherapikey = data.key)
    .then(function(){
        setInterval( weather, 1000*600 );
        weather();
    });

