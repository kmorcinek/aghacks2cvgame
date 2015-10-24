# aghacks2cvgame

Here we can write system wide info. Like how to call our services, etc.
##
This project opens an API
/send_android - accepts post request for android with json data. 



GET:   /detector?game_name=name_of_the_game
returns detected markers on photo in this manner:
'''
[{"id:"64",positions:[{"x":231.657,"y":366.941} {"x":198.9,"y":348.996} {"x":215.503,"y":317.11} {"x":248.225,"y":335.626} ]},{"id:"76",positions:[{"x":367.434,"y":232.909} {"x":333.19,"y":214.851} {"x":351.047,"y":181.93} {"x":385.39,"y":200.131} ]},]
'''

GET /zdjecie?game_name=name_of_the_game
returns photo taken by the device
