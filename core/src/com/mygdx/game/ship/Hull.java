package com.mygdx.game.ship;

/**
 * Created by Alan on 4/18/2016.
 */
public class Hull extends Tile {
    public Hull(){
        HullRenderObject ro = new HullRenderObject(this);
        type = TileType.Hull;
    }
}
