package com.mygdx.game.characters.State;

import com.mygdx.game.characters.GameCharacter;

public class WalkingRight extends State {
    public WalkingRight(GameCharacter character) {
        super(character);
    }

    public void stand() {
        character.state = new Stand(character);
    }
    public void runLeft() {}
    public void runRight() {}
    public void walkLeft() {}
    public void walkRight() {}

    @Override
    public void climbUp() {

    }

    @Override
    public void climbDown() {

    }
}
