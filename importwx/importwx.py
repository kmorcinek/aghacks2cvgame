import wx

class MyFrame(wx.Frame):
  def __init__(self, parent, id, title):
    wx.Frame.__init__(self, parent, id, title)

    self.bitmap = wx.Bitmap('grafika.jpg')
    wx.EVT_PAINT(self, self.OnPaint)

    self.Centre()

  def OnPaint(self, event):
      dc = wx.PaintDC(self)
      dc.DrawBitmap(self.bitmap, 0, 0)
      dc.DrawPolygon(((411,509),(460,433),(535,481),(487,557)))


class MyApp(wx.App):
  def OnInit(self):
      frame = MyFrame(None, -1, 'grafika')
      frame.Show(True)
      self.SetTopWindow(frame)
      return True

app = MyApp(0)
app.MainLoop()