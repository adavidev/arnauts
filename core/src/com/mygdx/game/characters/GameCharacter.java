package com.mygdx.game.characters;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.ship.Ship;
import com.mygdx.game.ship.Tile;
import com.mygdx.game.ship.TileType;

/**
 * Created by Alan on 3/29/2016.
 */
public abstract class GameCharacter extends GameNode {
    public int walkSpeed, climbSpeed;
    public AI ai;
    public Vector3 center = Vector3.Zero;

    public GameCharacter()
    {
        super();
    }



    public boolean at(TileType type){
        return type == ((Ship) parent).get(new Vector3(pos).add(center)).type;
    }

    public boolean at(Tile tile){
        return tile == ((Ship) parent).get(new Vector3(pos).add(center));
    }

    public Tile currentTile(){
        return ((Ship) parent).get(new Vector3(pos).add(center));
    }
}
