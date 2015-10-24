import random
import string
import array
import cherrypy
import json
import base64
import sqlite3
import vision.dummy_wrapper
import simplejson

testowa_gra = ""
with open('python_server/vision/majortestsmaller2.jpg') as f:
    testowa_gra = f.read()


class StringGeneratorWebService(object):
    data = {"testowa_gra":testowa_gra}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def send_android(self):
        input_json = cherrypy.request.json
        value = input_json["picture"]
        game_name = input_json["game_name"]
        decoded = base64.b64decode(value[0])
        self.data[game_name] = decoded
        result = {"operation": "request", "result": "success"}
        return result

    @cherrypy.expose
    def detector(self,game_name):
        detector = vision.dummy_wrapper.Detect(self.data[game_name])
        return detector.detect()
        
    @cherrypy.expose
    def zdjecie(self,game_name):
        cherrypy.response.headers['Content-Type'] = "image/jpg"
        return self.data[game_name]

if __name__ == '__main__':
    conf = {
        '/': {
            'tools.response_headers.on': True,
        }
    }
    cherrypy.config.update({'server.socket_host': '0.0.0.0',
                        'server.socket_port': 80,
                       })
    cherrypy.quickstart(StringGeneratorWebService(), '/', conf)
