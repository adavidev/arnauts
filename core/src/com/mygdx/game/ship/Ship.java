package com.mygdx.game.ship;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.core.TDArray;

import java.util.ArrayList;

/**
 * Created by al on 4/7/2016.
 */
public class Ship extends NodeHolder {
    public TDArray<Tile> shipTiles;

    public Ship() {
        super();

        shipTiles = new TDArray<Tile>();
    }

    @Override
    public void load() {

    }

    public void addTile(Tile tile, int x, int y){
        shipTiles.addToInnerArray(x,y,tile);
        nodes.add(tile);
        tile.parent = this;
        tile.x = x;
        tile.y = y;
        tile.pos.x = x * tile.width;
        tile.pos.y = y * tile.height;

        tile.check(this);
    }

    public Tile get(Vector3 pos) {
        return shipTiles.get(((int) pos.x / 25), ((int) pos.y / 25));
    }

    public Tile get(int x, int y){
        Tile tile = shipTiles.get(x,y);
        if(tile == null){
            tile = new Space();
        }

        return tile;
    }

}
