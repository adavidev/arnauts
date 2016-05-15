package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.ARandom;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.ship.Ship;
import com.mygdx.game.ship.Tile;
import com.mygdx.game.ship.TileType;

/**
 * Created by al on 5/10/2016.
 */
public class RandomWalkAI extends AI {

    public float stateTime;
    public float checkTime = 0;
    Vector3 target;

    public RandomWalkAI(GameCharacter node) {
        super(node);
        target = new Vector3(25,0,0);
        checkTime = 3;
    }

    @Override
    public void update() {
        stateTime += Gdx.graphics.getDeltaTime();

        if (checkTime <= 0 && node.state.getClass() == Stand.class){

            waitRandom();

            setTarget();
        }

        walkTo();


        checkTime-= Gdx.graphics.getDeltaTime();
    }

    private void setTarget() {
        target = new Vector3(5, 0, 0).add(node.basicPos());
    }

    public void waitRandom(){
//        System.out.println("Im standing on: " + node.currentTile().toString());
//        System.out.println("Tile Position: " + node.currentTile().getCenter());

        checkTime = 5;

    }

    public void walkTo(){
        Vector3 rpos = new Vector3(target);
        Vector3 npos = new Vector3(node.basicPos());
        if (rpos.x > npos.x + 1){
            node.state.runRight();
        } else if(rpos.x < npos.x - 1) {
            node.state.runLeft();
        }else
        {
            node.state.stand();
        }
//        get relative direction
//        walk relative direction
//        if I am at the position, i stop, otherwise keep walking
    }
}
