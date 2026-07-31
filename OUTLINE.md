Using API's
A request that can be sent from the browser to a server.  These requests typically return json data that can be used on your web page

Common Subcategories:

Third-Party Data APIs: 
Fetch live information like weather conditions, financial market rates, or maps (e.g., Google Maps API).
Payment Gateways: Securely process credit cards and online payments directly from a checkout page (e.g., Stripe API).
Social & Media APIs: Embed content, manage pins, or allow users to log in using external accounts (e.g., YouTube API, Pinterest API).

Typically standard google searches can help you locate any existing API
ie:  Is there an API that can give me a list of restaurants

There are also some universal lists that can be used to help find API's
https://apilist.fun/

Let's Write a web page that leverages OpenStreetMap API, to help Tim and Kylie find a restaurant

Step 1: use Nano Banana to create a background image

Step 2: Use curl to test the API calls we will be using

About: https://www.openstreetmap.org/about

Find Restaurants near the latitude and longitude of 40.9807,-73.6918
curl -s -X POST --data-urlencode 'data=[out:json];(nwr["amenity"="restaurant"](around:3000,40.9807,-73.6918););out center;' "https://overpass-api.de/api/interpreter" | python3 -m json.tool

Convert New York, NY to a latitude and longitude
curl -s "https://nominatim.openstreetmap.org/search?q=New%20York,%20NY&format=jsonv2&limit=1" -H "User-Agent: my-nextjs-site/1.0" | python3 -m json.tool

3. Show how app calls and displays
4. Assignment get curl to work
5. Add UI to drive the API
6. Add calls for data
7. Display Restaurants