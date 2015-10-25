### Brief description

We had a rack, on the rack was an Android tablet making a picture of a table every 5 second. This picture was send to a backend server processing images. The server was written in Python and using OpenCV library with Aruco Markers. Now *client* applications can be using the server by getting the image and the coordinates of markers found on the image. We had two client applications:
- Tank shooting to a target
- Solving Puzzles

### Augmented Reality

Links: http://www.uco.es/investiga/grupos/ava/node/26 (to approve)
Video From Maciek, inspiration

### Markers

https://github.com/bhollis/aruco-marker
pic of marker.

To make it possible to easily find what is happening on the board we use markers which are recognized by the backend server. Each mark have an Id. We gave some ids special meaning (as in Tank example):
- 299 - its a target
- xxx and xxx together - work a tank shooting in a direction of one marker
- all other ids - obstacles
 

 
# aghacks2cvgame example API calls:

This project opens an API
/send_android - accepts post request for android with json data. 



GET:   /detector?game_name=name_of_the_game
returns detected markers on photo in this manner:
'''
[{"id:"64",positions:[{"x":231.657,"y":366.941} {"x":198.9,"y":348.996} {"x":215.503,"y":317.11} {"x":248.225,"y":335.626} ]},{"id:"76",positions:[{"x":367.434,"y":232.909} {"x":333.19,"y":214.851} {"x":351.047,"y":181.93} {"x":385.39,"y":200.131} ]},]
'''

GET /zdjecie?game_name=name_of_the_game
returns photo taken by the device
