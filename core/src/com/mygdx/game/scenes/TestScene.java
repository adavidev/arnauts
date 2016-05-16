package com.mygdx.game.scenes;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.mygdx.game.characters.Engineer;
import com.mygdx.game.characters.Hunter;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.core.Scene;
import com.mygdx.game.ship.*;

/**
 * Created by al on 4/7/2016.
 */
public class TestScene extends Scene{
    Ship ship;

    public TestScene(){
        super();

    }

    @Override
    public void load(){

        Engineer e = new Engineer();
        Hunter h = new Hunter();
//        Tile t = new Tile();
        GameNode thing = new GameNode(){
            @Override
            public void render() {

                if ( Gdx.input.isKeyPressed(Input.Keys.W)){
                    pos.add(1,1,0);
                }
                else if ( Gdx.input.isKeyPressed(Input.Keys.S)){
                    pos.sub(1,1,0);
                }

                for(NodeHolder node : nodes){


                    if ( Gdx.input.isKeyPressed(Input.Keys.E)){
                        node.rot++;
                    }
                    if ( Gdx.input.isKeyPressed(Input.Keys.Q)){
                        node.rot--;
                    }
                }

                super.render();
            }
        };
        ship = new Ship();
        ship.addTile(new Corridor(), 2, 2);
        ship.addTile(new Corridor(), 4, 2);
        ship.addTile(new Corridor(), 3, 2);
//        ship.addTile(new Walkable(), 1, 2);
        ship.addTile(new Corridor(), 1, 1);
        ship.addTile(new Corridor(), 3, 1);
        ship.addTile(new Corridor(), 2, 1);
//        ship.addTile(new CleanCorridor(), 4, 1);
        ship.addTile(new CleanCorridor(), 5, 1);
        ship.addTile(new CleanCorridor(), 6, 1);
        ship.addTile(new CleanCorridor(), 7, 1);
        ship.addTile(new Hull(), 1, 2);
        ship.addTile(new Hull(), 5, 2);
        ship.addTile(new Hull(), 2, 3);
        ship.addTile(new Hull(), 8, 1);
        ship.addTile(new Hull(), 4, 1);
        ship.pos.add(-100,-100,0);

        e.pos.add(25,50,0);
        h.pos.add(25,100,0);

        ship.add(e);
        ship.add(h);

        thing.add(ship);

        super.load();
    }

}
