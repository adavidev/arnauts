package com.mygdx.game;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.mygdx.game.core.RenderManager;
import com.mygdx.game.core.Scene;
import com.mygdx.game.scenes.TestScene;

public class Main extends ApplicationAdapter {
	Scene scene;
	RenderManager rman;
	
	@Override
	public void create () {
		scene = new TestScene();
        scene.set();

		rman = new RenderManager();
		rman.load(new SpriteBatch());

		scene.load();
	}

	@Override
	public void render () {
		scene.render();
		rman.render();
	}
}
