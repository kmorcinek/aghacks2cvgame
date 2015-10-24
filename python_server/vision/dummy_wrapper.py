import tempfile
import subprocess

class Detect(object):
	def __init__(self, image):
		#image is base64 decoded
		self.image = image

	def detect(self):
		with open("./python_server/vision/tempfile.png",'w') as f:
			f.write(self.image) 
		output = subprocess.check_output(["./python_server/vision/aruco_simple","./python_server/vision/tempfile.png"])
		return output