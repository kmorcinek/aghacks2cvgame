import random
import string
import array
import cherrypy
import simplejson
import json
import base64

class StringGeneratorWebService(object):
    exposed = True
    @cherrypy.tools.accept(media='application/json')
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def POST(self):
        input_json = cherrypy.request.json
        value = input_json["picture"]
        decoded = base64.b64decode(value[0])
        print decoded
        with open('/home/lukasz/Programowanie/hackaton/img.jpg', 'wb')as file:
            file.write(decoded)
        result = {"operation": "request", "result": "success"}
        return result
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