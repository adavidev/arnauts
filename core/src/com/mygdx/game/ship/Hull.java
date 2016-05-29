package com.mygdx.game.ship;

/**
 * Created by Alan on 4/18/2016.
 */
public class Hull extends Tile {
    public Hull(){
        this(null);
    }

    public Hull(Ship ship) {
        super(ship);
        HullRenderObject ro = new HullRenderObject(this);
        type = TileType.Hull;
    }
}
