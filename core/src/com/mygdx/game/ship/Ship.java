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
    private ArrayList<Interactable> interactables;

    public Ship() {
        super();
        interactables = new ArrayList<Interactable>();
        shipTiles = new TDArray<Tile>();
    }

    @Override
    public void load() {

    }

    public void addTile(Tile tile, int x, int y){
        shipTiles.addToInnerArray(x,y,tile);
        nodes.add(tile);
        tile.parent(this);
        tile.setPos(x,y);

        tile.check(this);
    }

    public Tile getFromGlobal(){
        return null;
    }

    public Tile get(Vector3 pos) {
        return get(((int) pos.x / 25), ((int) pos.y / 50));
    }

    public Tile get(int x, int y){
        Tile tile;
        try {
            tile = shipTiles.get(x,y);
        } catch (Exception e){
            tile = new Space();
        }

        if(tile == null){
            tile = new Space();
        }

        return tile;
    }

    public void addInteractable(Interactable interactable, int x, int y){
        nodes.add(interactable);
        interactables.add(interactable);
        interactable.parent(this);
        interactable.setPos(x,y);

        interactable.check(this);
    }

    public Interactable getInteractable(int x, int y) {
        Interactable interactable = null;
        Vector2 find = new Vector2(x,y);

        for (Interactable inter : interactables) {
            if (inter.coordinates.contains(find))
                interactable = inter;
        }

        if (interactable == null){
            interactable = new NoInteraction();
        }

        return interactable;
    }

}
