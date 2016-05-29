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
    private ArrayList<Interactable> interactAdd;

    public Ship() {
        super();
        interactables = new ArrayList<Interactable>();
        interactAdd = new ArrayList<Interactable>();
        shipTiles = new TDArray<Tile>();
    }

    @Override
    public void load() {

    }

    @Override
    public void render(){
        for (Interactable node : interactAdd){
            interactables.add(node);
        }
        interactAdd.clear();

        super.render();
    }

    public void addGlobal(Tile tile, Vector3 position){
        Vector3 normalized = new Vector3(position).sub(this.globalPos).rotate(NodeHolder.rotAxis, -this.globalRot);
        System.out.println("Trying: " + normalized);
        this.addTile(tile, ((int) normalized.x / 25), ((int) normalized.y / 50));
    }

    public void addTile(Tile tile, int x, int y){
        shipTiles.addToInnerArray(x,y,tile);

        tile.parent(this);
        tile.setPos(x,y);

        addNode(tile);

        tile.check(this);
    }

    public Tile getFromGlobal(){
        return null;
    }

    public Tile get(Vector3 pos) {
        return get(((int) pos.x / 25), ((int) pos.y / 50));
    }

    public Tile getGlobal(Vector3 globalPos) {
        Vector3 normalized = new Vector3(globalPos).sub(this.globalPos).rotate(NodeHolder.rotAxis, -this.globalRot);
//        System.out.println("Trying: " + globalPos);
//        System.out.println("Tile at: " + this.get(normalized));

        return this.get(normalized);
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
//        nodes.add(interactable);
        interactable.parent(this);
        interactable.setPos(x,y);

        addToInteracables(interactable);
        addNode(interactable);

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

    public void addGlobalInteractable(Ladder ladder, Vector3 position) {
        Vector3 normalized = new Vector3(position).sub(this.globalPos).rotate(NodeHolder.rotAxis, -this.globalRot);
        System.out.println("Trying: " + normalized);
        this.addInteractable(ladder, ((int) normalized.x / 25), ((int) normalized.y / 50));
    }

    public void addToInteracables(Interactable node) {
        interactAdd.add(node);
    }

}
