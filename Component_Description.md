#Emanuele Pippa & Anastasiia Guliaeva.
To start this project, we used the weather-map created by the Noi Techpark team.



**Component Preliminary Description**
--------------------------------------------------------------------------------------------------------------
It takes different APIs, and shows them on an interactive map. It uses the coordinates to point the markers on the map,
and the *metadata* to provide real-time information such as *Weather*, *Name*, *Altitude*, *Website*, *Contacts*.


*config.js*
--------------------------------------------------------------------------------------------------------------
This class contains the calls to the APIs (base URL).


*ApiMobility.js & ApiTourism.js*
--------------------------------------------------------------------------------------------------------------
These classes contain the callGet functions to export the asyncronous functions, which contain the remaining URL path.
(They let the index.js class read the API)


*index.js*
--------------------------------------------------------------------------------------------------------------
- The first part defines the relation/interaction with the map.
- setUpButtonHandlers() sets the button actions. When a button is clicked, an asyncronous function is executed. ex. callGastronomiesApiDrawMap().

- **callIndustriesApiDrawMap()** is an asyncronous function.
    - It uses this.removeMarkerFromMap() to remove the already present markers, avoiding their sovrapposition.
    - In the *try{...}catch{...}* is setted the reading of specific parameters present in the API. 
    (ex. *const industriesData = await this.fetchCreative("scoordinate")*)
    - If the coordinates exist (are present in the API), they are stored into an array, together with the datas and the popupbody.
    - If the array contains datas, markers are created in the map at the positions indicated from the coordinates. If clicked, the popupbody is displayed.
    The popubody contains information as the Name and others Metadata.


*index.html*
--------------------------------------------------------------------------------------------------------------

It contains the html Web-page, with the buttons.