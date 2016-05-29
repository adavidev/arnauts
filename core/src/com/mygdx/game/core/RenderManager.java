package com.mygdx.game.core;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.GameCam;

import java.util.ArrayList;
import java.util.Collections;

/**
 * Created by Alan on 3/29/2016.
 */
public class RenderManager {
    public static SpriteBatch batch = null;
    public static ArrayList<RenderObject> sprites = new ArrayList<RenderObject>();
    public ShapeRenderer shapeDebugger;
    public GameCam cam;

    public RenderManager(GameCam cam){
        this.cam = cam;
        shapeDebugger=new ShapeRenderer();
    }

    public void load(SpriteBatch batch){
        this.batch = batch;

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

        Gdx.gl.glLineWidth(2);
        shapeDebugger.setProjectionMatrix(cam.combined);
        shapeDebugger.begin(ShapeRenderer.ShapeType.Line);
        shapeDebugger.setColor(1, 1, 1, 1);
        for (Vector3 click : cam.clicks){
            shapeDebugger.line(click.x, click.y,0, 0);
        }
        shapeDebugger.end();

        batch.begin();
//        Gdx.gl10.glLineWidth(10);


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
