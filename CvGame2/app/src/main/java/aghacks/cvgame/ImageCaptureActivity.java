package aghacks.cvgame;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.os.Bundle;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

public class ImageCaptureActivity extends Activity {
	private static final String url = "http://178.62.103.235";

	FrameLayout frameLayout;
	private String gameId = new String();

	public void buttonAction(View v) {
		EditText editText = (EditText) findViewById(R.id.game_id);
		gameId = editText.getText().toString();

		if (gameId.length() < 3) {
			Toast.makeText(context, "Game name must be at least 3 characters long",Toast.LENGTH_LONG).show();
		} else {
			Runnable pictureRunnable = new Runnable() {
				@Override
				public void run() {
					try {
						int cameraNumber = Camera.getNumberOfCameras();
						System.out.println("Number of camera:" + cameraNumber);
						Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
						Camera.getCameraInfo(0, cameraInfo);

						System.out.println(cameraInfo.toString());
						System.out.print(c.getParameters().toString());
						if (c != null) {
							//System.out.println("Taking picture");
							width = c.getParameters().getPictureSize().width;
							height = c.getParameters().getPictureSize().height;
							c.takePicture(null, null, null, jpegPictureCallback);
							System.out.println("Picture taken");

						} else {
							System.out.println("Cannot access camera.");
						}
					} catch (Exception e) {
						System.out.println("Camera error");
						e.printStackTrace();
					}
				}
			};
			pictureScheduledFuture = scheduler.scheduleAtFixedRate(pictureRunnable, 0, 5000, MILLISECONDS);
		}
	}

	private static File getOutputMediaFile(int type) {
		// To be safe, you should check that the SDCard is mounted
		// using Environment.getExternalStorageState() before doing this.

		File mediaStorageDir =
				new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "MyCameraApp");
		// This location works best if you want the created images to be shared
		// between applications and persist after your app has been uninstalled.

		// Create the storage directory if it does not exist
		if (!mediaStorageDir.exists()) {
			if (!mediaStorageDir.mkdirs()) {
				Log.d("MyCameraApp", "failed to create directory");
				return null;
			}
		}

		// Create a media file name
		String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
		File mediaFile;
		if (type == MEDIA_TYPE_IMAGE) {
			mediaFile = new File(mediaStorageDir.getPath() + File.separator +
					"IMG_" + timeStamp + ".jpg");
		} else if (type == MEDIA_TYPE_VIDEO) {
			mediaFile = new File(mediaStorageDir.getPath() + File.separator +
					"VID_" + timeStamp + ".mp4");
		} else {
			return null;
		}

		return mediaFile;
	}

	private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	private ScheduledFuture pictureScheduledFuture;

	public static final int MEDIA_TYPE_IMAGE = 1;
	public static final int MEDIA_TYPE_VIDEO = 2;

	protected RequestQueue queue;

	Camera.PictureCallback jpegPictureCallback;
	Camera.PictureCallback postviewPictureCallback;
	Camera c;

	Context context;
	int width, height;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_image_capture);

		context = getApplicationContext();

		queue = Volley.newRequestQueue(getApplicationContext());
		queue.start();
		jpegPictureCallback = new Camera.PictureCallback() {
			public void onPictureTaken(byte[] data, Camera camera) {
				File f = getOutputMediaFile(MEDIA_TYPE_IMAGE);
				try {
					FileOutputStream fos = new FileOutputStream(f);
					fos.write(data);
					fos.close();
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}

				//frameLayout = (FrameLayout) findViewById(R.id.surface_view);

				CameraPreview cameraPreview = new CameraPreview(context, c);
				frameLayout.addView(cameraPreview);
				Bitmap bm = BitmapFactory.decodeFile(f.getAbsolutePath());
				ByteArrayOutputStream baos = new ByteArrayOutputStream();
				bm.compress(Bitmap.CompressFormat.JPEG, 100, baos); //bm is the bitmap object
				byte[] b = baos.toByteArray();
				String encodedImage = Base64.encodeToString(b, Base64.DEFAULT);

				JSONArray jsonArray = new JSONArray();
				jsonArray.put(encodedImage);
				JSONObject jsonObject = new JSONObject();
				try {
					jsonObject.put("picture", jsonArray);
					//TODO
					jsonObject.put("game_name", gameId);
				} catch (JSONException e) {
					e.printStackTrace();
				}
				//System.out.println("Sending picture to python server");
				//Toast.makeText(context, "Send picture", Toast.LENGTH_SHORT).show();
				JsonObjectRequest jsonObjectRequest =
						new JsonObjectRequest(Request.Method.POST, url, jsonObject, new Response.Listener<JSONObject>() {
							@Override
							public void onResponse(JSONObject response) {
								System.out.println(response.toString());
							}
						}, new Response.ErrorListener() {
							@Override
							public void onErrorResponse(VolleyError error) {
								System.out.println("Bledna odpowiedz z serwera");
								error.printStackTrace();
							}
						});
				queue.add(jsonObjectRequest);
			}
		};

		postviewPictureCallback = new Camera.PictureCallback() {
			public void onPictureTaken(byte[] data, Camera camera) {
				System.out.println("Jpeg picture taken");
				System.out.println("width: " + width + ", height: " + height);
				System.out.println("byte size: " + data.length + " picture size: " + width * height);
				Toast.makeText(context, "Send picture", Toast.LENGTH_SHORT).show();
			}
		};

		c = Camera.open(0); // attempt to get a Camera instance
		Camera.Parameters params = c.getParameters();
		params.setPictureSize(1600, 1200);
		c.setParameters(params);
		c.setDisplayOrientation(90);
		frameLayout = (FrameLayout) findViewById(R.id.surface_view);

		CameraPreview cameraPreview = new CameraPreview(context, c);
		frameLayout.addView(cameraPreview);

		//SurfaceHolder surfaceHolder = surfaceView.getHolder();
		//c.setPreviewDisplay(surfaceHolder);
		//c.startPreview();

	}

	@Override
	protected void onDestroy() {
		if (c != null) {
			c.release();
		}
		if (pictureScheduledFuture != null) {
			pictureScheduledFuture.cancel(true);
		}
		if (scheduler != null) {
			scheduler.shutdown();
		}

		if (queue != null) {
			queue.stop();
			queue.getCache().clear();
		}

		super.onDestroy();
	}
}
