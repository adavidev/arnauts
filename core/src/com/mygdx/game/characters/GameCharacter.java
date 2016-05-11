package com.mygdx.game.characters;

import com.mygdx.game.core.GameNode;

/**
 * Created by Alan on 3/29/2016.
 */
public abstract class GameCharacter extends GameNode {
    public int walkSpeed, climbSpeed;
    public AI ai;

    public GameCharacter()
    {
        super();
    }

}
