package com.mygdx.game.ship;

/**
 * Created by al on 5/17/2016.
 */
public class NoInteraction extends Interactable {
    public NoInteraction(){
        super(null);
        type = TileType.None;
    }

    @Override
    protected void addCoordinates() {

    }
}
