package com.mygdx.game.core;

import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.ship.Tile;

import java.util.ArrayList;

/**
 * Created by al on 5/11/2016.
 */
public class Astar {

    ArrayList<GameNode> nodeList;

    public Astar(GameCharacter character){
        Tile current = character.currentTile();
    }
}
