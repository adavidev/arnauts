package com.mygdx.game.characters.State;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.core.NodeHolder;

/**
 * Created by Alan on 4/2/2016.
 */
public abstract class State {

    public GameCharacter character;

    public State(GameCharacter character){
        this.character = character;
    }

    public abstract void stand();
    public abstract void runLeft();
    public abstract void runRight();
    public abstract void walkLeft();
    public abstract void walkRight();
    public abstract void climbUp();
    public abstract void climbDown();

}

