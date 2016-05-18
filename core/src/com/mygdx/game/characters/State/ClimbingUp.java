package com.mygdx.game.characters.State;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.core.NodeHolder;

/**
 * Created by al on 5/17/2016.
 */
public class ClimbingUp extends State {
    public ClimbingUp(GameCharacter character) {
        super(character);
    }

    @Override
    public void stand() {character.state = new Stand(character);}

    @Override
    public void runLeft() {}

    @Override
    public void runRight() {}

    @Override
    public void walkLeft() {}

    @Override
    public void walkRight() {}

    @Override
    public void climbUp() {
        Vector3 sub = new Vector3(0,-.3f,0);
        sub.rotate(NodeHolder.rotAxis,character.globalRot);
        character.pos.add(sub);
    }

    @Override
    public void climbDown() {character.state = new Stand(character);}
}
