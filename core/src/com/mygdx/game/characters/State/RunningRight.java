package com.mygdx.game.characters.State;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.GameCharacter;
import com.mygdx.game.core.NodeHolder;

public class RunningRight extends State {
    public RunningRight(GameCharacter character) {
        super(character);
    }

    public void stand() {
        character.state = new Stand(character);
    }
    public void runLeft() { character.state = new Stand(character); }
    public void runRight() {
        Vector3 sub = new Vector3(character.walkSpeed,0,0);
        sub.rotate(NodeHolder.rotAxis,character.globalRot);
        character.pos.add(sub);
    }
    public void walkLeft() {}
    public void walkRight() {}

    @Override
    public void climbUp() {

    }

    @Override
    public void climbDown() {

    }
}
