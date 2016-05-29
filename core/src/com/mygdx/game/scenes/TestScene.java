package com.mygdx.game.scenes;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.Main;
import com.mygdx.game.characters.Captain;
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

        Hunter e = new Hunter();
        Captain h = new Captain();
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

                if (Gdx.input.isButtonPressed(Input.Buttons.LEFT)){
//                    System.out.println(nodes);
//                    System.out.println("X:" + globalPos.x + " Y:" + globalPos.y);
                    Main.cam.clicks.add(new Vector3(Main.cam.globalMousePos().x, Main.cam.globalMousePos().y, 0));
                    Tile what = ((Ship)nodes.get(0)).getGlobal(Main.cam.globalMousePos());
                    if (what.type == TileType.None){
                        ship.addGlobal(new Corridor(ship), Main.cam.globalMousePos());
                    }
                }

                if ( Gdx.input.isKeyPressed(Input.Keys.L)){
                    Tile what = ((Ship)nodes.get(0)).getGlobal(Main.cam.globalMousePos());
                    if (what.type == TileType.Walkable){
                        ship.addGlobalInteractable(new Ladder(ship), Main.cam.globalMousePos());
                    }
                }

                for(NodeHolder node : nodes){


                    if ( Gdx.input.isKeyPressed(Input.Keys.E)){
                        node.rot++;
                    }
                    if ( Gdx.input.isKeyPressed(Input.Keys.Q)){
                        node.rot--;
                    }
                    if (Gdx.input.isButtonPressed(Input.Buttons.LEFT)){
//                        System.out.println(nodes);
//                    System.out.println("X:" + globalPos.x + " Y:" + globalPos.y);

//                        System.out.println("X:" + Main.cam.globalMousePos().x + " Y:" + Main.cam.globalMousePos().y);
//                        System.out.println("Tile:" + what.globalPos);
//                        System.out.println("Tile should be:" + ((Ship)node).nodes.get(0).pos);
                    }

                }

                super.render();
            }
        };
        ship = new Ship();
        ship.addTile(new Corridor(ship), 0, 0);
        ship.addTile(new Corridor(ship), 2, 2);
        ship.addTile(new Corridor(ship), 4, 2);
        ship.addTile(new Corridor(ship), 3, 2);
        ship.addTile(new Corridor(ship), 5, 2);
        ship.addTile(new Corridor(ship), 6, 2);
//        ship.addTile(new Walkable(), 1, 2);
        ship.addTile(new Corridor(ship), 1, 1);
        ship.addTile(new Corridor(ship), 3, 1);
        ship.addTile(new Corridor(ship), 2, 1);
//        ship.addTile(new CleanCorridor(ship), 4, 1);
        ship.addTile(new CleanCorridor(ship), 5, 1);
        ship.addTile(new CleanCorridor(ship), 6, 1);
        ship.addTile(new CleanCorridor(ship), 7, 1);
        ship.addTile(new Hull(ship), 1, 2);
        ship.addTile(new Hull(ship), 7, 2);
        ship.addTile(new Hull(ship), 2, 3);
        ship.addTile(new Hull(ship), 8, 1);
        ship.addTile(new Hull(ship), 4, 1);

        ship.addInteractable(new Ladder(ship), 3,1);
        ship.addInteractable(new Ladder(ship), 3,2);

        ship.pos.add(-100,-100,0);

        e.pos.add(25,50,0);
        h.pos.add(65,100,0);

        ship.add(e);
        ship.add(h);

        thing.add(ship);

        super.load();
    }

}
