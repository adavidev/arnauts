package com.mygdx.game.core;

import com.mygdx.game.characters.State.State;

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
