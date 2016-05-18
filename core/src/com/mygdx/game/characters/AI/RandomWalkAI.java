package com.mygdx.game.characters.AI;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.characters.State.Stand;
import com.mygdx.game.core.ARandom;

import java.util.ArrayList;

/**
 * Created by al on 5/10/2016.
 */
public class RandomWalkAI extends AI {

    public float stateTime;
    public float checkTime = 0;
    Vector3 target;

    public RandomWalkAI(GameCharacter node) {
        super(node);
        target = null;
        checkTime = 3;
    }

    @Override
    public void update() {
        stateTime += Gdx.graphics.getDeltaTime();

        if (target == null) {
            target = node.basicCenter();
        }

        if (checkTime <= 0 && node.state.getClass() == Stand.class){

            waitRandom();

            setTarget();
        }

        walkTo();


        checkTime-= Gdx.graphics.getDeltaTime();
    }

    private void setTarget() {
        ArrayList<Astar.ANode> available = new Astar(node).available();
        target = available.get(ARandom.rand((int) System.currentTimeMillis(), available.size())).basicCenter();
    }

    public void waitRandom(){
//        System.out.println("Available: " + new Astar(node).available());
//        System.out.println("Tile Position: " + node.currentTile().getCenter());

        checkTime = ARandom.rand((int) System.currentTimeMillis(), 4) + 3;

    }

    public void walkTo(){
        Vector3 rpos = new Vector3(target);
        Vector3 npos = new Vector3(node.basicCenter());
        if (rpos.x > npos.x + 1){
            node.state.runRight();
        } else if(rpos.x < npos.x - 1) {
            node.state.runLeft();
        }else
        {
            node.state.stand();
        }
    }
}
