# Using API's
A request that can be sent from the browser to a server.  These requests typically return json data that can be used on your web page

## Common API Categories:

### Third-Party Data APIs: 
Fetch live information like weather conditions, financial market rates, or maps (e.g., Google Maps API).
Payment Gateways: Securely process credit cards and online payments directly from a checkout page (e.g., Stripe API).

### Social & Media APIs:
Embed content, manage pins, or allow users to log in using external accounts (e.g., YouTube API, Pinterest API).

## Finding and Using APIs

### Typically standard google searches can help you locate any existing API
ie:  Is there an API that can give me a list of restaurants

### There are also some universal lists that can be used to help find API's
https://apilist.fun/

### About the API we are demonstrating: 
https://www.openstreetmap.org/about

## Assignment
Let's Write a web page that leverages OpenStreetMap API, to help Tim and Kylie find a restaurant

### Step 1: 
Use Nano Banana to create a background image

### Step 2:
Use curl to test the API calls we will be using

### Convert New York, NY to a latitude and longitude
```bash
curl -s "https://nominatim.openstreetmap.org/search?q=New%20York,%20NY&format=jsonv2&limit=1" -H "User-Agent: my-nextjs-site/1.0" | python3 -m json.tool
```

### Find Restaurants near the latitude and longitude of 40.9807,-73.6918
```bash
curl -s -X POST --data-urlencode 'data=[out:json];(nwr["amenity"="restaurant"](around:3000,40.9807,-73.6918););out center;' "https://overpass-api.de/api/interpreter" | python3 -m json.tool
```



### Step 3:
Install or use curl if possible; otherwise, I will also demonstrate

### Step 4:
Create a HTML page using the background you created.  Add UI to accept a City and State

### Step 5:
When the user selects Search call for data using TypeScript or JavaScript

### Step 6:
Display Restaurants

## Reference
https://github.com/CosmoScriv/my-nextjs-site/blame/main/src/app/page.tsx
https://github.com/CosmoScriv/my-nextjs-site/blob/main/OUTLINE.md#finding-apis
https://docs.google.com/presentation/d/1NvkiWIwNg-tduvAnhvhWXsrpxvw5H8JOGuMo3eIriEc/edit?pli=1&slide=id.g3f61161615c_0_0#slide=id.g3f61161615c_0_0

