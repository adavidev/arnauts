package com.mygdx.game.core;

import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.ship.Ship;
import com.mygdx.game.ship.Tile;
import com.mygdx.game.ship.TileType;

import java.util.ArrayList;

/**
 * Created by al on 5/11/2016.
 */
public class Astar {

    public Ship ship;
    public ArrayList<Tile> nodeList;
    public GameCharacter character;

    public Astar(GameCharacter character){
        ship = (Ship)character.currentTile().parent;
        this.character = character;
        nodeList = new ArrayList<Tile>();
    }

    public ArrayList<Tile> available(){
        Tile current = character.currentTile();
        nodeList.clear();
        nodeList.add(current);
        return build(nodeList);
    }

    public ArrayList<Tile> build(ArrayList<Tile> searchList){
        ArrayList<Tile> toAdd = new ArrayList<Tile>();
        if(character.currentTile().type == TileType.Walkable) {
            for (Tile tile : searchList) {
                Tile up = ship.get(tile.x, tile.y + 1);
                Tile down = ship.get(tile.x, tile.y - 1);
                Tile left = ship.get(tile.x - 1, tile.y);
                Tile right = ship.get(tile.x + 1, tile.y);

                if (left.type == TileType.Walkable && !searchList.contains(left)) {
                    toAdd.add(left);
                }
                if (right.type == TileType.Walkable && !searchList.contains(right)) {
                    toAdd.add(right);
                }
            }
        }
        if (toAdd.isEmpty())
            return searchList;
        else{
            searchList.addAll(toAdd);
            return build(searchList);
        }

    }

    private class ANode extends Tile {
        public ANode(Tile tile, Tile previous, GAction action) {
        }
    }
}
