package com.mygdx.game.ship;

import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderObject;

/**
 * Created by al on 4/7/2016.
 */
public class Tile extends GameNode {
    public float width = 25;
    public float height = 50;
    public int x;
    public int y;
    public TileType type = TileType.None;

    public Tile(){
        TileRenderObject ro = new TileRenderObject(this);
    }
}
