package com.mygdx.game.core;

import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.State;

import java.util.ArrayList;

/**
 * Created by Alan on 3/28/2016.
 */
public abstract class GameNode extends NodeHolder {

    public GameNode(){
        super(Scene.currentScene);
    }

    public State state;

    public GameNode(NodeHolder o) {
        super(o);
    }
}
