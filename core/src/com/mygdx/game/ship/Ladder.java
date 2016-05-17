package com.mygdx.game.ship;

import com.badlogic.gdx.math.Vector2;

/**
 * Created by al on 5/17/2016.
 */
public class Ladder extends Interactable {
    public Ladder(){
        type = TileType.Climbable;
        LadderRenderObject lr = new LadderRenderObject(this);
    }

    @Override
    protected void addCoordinates() {
        coordinates.add(new Vector2(x,y));
    }
}
