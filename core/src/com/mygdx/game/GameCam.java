package com.mygdx.game;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;

import java.util.ArrayList;

/**
 * Created by al on 5/19/2016.
 */
public class GameCam extends OrthographicCamera {

    public ArrayList<Vector3> clicks;

    public GameCam(int i, int i1) {
        super(i,i1);
        clicks = new ArrayList<Vector3>();
    }

    public Vector3 globalMousePos(){
        return this.unproject(new Vector3(Gdx.input.getX(), Gdx.input.getY(), 0));
//        return new Vector2(Gdx.input.getX(), -Gdx.input.getY()).add(this.position.x, this.position.y).add(-this.viewportWidth, this.viewportHeight).scl(.5f);
    }
}
