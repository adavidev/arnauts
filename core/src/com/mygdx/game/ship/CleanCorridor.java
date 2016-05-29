package com.mygdx.game.ship;

/**
 * Created by Kristen on 5/9/2016.
 */
public class CleanCorridor extends Tile {
    public CleanCorridor(){
        this(null);
    }

    public CleanCorridor(Ship ship) {
        super(ship);
        CleanCorridorRenderObject ro = new CleanCorridorRenderObject(this);
        type = TileType.Walkable;
    }
}
