package com.mygdx.game.ship;

/**
 * Created by Kristen on 5/9/2016.
 */
public class Corridor extends Tile {
    public Corridor(){
        this(null);
    }

    public Corridor(Ship ship) {
        super(ship);
        CorridorRenderObject ro = new CorridorRenderObject(this);
        type = TileType.Walkable;
    }
}
