package com.mygdx.game.ship;

import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.Astar;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;

import java.util.ArrayList;

/**
 * Created by al on 5/17/2016.
 */
public abstract class Interactable extends GameNode {
    TileType type;
    public int x;
    public int y;

    public ArrayList<Vector2> coordinates;
    public Ship ship;


    public Interactable(NodeHolder o) {
        super(o);
        type = TileType.Climbable;
        setSize(25,50);
        coordinates = new ArrayList<Vector2>();
    }

    public Interactable(){
        super();
        type = TileType.Climbable;
        coordinates = new ArrayList<Vector2>();
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
        addCoordinates();
    }

    public NodeHolder parent(){
        return parent;
    }

    public void parent(NodeHolder parent){
        this.parent = parent;
        this.ship = (Ship) parent;
    }

    protected abstract void addCoordinates();
}
