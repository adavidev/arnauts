package com.mygdx.game.ship;

import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;

/**
 * Created by al on 4/7/2016.
 */
public abstract class Tile extends GameNode {
    public float width = 25;
    public float height = 50;
    public int x;
    public int y;
    public TileType type = TileType.None;

    public Tile(NodeHolder o) {
        super(o);
    }

    public Tile(){
        super();
    }

    public void check(Ship ship) {

    }
}
