package com.mygdx.game.scenes;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.mygdx.game.characters.Engineer;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.core.Scene;
import com.mygdx.game.ship.Corridor;
import com.mygdx.game.ship.Ship;
import com.mygdx.game.ship.Tile;

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
        ship.addTile(new Corridor(), 1, 2);
        ship.addTile(new Corridor(), 1, 1);
        ship.addTile(new Corridor(), 3, 1);
        ship.addTile(new Corridor(), 2, 1);
        ship.pos.add(-100,-100,0);

        e.pos.add(25,50,0);
        ship.add(e);

        thing.add(ship);

        super.load();
    }

}
