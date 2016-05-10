package com.mygdx.game.ship;

import com.mygdx.game.core.GameNode;

/**
 * Created by al on 4/7/2016.
 */
public abstract class Tile extends GameNode {
    public float width = 25;
    public float height = 50;
    public int x;
    public int y;
    public TileType type = TileType.None;

}
