package com.mygdx.game.characters.AI;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.characters.State.Stand;
import com.mygdx.game.core.ARandom;
import com.mygdx.game.ship.TileType;

import java.util.ArrayList;

/**
 * Created by al on 5/10/2016.
 */
public class RandomTravelAI extends AI {

    public float stateTime;
    public float checkTime = 0;
    Vector3 target;
    private ArrayList<Astar.ANode> available;
    private ArrayList<Astar.ANode> path;


    public RandomTravelAI(GameCharacter node) {
        super(node);
        target = null;
        checkTime = 3;
        path = new ArrayList<Astar.ANode>();
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

        travelTo();


        checkTime-= Gdx.graphics.getDeltaTime();
    }

    private void setTarget() {
        Astar astar = new Astar(node);
        available = astar.available();
        Astar.ANode targetTile = available.get(ARandom.rand((int) System.currentTimeMillis(), available.size()));
//        target = targetTile.basicCenter();

        path = astar.findTarget(targetTile.current);
        target = path.get(0).basicCenter();
    }

    public void waitRandom(){
        System.out.println("Available: " + new Astar(node).available());
//        System.out.println("Tile Position: " + node.currentTile().getCenter());

        checkTime = ARandom.rand((int) System.currentTimeMillis(), 4) + 3;

    }

    private void travelTo() {
        if (path.size() >  0){
            if(path.get(0).type == TileType.Walkable){
                walkTo();
            }else if(path.get(0).type == TileType.Climbable){
                climbTo();
            }
        }
    }

    private void climbTo() {
        Vector3 rpos = new Vector3(target);
        Vector3 npos = new Vector3(node.basicCenter());
        if (rpos.y > npos.y + 1){
            node.state.climbUp();
        } else if(rpos.y < npos.y - 1) {
            node.state.climbDown();
        }else
        {
            node.state.stand();
            path.remove(path.get(0));
            if (path.size() > 0)
                target = path.get(0).basicCenter();
        }
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
            path.remove(path.get(0));
            if (path.size() > 0)
                target = path.get(0).basicCenter();
        }
    }
}
