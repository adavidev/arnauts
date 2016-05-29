package com.mygdx.game;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.mygdx.game.core.RenderManager;
import com.mygdx.game.core.Scene;
import com.mygdx.game.scenes.TestScene;

public class Main extends ApplicationAdapter {
	Scene scene;
	public static GameCam cam;// = new GameCam(640/2,480/2);
	static RenderManager rman;// = new RenderManager(cam);

	@Override
	public void create () {
		scene = new TestScene();
        scene.set();

		cam = new GameCam(640/2,480/2);

		rman = new RenderManager(cam);
		rman.load(new SpriteBatch());

		scene.load();
	}

	@Override
	public void render () {
		scene.render();
		rman.render();
	}
}
