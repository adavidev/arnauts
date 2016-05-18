package com.mygdx.game.characters.AI;

import com.badlogic.gdx.math.Vector3;
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
    public ArrayList<ANode> nodeList;
    public GameCharacter character;
    public ANode target;

    public Astar(GameCharacter character){
        ship = (Ship)character.currentTile().parent;
        this.character = character;
        nodeList = new ArrayList<ANode>();
        target = null;
    }

    public ArrayList<ANode> available(){
        ANode current = new ANode(character.currentTile(), null, character.currentTile().type);
        nodeList.clear();
        nodeList.add(current);
        return build(nodeList);
    }

    public ArrayList<ANode> build(ArrayList<ANode> searchList){
        ArrayList<ANode> toAdd = new ArrayList<ANode>();
        if(character.currentTile().type == TileType.Walkable) {
            for (ANode tile : searchList) {
                ANode up = new ANode(ship.get(tile.x(), tile.y() + 1), tile, TileType.Climbable);
                ANode down = new ANode(ship.get(tile.x(), tile.y() - 1), tile, TileType.Climbable);
                ANode left = new ANode(ship.get(tile.x() - 1, tile.y()), tile, ship.get(tile.x() - 1, tile.y()).type);
                ANode right = new ANode(ship.get(tile.x() + 1, tile.y()), tile, ship.get(tile.x() + 1, tile.y()).type);

                if (left.isType(TileType.Walkable) && !searchList.contains(left)) {
                    toAdd.add(left);
                }
                if (right.isType(TileType.Walkable) && !searchList.contains(right)) {
                    toAdd.add(right);
                }
                if (up.isType(TileType.Climbable) && tile.isType(TileType.Climbable) && !searchList.contains(up)) {
                    toAdd.add(up);
                }
                if (down.isType(TileType.Climbable) && tile.isType(TileType.Climbable) && !searchList.contains(down)) {
                    toAdd.add(down);
                }
            }
        }
        if (toAdd.isEmpty() || target != null && searchList.contains(target))
            return searchList;
        else{
            searchList.addAll(toAdd);
            return build(searchList);
        }

    }

    public ArrayList<ANode> findTarget(Tile tile){
        target = new ANode(tile, null, tile.type);
        ANode current = new ANode(character.currentTile(), null, character.currentTile().type);
        nodeList.clear();
        nodeList.add(current);
        build(nodeList);

        ANode foundTarget = nodeList.get(nodeList.indexOf(target));

        return createPath(foundTarget);
    }

    private ArrayList<ANode> createPath(ANode foundTarget){
        TileType last = foundTarget.type;
        int index = nodeList.indexOf(foundTarget);

        ArrayList<ANode> path = new ArrayList<ANode>();
        ANode current = foundTarget;

        while (current != null){
            path.add(0, current);
            current = current.previous;
        }

        return path;
    }

    public class ANode {
        public Tile current;
        public ANode previous;
        public TileType type;

        public ANode(Tile tile, ANode previous, TileType action) {
            current = tile;
            this.previous = previous;
            type = action;
        }

        public int x() {
            return current.x;
        }

        public int y() {
            return current.y;
        }

        public Vector3 basicCenter() {
            return current.basicCenter();
        }

        public boolean equals(Object o){
            if (o instanceof ANode){
                ANode temp = (ANode)o;
                if (this.current.equals(temp.current))
                    return true;
            }
            return false;
        }

        public boolean isType(TileType walkable) {
            return current.isType(walkable);
        }
    }
}
