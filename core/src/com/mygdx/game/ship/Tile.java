package com.mygdx.game.ship;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;

/**
 * Created by al on 4/7/2016.
 */
public abstract class Tile extends GameNode {

    public int x;
    public int y;
    public TileType type = TileType.None;

    public Tile(NodeHolder o) {
        super(o);

        setSize(25,50);
    }

    public Tile(){
        super();

        setSize(25,50);
    }

    public void check(Ship ship) {

    }

    public void setPos(int x, int y) {
        this.x = x;
        this.y = y;
        this.pos.x = x * width;
        this.pos.y = y * height;
        this.localpos = new Vector3(pos);
    }
}
