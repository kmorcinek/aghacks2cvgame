package aghacks2cvgame;

import java.awt.EventQueue;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.Timer;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

class DrawPanel extends JPanel {
	BufferedImage[] puzzle = new BufferedImage[12];
	BufferedImage sourceImage;
	Image[] texturePaint = new Image[12];
	Main reference;

	public DrawPanel(Main ref) {
		reference = ref;
		loadImages();
	}

	private boolean loadImages() {
		try {
			File f = new File("/home/lukasz/Programowanie/hackaton/obraz.jpg");
			sourceImage = ImageIO.read(f);
			// sourceImage.getScaledInstance(800, 600, Image.SCALE_DEFAULT);
			for (int i = 0; i < 12; i++) {
				puzzle[i] = sourceImage.getSubimage(99 * (i % 4), 99 * (i / 4),
						99, 99);
			}

			return true;
		} catch (IOException ex) {
			return false;
		}
	}

	@Override
	public void paintComponent(Graphics g) {
		super.paintComponent(g);
		doDrawing(g);
	}

	private void doDrawing(Graphics g) {
		Graphics2D g2d = (Graphics2D) g;
		for (int i = 0; i < 12; i++) {
			int x = reference.xs[i];
			int y = reference.ys[i];
			g2d.drawImage(puzzle[i], x, y, null);
		}
		System.out.println("Repainting window");
	}
}

public class Main extends JFrame implements ActionListener {
	int detected_elements = 0;
	int last_detected_elements = 0;
	int[] ids = new int[50];
	int[] pic_ids = new int[50];
	int[] xs = new int[50];
	int[] ys = new int[50];
	Object object = this;
	Timer timer;
	DrawPanel dpnl;

	public Main() {
		initUI();
	}

	private void initUI() {
		read_coordinates(true);
		dpnl = new DrawPanel(this);
		add(dpnl);
		setTitle("Puzzle");
		setSize(1000, 800);
		setLocationRelativeTo(null);
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		timer = new Timer(1000, this);
		timer.setInitialDelay(0);
		timer.start();
	}

	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			@Override
			public void run() {
				Main ex = new Main();
				ex.setVisible(true);
			}
		});
	}

	private void read_coordinates(boolean setup) {
		Client client = ClientBuilder.newClient();
		WebTarget target = client.target("http://178.62.103.235").path(
				"detector");
		Form form = new Form();
		form.param("game_name", "qwerty");
		String response = target.request(MediaType.APPLICATION_JSON_TYPE)
				.post(Entity.entity(form,
						MediaType.APPLICATION_FORM_URLENCODED_TYPE),
						String.class);
		try {
			JSONArray jsonArray = new JSONArray(response);
			if (setup) {
				if (jsonArray.length() > 50) {
					System.out.println("Zbyt dużo znaczników");
				} else {
					detected_elements = jsonArray.length();
				}
			}
			if (detected_elements != jsonArray.length()) {
				System.out.println("Can't recognise all elements");
				return;
			}
			for (int i = 0; i < jsonArray.length(); i++) {
				JSONObject jsonObj = jsonArray.getJSONObject(i);
				if (setup) {
					pic_ids[i] = jsonObj.getInt("id");
				}
				ids[i] = jsonObj.getInt("id");
				JSONArray positions = jsonObj.getJSONArray("positions");
				int[] coords = new int[2];
				for (int j = 0; j < 4; j++) {
					JSONObject tmp = positions.getJSONObject(j);
					coords[0] += tmp.getInt("x");
					coords[1] += tmp.getInt("y");
				}
				xs[i] = coords[0] / 4;
				ys[i] = coords[1] / 4;
			}
			System.out.println("Parsed json object");
		} catch (JSONException e) {
			e.printStackTrace();
		}

		for (int i = 0; i < 12; i++) {
			System.out.println("Marker " + i + " position: " + xs[i] + ","
					+ ys[i]);
		}
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		// TODO Auto-generated method stub
		read_coordinates(false);
		dpnl.repaint();
	}
}
