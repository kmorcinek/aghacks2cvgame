import tempfile
import subprocess

class Detect(object):
	def __init__(self, image):
		#image is base64 decoded
		self.image = image

	def detect(self):
		with open("tempfile.png",'w') as f:
			f.write(self.image) 
		output = subprocess.check_output(["./aruco_simple","tempfile.png"])
		return output