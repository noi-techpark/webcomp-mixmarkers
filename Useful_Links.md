**USEFUL LINKS**

https://opendatahub.com/datasets/

https://webcomponents.opendatahub.com/webcomponent/generic-map

https://github.com/noi-techpark/webcomp-generic-map

https://databrowser.opendatahub.com/dataset-overview/178ea911-cc54-418e-b42e-52cad18f1ec1

https://mobility.api.opendatahub.com/v2/flat/ParkingStation/free/latest

https://mobility.api.opendatahub.com/v2/flat/ParkingStation/free/latest?select=sname,mvalue,smetadata.capacity

https://databrowser.opendatahub.com/dataset-overview/0e90b559-ef57-4aef-8c0a-a33fc4af4508

https://webcomponents.opendatahub.com/webcomponent/gastronomies

https://databrowser.opendatahub.com/dataset-overview/5e02e0ab-dcf7-40b1-959d-afaa80da44fa

https://mobility.api.opendatahub.com/v2/flat/BikeCounter

https://webcomponents.opendatahub.com/webcomponent/creative-industries

https://webcomponents.opendatahub.com/webcomponent/tourism-detail

https://swagger.opendatahub.com/?url=https://mobility.api.opendatahub.com/v2/apispec#/Mobility%20V2/get_v2__representation_

https://tourism.api.opendatahub.com/swagger/index.html#/




Gastronomies Api Call
https://tourism.api.opendatahub.com/v1/ODHActivityPoi?tagfilter=gastronomy&active=true&fields=Detail.it.Title,GpsInfo

tagfilter = filtro per categoria
active= true  prendi solo dati attivi
fields = mostra solo i campi del json indicati

Points of Intrests      //FATTO
https://tourism.api.opendatahub.com/v1/ODHActivityPoi?tagfilter=poi&active=true&fields=Detail.it.Title,GpsInfo

Activities
https://tourism.api.opendatahub.com/v1/ODHActivityPoi?tagfilter=activity&active=true&fields=Detail.it.Title,GpsInfo

Creative Industries //FATTO
https://mobility.api.opendatahub.com/v2/flat/CreativeIndustry?origin=webcomp-creative-industries/


Flight Data
https://mobility.api.opendatahub.com/v2/flat%2Cnode/Flight?limit=-1&offset=0&shownull=false&distinct=true&where=and%28or%28smetadata.fromdestination.eq.BZO%2Csmetadata.todestination.eq.BZO%29%2Csmetadata.departure_timestamp.gt.1715332085.994%2Csmetadata.departure_timestamp.lt.1746868085.994%29&origin=webcomp-flightdata