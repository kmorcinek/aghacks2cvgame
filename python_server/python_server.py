import random
import string
import array
import cherrypy
import json
import base64
import sqlite3
import vision.dummy_wrapper

DATABASE_PATH = "~/db.sql"

class StringGeneratorWebService(object):
    exposed = True
    data = {}
    @cherrypy.tools.accept(media='application/json')
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def POST(self):
        input_json = cherrypy.request.json
        value = input_json["picture"]
        game_name = input_json["game_name"]
        decoded = base64.b64decode(value[0])
        data[game_name] = decoded
        #print decoded
        #db = sqlite3.connect(DATABASE_PATH)
        #db.execute('CREATE TABLE t (thebin BLOB)')
        #db.execute('INSERT INTO pictures VALUES(?)', [buffer(decoded),game_name])
        #db.commit()
        #db.close()
        #with open('/home/lukasz/Programowanie/hackaton/img.jpg', 'wb')as file:
        #    file.write(decoded)
        result = {"operation": "request", "result": "success"}
        return result


    def GET(self,game_name):
        detector = vision.dummy_wrapper.Detect(self.data[game_name])
        return detector.detect()

    def picture(self,game_name):
        cherrypy.response.headers['Content-Type'] = "image/jpg"
        return self.data[game_name]

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
        }
    }
    cherrypy.quickstart(StringGeneratorWebService(), '/', conf)