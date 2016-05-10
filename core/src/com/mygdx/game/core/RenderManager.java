package com.mygdx.game.core;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

import java.util.ArrayList;
import java.util.Collections;

/**
 * Created by Alan on 3/29/2016.
 */
public class RenderManager {
    public static SpriteBatch batch = null;
    public static ArrayList<RenderObject> sprites = new ArrayList<RenderObject>();
    public OrthographicCamera cam;

    public void load(SpriteBatch batch){
        this.batch = batch;
        cam = new OrthographicCamera(640/2
                ,480/2);
        cam.position.set(0,0,0);
        cam.update();
    }

    public void render(){
        if (Gdx.input.isKeyPressed(Input.Keys.LEFT)) {
            cam.translate(-3, 0, 0);
        }
        if (Gdx.input.isKeyPressed(Input.Keys.RIGHT)) {
            cam.translate(3, 0, 0);
        }
        if (Gdx.input.isKeyPressed(Input.Keys.DOWN)) {
            cam.translate(0, -3, 0);
        }
        if (Gdx.input.isKeyPressed(Input.Keys.UP)) {
            cam.translate(0, 3, 0);
        }
        cam.update();
        batch.setProjectionMatrix(cam.combined);

        Gdx.gl.glClearColor(.2f, .2f, .2f, 1);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

        batch.begin();

        for (RenderObject sprite : sprites){
            sprite.draw(batch);
        }

        batch.end();
    }

    public static void add(RenderObject renderObject) {
        sprites.add(renderObject);
        Collections.sort(sprites);
    }

    public static void sort(){
        Collections.sort(sprites);
    }


}
