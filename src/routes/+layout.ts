export const ssr = false;
function getUserPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('Geolocation is not supported by this browser.'));
        }
        navigator.geolocation.getCurrentPosition(
            resolve,
            (err) => {
                let msg = 'An unknown error occurred.';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        msg = 'Location access was denied. Please enable it to see prayer times.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        msg = 'Location information is unavailable.';
                        break;
                    case err.TIMEOUT:
                        msg = 'The request to get user location timed out.';
                        break;
                }
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}
export interface GeoData {
    city: string;
    countryName: string;
}

export interface PrayerTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export interface PrayerData {
    timings: PrayerTimings;
    date: {
        readable: string;
        hijri: {
            day: string;
            weekday: { en: string };
            month: { en: string };
            year: string;
        };
    };
}
export interface PrayerDataAPI {
    code: number,
    status: string,
    data: [
        {
            timings: PrayerTimings,
            date: {
                readable: string
            }
        }
    ]
}
async function fetchPrayerApiData(latitude: number, longitude: number): Promise<PrayerDataAPI> {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const apiUrl = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=2`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}

async function fetchGeoData(latitude: number, longitude: number): Promise<GeoData> {
    const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(geoApiUrl);
    if (!response.ok) return { city: 'Unknown City', countryName: 'Unknown Country' };
    return response.json();
}


export const load = async () => {
    const position = getUserPosition();
    const prayerData = position.then((pos) => fetchPrayerApiData(pos.coords.latitude, pos.coords.longitude))
    const geoData = position.then((pos) => fetchGeoData(pos.coords.latitude, pos.coords.longitude))
    // if (!(prayerApiData.code === 200 && prayerApiData.data.length > 0)) {
    //     throw new Error('Could not retrieve prayer times for your location.');
    // }
    // const dayOfMonth = new Date().getDate();
    // prayerData = prayerApiData.data[dayOfMonth - 1];
    // locationName = `${geoData.city}, ${geoData.countryName}`;
    return {
        positionData: position,
        prayerData: prayerData,
        geoData: geoData
    }
}