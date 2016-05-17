package com.mygdx.game.characters;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.ship.Ship;
import com.mygdx.game.ship.Tile;
import com.mygdx.game.ship.TileType;

/**
 * Created by Alan on 3/29/2016.
 */
public abstract class GameCharacter extends GameNode {
    public float walkSpeed = .5f;
    public float climbSpeed = .3f;
    public AI ai;

    public GameCharacter()
    {
        super();
        height = 50;
        width = 50;
    }



    public boolean at(TileType type){
        return type == ((Ship) parent).get(new Vector3(pos).add(center)).type;
    }

    public boolean at(Tile tile){
        return tile == ((Ship) parent).get(new Vector3(pos).add(center));
    }

    public Tile currentTile(){
        return ((Ship) parent).get(new Vector3(pos).rotate(NodeHolder.rotAxis, - globalRot).add(center));
    }
}
