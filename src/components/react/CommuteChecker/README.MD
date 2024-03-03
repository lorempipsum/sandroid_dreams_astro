# Commute Checker 

This is a simple React app that checks the commute time between two locations. It uses the Google Maps API to get the commute time and the Google Places API to get the location coordinates. 

## Architecture

Here is how it works: 

1. The user enters their "home" and "work" locations. 
1. The app uses the Google Places API to get the coordinates of the home and work locations.
1. The app uses the Google Maps API to get the commute time between the two locations in three ways: 
    - Driving
    - Walking
    - Bicycling
    - Transit
1. The app displays the commute time for each mode of transportation.
1. The app uses the Google Maps API to display the route between the two locations.
   

### Front End 

    Work [INPUT_BOX]: ____________
    Home [INPUT_BOX]: ____________
    [Lookup Button]

    ------------ Divider ------------
    Driving: 30 minutes
    Walking: 1 hour
    Bicycling: 45 minutes
    Transit: 1 hour 15 minutes
    MAP:
    ------------------------------
    |                            |
    |                            |
    |      *                     |
    |     /            *         |
    |    / 1 hour     /          |
    |    |           /           |
    |    |          / 30 min     |
    |    |         /             |
    |    |        /              |
    |    |       /               |
    |    *------/                |
    |                            |
    ------------------------------