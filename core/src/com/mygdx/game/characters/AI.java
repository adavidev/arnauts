package com.mygdx.game.characters;

import com.mygdx.game.core.NodeHolder;

/**
 * Created by al on 5/10/2016.
 */
public abstract class AI {
    GameCharacter node;

    public AI(GameCharacter node){
        this.node = node;
    }

    public abstract void update();


}
