package com.mygdx.game.scenes;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.Main;
import com.mygdx.game.characters.Captain;
import com.mygdx.game.characters.Hunter;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.NodeHolder;
import com.mygdx.game.core.Scene;
import com.mygdx.game.ship.*;

/**
 * Created by al on 4/7/2016.
 */
public class ShipBuilderScene extends Scene{
    Ship ship;

    public ShipBuilderScene(){
        super();

    }

    @Override
    public void load(){

        GameNode thing = new GameNode(){
            @Override
            public void render() {

                super.render();
            }
        };
        ship = new Ship();

        ship.pos.add(-1000,-1000,0);
        thing.add(ship);

        super.load();
    }

}
