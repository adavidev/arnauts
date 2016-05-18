package com.mygdx.game.characters.AI;

import com.mygdx.game.characters.GameCharacter;

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
